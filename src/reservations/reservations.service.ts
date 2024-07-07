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

  async createReservation(showDetailId: number, userId: number) {
    // showDetailId에 해당되는 공연이 있는지, restOfSeat가 있는지 확인
    const showDetail = await this.showDetailsRepository.findOne({
      where: { id: showDetailId },
      relations: ["show"],
    });
    if (_.isNil(showDetail)) {
      throw new NotFoundException("해당 공연이 존재하지 않습니다.");
    }
    if (showDetail.reservatedSeat >= showDetail.seat) {
      throw new NotFoundException("예매 가능한 좌석이 남아있지 않습니다.");
    }

    // userId에 해당되는 사용자의 price가 show의 가격보다 충분한지
    const user = await this.usersRepository.findOne({ where: { id: userId } });
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
        const reservation = transactionalEntityManager.create(Reservation, { showDetail, user });
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
        show_id: showDetail.show.id,
        show_detail_id: showDetail.id,
        title: showDetail.show.title,
        category: showDetail.show.category,
        address: showDetail.show.address,
        price: showDetail.show.price,
        showDate: showDetail.showDate,
      },
    };

    return response;
  }

  async getReservations(userId: number) {
    if (_.isNil(userId)) {
      throw new NotFoundException("사용자 아이디가 존재하지 않습니다.");
    }

    // QueryBuilder
    const reservations = await this.reservationsRepository
      .createQueryBuilder("reservation")
      .innerJoinAndSelect("reservation.showDetail", "showDetail")
      .innerJoinAndSelect("showDetail.show", "show")
      .where("reservation.user_id = :userId", { userId })
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
        show_id: reservation.showDetail.show.id,
        show_detail_id: reservation.showDetail.id,
        title: reservation.showDetail.show.title,
        category: reservation.showDetail.show.category,
        address: reservation.showDetail.show.address,
        price: reservation.showDetail.show.price,
        showDate: reservation.showDetail.showDate,
      },
    }));

    return response;
  }

  async cancelReservation(reservationId: number, userId: number) {
    const reservation = await this.reservationsRepository
      .createQueryBuilder("reservation")
      .innerJoinAndSelect("reservation.showDetail", "showDetail")
      .innerJoinAndSelect("showDetail.show", "show")
      .where("reservation.id = :reservationId", { reservationId })
      .andWhere("reservation.user_id = :userId", { userId })
      .getOne();

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

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    const { price } = reservation.showDetail.show;

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
