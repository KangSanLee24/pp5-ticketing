import { Module } from "@nestjs/common";
import { ReservationsService } from "./reservations.service";
import { ReservationsController } from "./reservations.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Reservation } from "./entities/reservation.entity";
import { ShowDetail } from "src/shows/entities/show-detail.entity";
import { User } from "src/users/entities/user.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Reservation, ShowDetail, User])],
  providers: [ReservationsService],
  controllers: [ReservationsController],
})
export class ReservationsModule {}
