import { Test, TestingModule } from "@nestjs/testing";

import { Repository } from "typeorm";
import { Show } from "./entities/show.entity";
import { ShowDetail } from "./entities/show-detail.entity";
import { ShowsService } from "./shows.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { NotFoundException } from "@nestjs/common";
import { SHOW_CATEGORY } from "./types/show-category.type";
import { CreateShowDto } from "./dto/create-show.dto";

// 변수명이 좀 심한데, 2줄로 적을까?
type MockShowsAndShowDetailsRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
type ShowWithoutRelations = Omit<Show, "user" | "showDetail">

const mockRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

describe("ShowsService", () => {
  let showsService: ShowsService;
  let mockShowsRepository: MockShowsAndShowDetailsRepository<Show>;
  let mockShowDetailsRepository: MockShowsAndShowDetailsRepository<ShowDetail>;

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShowsService,
        { provide: getRepositoryToken(Show), useValue: mockRepository() },
        { provide: getRepositoryToken(ShowDetail), useValue: mockRepository() },
      ],
    }).compile();

    showsService = module.get<ShowsService>(ShowsService);
    mockShowsRepository = module.get(getRepositoryToken(Show));
    mockShowDetailsRepository = module.get(getRepositoryToken(ShowDetail));
  });

  it("sholud be defined", () => {
    expect(showsService).toBeDefined();
  });

  describe("findShows", () => {
    it("카테고리 입력 안하면 예매 가능 공연 싹 다 검색", async () => {
      // Give
      // When
      // Then
    });
    it("카테고리 입력 하면 카테고리에 맞는 예매 가능 공연 검색", async () => {
      // Give
      // When
      // Then
    });
  });

  describe("findOne", () => {
    it("공연 ID와 일치하는 공연이 없는 경우, status: 404, message: 공연을 찾을 수 없습니다.", async () => {
      // Given
      const showId = 1;

      mockShowsRepository.findOne.mockResolvedValue(null);
      const mockReturn = { message: "공연을 찾을 수 없습니다." };
      // When
      await expect(showsService.findOne({ showId })).rejects.toThrow(
        new NotFoundException(mockReturn.message),
      );

      // Then
      expect(mockShowsRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockShowsRepository.findOne).toHaveBeenCalledWith({
        where: { id: showId },
        relations: { showDetails: true },
      });
    });

    it("공연 ID와 일치하는 공연이 존재하는 경우, return show", async () => {
      // Given
      const showId: number = 1;
      const mockReturn = {
        id: 1,
        title: "title",
        description: "description",
        img: "img",
        category: SHOW_CATEGORY.ETC,
        location: "location",
        price: 49900,
        ticketOpenDate: new Date(),
        ticketCloseDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 2,
        showDetails: [
          {
            id: 25,
            showDate: new Date(),
            seat: 100,
            reservatedSeat: 0,
            showId: 5,
          },
        ],
      };

      // When
      mockShowsRepository.findOne.mockResolvedValue(mockReturn);
      const result = await showsService.findOne({ showId });

      // Then
      expect(showId).toEqual(mockReturn.id);
      expect(mockShowsRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockShowsRepository.findOne).toHaveBeenCalledWith({
        where: { id: showId },
        relations: { showDetails: true },
      });

      expect(result).toEqual(mockReturn);
    });
  });

  describe("findShowsByKeyword", () => {
    it("제목에 키워드를 포함하는 공연이 없을 경우, status: 404, message: 공연을 찾을 수 없습니다.", async () => {
      // Give
      // When
      // Then
    });
    it("제목에 키워드를 포함하는 공연이 있는 경우, return shows: Show[]", async () => {
      // Give
      // When
      // Then
    });
  });

  describe("createShow", async () => {
    it("공연 생성을 성공적으로 완료했을 경우, message: 공연 등록에 성공하였습니다.", async () => {});
    // Give
    const userId = 1;
    const createShowDto: CreateShowDto = {
      title: "test",
      description: "testTT",
      img: "neverEndTest",
      category: SHOW_CATEGORY.CLASSIC,
      location: "USA",
      price: 12345,
      ticketOpenDate: new Date(),
      ticketCloseDate: new Date(),
      showDate: [new Date(), new Date()],
      seat: 100,
    };
    // createShowDto에서 show 생성에 필요한 데이터를 따로 뺌.
    const createShowDtoWithoutDate: Partial<CreateShowDto> = {
      title: "test",
      description: "testTT",
      img: "neverEndTest",
      category: SHOW_CATEGORY.CLASSIC,
      location: "USA",
      price: 12345,
      ticketOpenDate: new Date(),
      ticketCloseDate: new Date(),
    };
    // createShowDto에서 show_detail 생성에 필요한 데이터 따로 뺌.
    const showDetailDto: Partial<CreateShowDto> = {
      showDate: [new Date(), new Date()],
      seat: 100,
    };
    const mockReturn = { message: "공연 등록에 성공하였습니다." };

    // When
    // show테이블에 공연 생성 후 결과값
    mockShowsRepository.save.mockResolvedValue({
      showId: 1,
      userId: userId,
      ...createShowDtoWithoutDate,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    // 그 결과값 중 showId로 show_details 테이블 생성
    for (const date of createShowDto.showDate) {
      await mockShowDetailsRepository.save.mockResolvedValue({
        showDetailId: 1,
        showDate: date,
        seat: showDetailDto.seat,
        reservatedSeat: 0,
        showId: 1,
      });
    }
    // createShow 결과값 설정
    const result = await showsService.createShow({
      userId: userId,
      createShowDto: createShowDto,
    });
    // Then
    expect(mockShowsRepository.save).toHaveBeenCalledTimes(1);
    expect(mockShowsRepository.save).toHaveBeenCalledWith({
      userId: userId,
      ...createShowDtoWithoutDate,
    });

    expect(mockShowDetailsRepository.save).toHaveBeenCalledTimes(createShowDto.showDate.length);
    expect(mockShowDetailsRepository.save).toHaveBeenCalledWith({
      showDetailId: 1,
      showDate: createShowDto.showDate[0],
      seat: showDetailDto.seat,
      reservatedSeat: 0,
      showId: 1,
    });

    expect(result).toEqual(mockReturn);
  });

  describe("updateShow", () => {
    it("수정해야될 사항 있음. 우선순위 낮음.", async () => {});
  });

  describe("deleteShow", () => {
    it("추가 구현 사항임. 우선순위 낮음.", async () => {});
  });
});
