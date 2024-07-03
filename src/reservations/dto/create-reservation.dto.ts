import { IsInt } from "class-validator";

export class CreateReservationDto {
  @IsInt()
  showDetailId: number;
}
