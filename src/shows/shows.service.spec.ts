import { Test, TestingModule } from "@nestjs/testing";
import _ from "lodash";
import { Repository } from "typeorm";
import { Show } from "./entities/show.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common";
import { CreateShowDto } from "./dto/create-show.dto";
import { UpdateShowDto } from "./dto/update-show.dto";

@Injectable()
export class ShowsService {
  constructor(
    @InjectRepository(Show)
    private readonly showRepository: Repository<Show>,
  ) {}

  async createShow(createShowDto: CreateShowDto) {}

  async updateShow(showId: number, updateShowDto: UpdateShowDto) {}

  async deleteShow(showId: number) {}
}
