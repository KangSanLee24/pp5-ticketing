import _ from 'lodash';
import { Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { Show } from './entities/show.entity';
import { ShowDetail } from './entities/show-detail.entity';
import { CreateShowDto } from './dto/create-show.dto';
import { UpdateShowDto } from './dto/update-show.dto';
import { FindShowsQuery } from './dto/find-shows-query.dto';

@Injectable()
export class ShowsService {
  constructor(
    @InjectRepository(Show) 
    private readonly showRepository: Repository<Show>,
    @InjectRepository(ShowDetail)
    private readonly showDetailRepository: Repository<ShowDetail>
  ) {}

  async createShow(createShowDto: CreateShowDto) {
    // 유효성 검사를 뭐해야되나...
    const { title, description, img, category, location, price, ticketOpenDate, ticketCloseDate, showDate, seat} = createShowDto;
    
    const show = await this.showRepository.save({ title, description, img, category, location, price, ticketOpenDate, ticketCloseDate });
    
    for ( const date of showDate) {
      await this.showDetailRepository.save({ showId: show.id, showDate: date, seat });
    }

    return { message: '공연 등록에 성공하였습니다.'}
  }

  async updateShow(showId: number, updateShowDto: UpdateShowDto) {
    const { title, description, img, category, location, price, ticketOpenDate, ticketCloseDate, showDate, seat } = updateShowDto;
    // 모두다 비여있으면 return
    if (_.isEmpty(title) && 
      _.isEmpty(description) && 
      _.isEmpty(img) && 
      _.isEmpty(category) && 
      _.isEmpty(location) && 
      _.isEmpty(price) && 
      _.isEmpty(ticketOpenDate) && 
      _.isEmpty(ticketCloseDate) && 
      _.isEmpty(showDate) && 
      _.isEmpty(seat)) {
       throw new BadRequestException('수정할 내용이 없습니다.');
    }

    // showId에 맞는 show있나 체크
    const show = await this.showRepository.findOne({ where: { id: showId }, relations: { showDetails: true } });
    if (_.isEmpty(show)) {
      throw new NotFoundException('공연을 찾을 수 없습니다.');
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
    if(!_.isEmpty(showDate)) {
      await this.showDetailRepository.delete({ showId: show.id });

      for(const date of showDate) {
        await this.showDetailRepository.save({ showId: show.id, showDate: date, seat });
      }
    }

    return { message: '공연 수정에 성공하였습니다.'}
  }

  async deleteShow(showId: number) {
    const show = await this.showRepository.findOne({ where: { id: showId } });
    if (!show) {
      throw new NotFoundException('공연을 찾을 수 없습니다.');
    }

    await this.showRepository.delete({ id: showId });
  }

  async findOne(showId: number) {
    const show = await this.showRepository.findOne({ where: { id: showId }, relations: { showDetails: true } });
    if (!show) {
      throw new NotFoundException('공연을 찾을 수 없습니다.');
    }
    return show;
  }

  // 카테고리 없으면 싹 다 검색
  async findShows(query: FindShowsQuery) {
    const {  category, sort } = query;

    let sortOrder: 'ASC' | 'DESC' = 'ASC';
    if(_.isEmpty(sort)) {
      sortOrder = 'ASC';
    } else {
      sortOrder = sort;
    }

    if(_.isEmpty(category)) {
      const shows = await this.showRepository.find({
        order: { ticketOpenDate: {
          direction: sortOrder
        } } 
      });
      return shows;
    }
    
    const shows = await this.showRepository.find({
      where: { category }, 
      order: { ticketOpenDate: {
        direction: sortOrder
      } } 
    });

    return shows;
  }

  async findShowsByKeyword(keyword: string) {
    const shows = await this.showRepository.find({
      where: { title: Like(`%${keyword}%`) }
    });
    if (_.isEmpty(shows)) {
      throw new NotFoundException('공연을 찾을 수 없습니다.');
    }
    return shows;
  }
}