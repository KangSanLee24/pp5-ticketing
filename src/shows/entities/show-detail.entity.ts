import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Show } from "./show.entity";
import _ from "lodash";

@Entity({
  name: "show_details",
})
export class ShowDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Show, (show) => show.showDetails)
  @JoinColumn({ name: "show_id" })
  showId: number;

  @Column({ type: "datetime", nullable: false })
  showDate: Date;

  @Column({ type: "int", nullable: false })
  seat: number;

  // 남은 좌석 수
  @Column({ type: "int", nullable: false })
  restOfSeat: number;

  // restOfSeat = seat - 예매된 좌석
  @BeforeInsert()
  setRestOfSeat() {
    if (_.isNil(this.restOfSeat)) {
      this.restOfSeat = this.seat;
    }
  }
}
