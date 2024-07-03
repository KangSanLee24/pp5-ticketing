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
  @JoinColumn({ name: "user_id", referencedColumnName: "id" })
  user: User;

  @Column({ type: "int", name: "user_id" })
  user_id: number;

  // showDetailId를 showDetail로 변경
  @ManyToOne((type) => ShowDetail, (showDetail) => showDetail.reservations)
  @JoinColumn({ name: "show_detail_id", referencedColumnName: "id" })
  showDetail: ShowDetail;

  @Column({ type: "int", name: "show_detail_id" })
  show_detail_id: number;
}
