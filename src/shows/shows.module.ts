import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Show } from "./entities/show.entity";
import { ShowDetail } from "./entities/show-detail.entity";
import { ShowsController } from "./shows.controller";
import { ShowsService } from "./shows.service";

@Module({
  imports: [TypeOrmModule.forFeature([Show, ShowDetail])],
  providers: [ShowsService],
  controllers: [ShowsController],
})
export class ShowsModule {}
