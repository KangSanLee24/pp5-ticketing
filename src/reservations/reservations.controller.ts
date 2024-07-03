import { Controller, Get, Param, Post, Req } from "@nestjs/common";

import { AuthGuard } from "@nestjs/passport";
import { UseGuards } from "@nestjs/common";
import { ReservationsService } from "./reservations.service";
import { User } from "src/users/entities/user.entity";
import { UserInfo } from "src/utils/userInfo.decorator";

@UseGuards(AuthGuard("jwt"))
@Controller("reservations")
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post(":showDetailId")
  async createReservation(@Param("showDetailId") showDetailId: number, @UserInfo() user: User) {
    const userId = +user.id;
    return this.reservationsService.createReservation(showDetailId, userId);
  }

  @Get("")
  async getReservations(@UserInfo() user: User) {
    const userId = +user.id;
    return this.reservationsService.getReservations(userId);
  }
}
