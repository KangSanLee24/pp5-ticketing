import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { SHOW_CATEGORY } from "../types/show-category.type";
import { ShowDetail } from "./show-detail.entity";
import { User } from "src/users/entities/user.entity";

@Entity({
  name: "shows",
})
export class Show {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: "255", nullable: false })
  title: string;

  @Column({ type: "text", nullable: false })
  description: string;

  @Column({ type: "text", nullable: true })
  img: string;

  @Column({ type: "enum", enum: SHOW_CATEGORY, nullable: false })
  category: SHOW_CATEGORY;

  @Column({ type: "varchar", length: "255", nullable: false })
  location: string;

  @Column({ type: "int", nullable: false })
  price: number;

  @Column({ type: "datetime", nullable: false })
  ticketOpenDate: Date;

  @Column({ type: "datetime", nullable: false })
  ticketCloseDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.shows)
  @JoinColumn({ name: "user_id", referencedColumnName: "id" })
  user: User;

  @Column({ type: "int", name: "user_id" })
  user_id: number;

  @OneToMany(() => ShowDetail, (showDetail) => showDetail.show)
  showDetails: ShowDetail[];
}
