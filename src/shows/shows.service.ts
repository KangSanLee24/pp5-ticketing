import _ from "lodash";
import { Like, MoreThan, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

import { Show } from "./entities/show.entity";
import { ShowDetail } from "./entities/show-detail.entity";
import { CreateShowDto } from "./dto/create-show.dto";
import { UpdateShowDto } from "./dto/update-show.dto";
import { FindShowsQuery } from "./dto/find-shows-query.dto";
import { getToday } from "src/utils/get-today.util";

@Injectable()
export class ShowsService {
  constructor(
    @InjectRepository(Show)
    private readonly showRepository: Repository<Show>,
    @InjectRepository(ShowDetail)
    private readonly showDetailRepository: Repository<ShowDetail>,
  ) {}

  async createShow(userId: number,createShowDto: CreateShowDto) {
    const {
      title,
      description,
      img,
      category,
      location,
      price,
      ticketOpenDate,
      ticketCloseDate,
      showDate,
      seat,
    } = createShowDto;

    const show = await this.showRepository.save({
      user_id: userId,
      title,
      description,
      img,
      category,
      location,
      price,
      ticketOpenDate,
      ticketCloseDate,
    });

    for (const date of showDate) {
      await this.showDetailRepository.save({ show_id: show.id, showDate: date, seat });
    }

    return { message: "공연 등록에 성공하였습니다." };
  }

  async updateShow(userId: number, showId: number, updateShowDto: UpdateShowDto) {
    const {
      title,
      description,
      img,
      category,
      location,
      price,
      ticketOpenDate,
      ticketCloseDate,
      showDate,
      seat,
    } = updateShowDto;
    // 모두다 비여있으면 return
    if (
      _.isEmpty(title) &&
      _.isEmpty(description) &&
      _.isEmpty(img) &&
      _.isEmpty(category) &&
      _.isEmpty(location) &&
      _.isEmpty(price) &&
      _.isEmpty(ticketOpenDate) &&
      _.isEmpty(ticketCloseDate) &&
      _.isEmpty(showDate) &&
      _.isEmpty(seat)
    ) {
      throw new BadRequestException("수정할 내용이 없습니다.");
    }

    // showId에 맞는 show있나 체크
    const show = await this.showRepository.findOne({
      where: { id: showId, user_id: userId },
      relations: { showDetails: true },
    });
    if (_.isEmpty(show)) {
      throw new NotFoundException("공연을 찾을 수 없습니다.");
    }
    show.title = title ? title : show.title;
    show.description = description ? description : show.description;
    show.img = img ? img : show.img;
    show.category = category ? category : show.category;
    show.location = location ? location : show.location;
    show.price = price ? price : show.price;
    show.ticketOpenDate = ticketOpenDate ? ticketOpenDate : show.ticketOpenDate;
    show.ticketCloseDate = ticketCloseDate ? ticketCloseDate : show.ticketCloseDate;

    await this.showRepository.save(show);

    // showDate값이 있나 체크. 있으면 다 날리고 다시 만들기?
    if (!_.isEmpty(showDate)) {
      await this.showDetailRepository.delete({ show: show });

      for (const date of showDate) {
        await this.showDetailRepository.save({ show_id: show.id, showDate: date, seat });
      }
    }

    return { message: "공연 수정에 성공하였습니다." };
  }

  async deleteShow(userId: number, showId: number) {
    const show = await this.showRepository.findOne({ where: { id: showId, user_id: userId } });
    if (!show) {
      throw new NotFoundException("공연을 찾을 수 없습니다.");
    }

    await this.showRepository.delete({ id: showId });
  }

  async findOne(showId: number) {
    const show = await this.showRepository.findOne({
      where: { id: showId },
      relations: { showDetails: true },
    });
    if (!show) {
      throw new NotFoundException("공연을 찾을 수 없습니다.");
    }
    return show;
  }

  // 공연 목록 조회 API 
  async findShows(query: FindShowsQuery) {
    const { category, sort } = query;
    const today = getToday();

    // sortOrder 기본값: ASC
    let sortOrder: "ASC" | "DESC" = "ASC";
    if (_.isEmpty(sort)) {
      sortOrder = "ASC";
    } else {
      sortOrder = sort;
    }

    let shows: Show[];
    // 카테고리 없으면 싹 다 검색
    if (_.isEmpty(category)) {
      shows = await this.showRepository.find({
        where: { ticketCloseDate: MoreThan(today) },
        order: {
          ticketOpenDate: {
            direction: sortOrder,
          },
        },
      });
    } else {
      // 카테고리 있으면 해당 카테고리 검색
      shows = await this.showRepository.find({
        where: { category, ticketCloseDate: MoreThan(today) },
        order: {
          ticketOpenDate: {
            direction: sortOrder,
          },
        },
      });
    }

    // 추가적으로 showDetail을 뒤져서 showOpenDate랑 showCloseDate를 만들거임.
    const showsWithDetails = shows.map(async (show)=> {
      const showDetails = await this.showDetailRepository.find({
        where: { show_id: show.id },
        order: {
          showDate: {
            direction: "ASC",
          },
        },
      });

      const showOpenDate = showDetails.length > 0 ? showDetails[0].showDate : null;
      const showCloseDate = showDetails.length > 0 ? showDetails[showDetails.length - 1].showDate : null;

      return {
        ...show,
        showOpenDate,
        showCloseDate,
      };
    });

    return await Promise.all(showsWithDetails);
  }

  async findShowsByKeyword(keyword: string) {
    const today = getToday();
    const shows = await this.showRepository.find({
      where: { title: Like(`%${keyword}%`), ticketCloseDate: MoreThan(today) },
    });
    if (_.isEmpty(shows)) {
      throw new NotFoundException("공연을 찾을 수 없습니다.");
    }
    return shows;
  }
}
