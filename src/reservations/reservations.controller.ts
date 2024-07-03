import { Controller, Get, Param, Patch, Post, Req } from "@nestjs/common";

import { AuthGuard } from "@nestjs/passport";
import { UseGuards } from "@nestjs/common";
import { ReservationsService } from "./reservations.service";
import { User } from "src/users/entities/user.entity";
import { UserInfo } from "src/utils/userInfo.decorator";

@UseGuards(AuthGuard("jwt"))
@Controller("reservations")
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  // 예매하기 API
  @Post(":showDetailId")
  async createReservation(@Param("showDetailId") showDetailId: number, @UserInfo() user: User) {
    const userId = +user.id;
    return this.reservationsService.createReservation(showDetailId, userId);
  }

  // 예매 내역 조회 API
  @Get("")
  async getReservations(@UserInfo() user: User) {
    const userId = +user.id;
    return this.reservationsService.getReservations(userId);
  }

  // 예매 취소 API
  @Patch(":reservationId")
  async cancelReservation(@Param("reservationId") reservationId: number, @UserInfo() user: User) {
    const userId = +user.id;
    return this.reservationsService.cancelReservation(reservationId, userId);
  }
}
