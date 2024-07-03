import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { ROLE } from "../types/user-role.type";
import { Reservation } from "src/reservations/entities/reservation.entity";
import { Show } from "src/shows/entities/show.entity";

@Index("email", ["email"], { unique: true })
@Entity({
  name: "users",
})
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", unique: true, nullable: false })
  email: string;

  @Column({ type: "varchar", select: false, nullable: false })
  password: string;

  @Column({ type: "varchar", nullable: false })
  nickname: string;

  @Column({ type: "enum", enum: ROLE, default: ROLE.USER, nullable: false })
  role: ROLE;

  @Column({ type: "int", default: 1000000, nullable: false })
  point: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(type => Show, (show) => show.user)
  shows: Show[];

  @OneToMany(type => Reservation, (reservation) => reservation.user)
  reservations: Reservation[];
}
