import { ShowDetail } from "src/shows/entities/show-detail.entity";
import { User } from "src/users/entities/user.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { RESERVATION_STATUS } from "../types/reservation-status.type";

@Entity({
  name: "reservations",
})
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  // RESERVED, CANCELLED, COMPLETED
  @Column({
    type: "enum",
    enum: RESERVATION_STATUS,
    default: RESERVATION_STATUS.RESERVED,
    nullable: false,
  })
  status: RESERVATION_STATUS;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // userId를 user로 변경
  @ManyToOne((type) => User, (user) => user.reservations)
  @JoinColumn({ referencedColumnName: "id" })
  user: User;

  @Column({ type: "int" })
  userId: number;

  // showDetailId를 showDetail로 변경
  @ManyToOne((type) => ShowDetail, (showDetail) => showDetail.reservations)
  @JoinColumn({ referencedColumnName: "id" })
  showDetail: ShowDetail;

  @Column({ type: "int" })
  showDetailId: number;
}
