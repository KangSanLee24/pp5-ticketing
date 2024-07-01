import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Show } from "./show.entity";

@Entity({
    name: 'show_details',
})
export class ShowDetail {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Show, (show) => show.showDetails)
    @JoinColumn({ name: 'show_id' })
    showId: number;

    @Column({ type: 'date', nullable: false })
    showDate: Date;

    @Column({ type: 'int', nullable: false })
    seat: number;

    
}