import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";

import { RolesGuard } from "../auth/roles.guard";
import { ROLE } from "../users/types/user-role.type";
import { Roles } from "../auth/roles.decorator";
import { ShowsService } from "./shows.service";
import { CreateShowDto } from "./dto/create-show.dto";
import { UpdateShowDto } from "./dto/update-show.dto";
import { FindShowsQuery } from "./dto/find-shows-query.dto";
import { UserInfo } from "src/utils/userInfo.decorator";
import { User } from "src/users/entities/user.entity";

@UseGuards(RolesGuard)
@Controller("shows")
export class ShowsController {
  constructor(private readonly showsService: ShowsService) {}

  @Get()
  async findShows(@Query() query: FindShowsQuery) {
    return this.showsService.findShows(query);
  }

  // 공연 상세 조회
  @Get(":id")
  async findShow(@Param("id") showId: number) {
    return this.showsService.findOne(showId);
  }

  // keyword로 검색
  @Get("search/:keyword")
  async findShowByKeyword(
    @Param("keyword") keyword: string
  ) {
    return this.showsService.findShowsByKeyword(keyword);
  }

  @Roles(ROLE.ADMIN)
  @Post()
  async createShow(
    @UserInfo() user: User, 
    @Body() createShowDto: CreateShowDto) {
    const userId = +user.id;
    return this.showsService.createShow(userId, createShowDto);
  }

  @Roles(ROLE.ADMIN)
  @Patch(":id")
  async updateShow(
    @UserInfo() user: User,
    @Param("id") showId: number,
    @Body() updateShowDto: UpdateShowDto
  ) {
    const userId = +user.id;
    return this.showsService.updateShow(userId, showId, updateShowDto);
  }

  @Roles(ROLE.ADMIN)
  @Delete(":id")
  async deleteShow(
    @UserInfo() user: User,
    @Param("id") showId: number
  ) {
    const userId = +user.id;
    return this.showsService.deleteShow(userId, showId);
  }
}
