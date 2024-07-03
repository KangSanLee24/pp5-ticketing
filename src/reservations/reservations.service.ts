import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import { Reservation } from "./entities/reservation.entity";
import { ShowDetail } from "src/shows/entities/show-detail.entity";
import _ from "lodash";

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Reservation)
    private readonly reservationsRepository: Repository<Reservation>,
    @InjectRepository(ShowDetail)
    private readonly showDetailsRepository: Repository<ShowDetail>,
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

    // ---- 트랜잭션 걸어야 되는 부분 ----
    const reservation = this.reservationsRepository.create({ showDetail, user });
    // 예매 생성
    await this.reservationsRepository.save(reservation);

    // 예매 완료시 사용자의 point - price
    await this.usersRepository.update(
      { id: userId },
      { point: user.point - price },
    );

    // 예매 완료시 showDetail의 reservatedSeat +1
    await this.showDetailsRepository.update(
      { id: showDetailId },
      { reservatedSeat: showDetail.reservatedSeat + 1 },
    );
    // ---- 트랜잭션 걸어야 되는 부분 ----

    return reservation;
  }

  async getReservations(userId: number) {
    if (_.isNil(userId)) {
      throw new NotFoundException("사용자 아이디가 존재하지 않습니다.");
    }
    const reservations = await this.reservationsRepository.find({ where: { user: { id: userId } }, relations: ["showDetail"] });
    return reservations;
  }
}
