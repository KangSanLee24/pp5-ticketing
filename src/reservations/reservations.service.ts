import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/users/entities/user.entity";
import { Connection, Repository } from "typeorm";
import { Reservation } from "./entities/reservation.entity";
import { ShowDetail } from "src/shows/entities/show-detail.entity";
import _ from "lodash";
import { RESERVATION_STATUS } from "./types/reservation-status.type";

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Reservation)
    private readonly reservationsRepository: Repository<Reservation>,
    @InjectRepository(ShowDetail)
    private readonly showDetailsRepository: Repository<ShowDetail>,
    private connection: Connection,
  ) {}

  async createReservation({ showDetailId, userId }: { showDetailId: number; userId: number }) {
    // DTO 통과한게 아니여서 showDetailId는 체크해야된다.
    if (_.isNil(showDetailId) || !_.isNumber(showDetailId)) {
      throw new NotFoundException("공연 상세 ID를 알맞게 입력해 주세요.");
    }

    // showDetailId에 해당되는 공연이 있는지, 남은 좌석이 있는지 확인
    const showDetail: ShowDetail | null = await this.showDetailsRepository.findOne({
      where: { id: showDetailId },
      relations: ["show"],
    });

    if (_.isNil(showDetail)) {
      throw new NotFoundException("해당 공연이 존재하지 않습니다.");
    }
    if (showDetail.reservatedSeat >= showDetail.seat) {
      throw new NotFoundException("예매 가능한 좌석이 남아있지 않습니다.");
    }

    // userId에 해당되는 사용자의 point가 show의 가격보다 충분한지
    const user: User | null = await this.usersRepository.findOne({ where: { id: userId } });
    const { price } = showDetail.show;
    if (_.isNil(user)) {
      throw new NotFoundException("해당 사용자가 존재하지 않습니다.");
    }
    if (user.point < price) {
      throw new NotFoundException("사용자의 금액이 부족합니다.");
    }

    // IsolationLevel = "READ UNCOMMITTED" | "READ COMMITTED" | "REPEATABLE READ" | "SERIALIZABLE";
    const reservationTransaction = await this.connection.manager.transaction(
      "SERIALIZABLE",
      async (transactionalEntityManager) => {
        const reservation: Reservation = transactionalEntityManager.create(Reservation, {
          showDetail,
          user,
        });
        // 예매 생성
        await transactionalEntityManager.save(reservation);

        // 예매 완료시 사용자의 point - price
        await transactionalEntityManager.update(
          User,
          { id: userId },
          { point: user.point - price },
        );

        // 예매 완료시 showDetail의 reservatedSeat +1
        await transactionalEntityManager.update(
          ShowDetail,
          { id: showDetailId },
          { reservatedSeat: showDetail.reservatedSeat + 1 },
        );

        return reservation;
      },
    );

    // 성형
    const response = {
      id: reservationTransaction.id,
      status: reservationTransaction.status,
      createdAt: reservationTransaction.createdAt,
      updatedAt: reservationTransaction.updatedAt,
      shows: {
        showId: showDetail.show.id,
        showDetailId: showDetail.id,
        title: showDetail.show.title,
        category: showDetail.show.category,
        location: showDetail.show.location,
        price: showDetail.show.price,
        showDate: showDetail.showDate,
      },
    };

    return response;
  }

  async getReservations({ userId }: { userId: number }) {
    if (_.isNil(userId)) {
      throw new NotFoundException("사용자 ID가 존재하지 않습니다.");
    }

    // QueryBuilder
    const reservations: Reservation[] = await this.reservationsRepository
      .createQueryBuilder("reservation")
      .innerJoinAndSelect("reservation.showDetail", "showDetail")
      .innerJoinAndSelect("showDetail.show", "show")
      .where("reservation.userId = :userId", { userId })
      .getMany();

    if (_.isEmpty(reservations)) {
      throw new NotFoundException("예매 내역이 존재하지 않습니다.");
    }

    // 성형
    const response = reservations.map((reservation) => ({
      id: reservation.id,
      status: reservation.status,
      createdAt: reservation.createdAt,
      updatedAt: reservation.updatedAt,
      shows: {
        showId: reservation.showDetail.show.id,
        showDetailId: reservation.showDetail.id,
        title: reservation.showDetail.show.title,
        category: reservation.showDetail.show.category,
        location: reservation.showDetail.show.location,
        price: reservation.showDetail.show.price,
        showDate: reservation.showDetail.showDate,
      },
    }));

    return response;
  }

  async cancelReservation({ reservationId, userId }: { reservationId: number; userId: number }) {
    // DTO를 통해 받은게 아니여서 reservationId는 체크해야한다.
    if (_.isNil(reservationId) || !_.isNumber(reservationId)) {
      throw new NotFoundException("예매 ID를 알맞게 입력해 주세요.");
    }

    // 존재하는 사용자 ID냐?
    const user: User | null = await this.usersRepository.findOne({ where: { id: userId } });
    if (_.isNil(user)) {
      throw new NotFoundException("해당 사용자가 존재하지 않습니다.");
    }

    // Row query
    const reservation: Reservation | null = await this.reservationsRepository.query(
      `
      SELECT
        reservation.*,
        showDetail.*,
        show.*
      FROM reservations reservation
        INNER JOIN show_details showDetail 
        ON reservation.showDetailId = showDetail.id
        INNER JOIN shows show 
        ON showDetail.showId = show.id
      WHERE reservation.id = :$1
        AND reservation.userId = :$2
      `,
      [reservationId, userId],
    );
    const { price } = reservation.showDetail.show;

    // 예매하긴 했는지 체크
    if (_.isNil(reservation)) {
      throw new NotFoundException("예매 내역이 존재하지 않습니다.");
    }

    // 이미 취소한 예매를 또 취소할 수는 없다.
    if (reservation.status === RESERVATION_STATUS.CANCELLED) {
      throw new NotFoundException("이미 취소한 예매입니다.");
    }

    // 공연 시작 3시간 전까지만 예매를 취소할 수 있다.
    if (reservation.showDetail.showDate.getTime() - new Date().getTime() < 3 * 60 * 60 * 1000) {
      throw new NotFoundException("공연 시작 3시간 전까지만 예매를 취소할 수 있습니다.");
    }

    // -- 트랜잭션 시작--
    await this.connection.manager.transaction(
      "SERIALIZABLE",
      async (transactionalEntityManager) => {
        // 예매상태를 취소로 변경.
        await transactionalEntityManager.update(
          Reservation,
          { id: reservationId },
          { status: RESERVATION_STATUS.CANCELLED },
        );

        // 예매 취소시 사용자의 point + price
        await transactionalEntityManager.update(
          User,
          { id: userId },
          { point: user.point + price },
        );

        // 예매 취소시 showDetail의 reservatedSeat -1
        await transactionalEntityManager.update(
          ShowDetail,
          { id: reservation.showDetail.id },
          { reservatedSeat: reservation.showDetail.reservatedSeat - 1 },
        );
      },
    );
    // -- 트랜잭션 끗! --

    return { message: "예매 취소가 완료되었습니다." };
    // return reservation;
  }
}
