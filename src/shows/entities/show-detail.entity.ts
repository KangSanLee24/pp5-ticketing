import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Show } from "./show.entity";
import _ from "lodash";
import { Reservation } from "src/reservations/entities/reservation.entity";

@Entity({
  name: "show_details",
})
export class ShowDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "datetime", nullable: false })
  showDate: Date;

  @Column({ type: "int", nullable: false })
  seat: number;

  // 예매된 좌석 수
  @Column({ type: "int", nullable: false, default: 0 })
  reservatedSeat: number;

  // showId를 show로 변경
  @ManyToOne((type) => Show, (show) => show.showDetails)
  @JoinColumn({ referencedColumnName: "id" })
  show: Show;

  @Column({ type: "int" })
  showId: number;

  @OneToMany(() => Reservation, (reservation) => reservation.showDetail)
  reservations: Reservation[];
}
