import { Test, TestingModule } from "@nestjs/testing";

import { Repository } from "typeorm";
import { Show } from "./entities/show.entity";
import { ShowDetail } from "./entities/show-detail.entity";
import { ShowsService } from "./shows.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { NotFoundException } from "@nestjs/common";
import { SHOW_CATEGORY } from "./types/show-category.type";

type MockShowsRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
type MockShowDetailsRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const mockShowRepository = () => ({
  findShows: jest.fn(),
  findOne: jest.fn(),
  findShowsByKeyword: jest.fn(),
  createShow: jest.fn(),
  updateShow: jest.fn(),
  deleteShow: jest.fn(),
});
const mockShowDetailRepository = () => ({
  findShows: jest.fn(),
  findOne: jest.fn(),
  findShowsByKeyword: jest.fn(),
  createShow: jest.fn(),
  updateShow: jest.fn(),
  deleteShow: jest.fn(),
});

describe("ShowsService", () => {
  let showsService: ShowsService;
  let mockShowsRepository: MockShowsRepository<Show>;
  let mockShowDetailsRepository: MockShowDetailsRepository<ShowDetail>;

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShowsService,
        ShowDetail,
        { provide: getRepositoryToken(Show), useValue: mockShowRepository() },
        { provide: getRepositoryToken(ShowDetail), useValue: mockShowDetailRepository() },
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
    it("", async () => {});
    it("", async () => {});
    it("", async () => {});
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
    it("", async () => {});
    it("", async () => {});
    it("", async () => {});
  });

  describe("createShow", () => {
    it("", async () => {});
    it("", async () => {});
    it("", async () => {});
  });

  describe("createShow", () => {
    it("", async () => {});
    it("", async () => {});
    it("", async () => {});
  });

  describe("deleteShow", () => {
    it("", async () => {});
    it("", async () => {});
    it("", async () => {});
  });
});
