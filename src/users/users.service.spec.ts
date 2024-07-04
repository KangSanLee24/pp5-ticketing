import { Test, TestingModule } from "@nestjs/testing";
import { Repository } from "typeorm";

import { JwtService } from "@nestjs/jwt";

import { UsersService } from "./users.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { ROLE } from "./types/user-role.type";
import { ConfigService } from "@nestjs/config";
import { ConflictException } from "@nestjs/common";

// keyof Repository<T>로 해당 repo가 가지고 있는 메서드를 추출한 다음,
// 해당 타입을 Key값 타입으로 갖고, jest.Mock 타입을 value값 타입으로 갖는 타입을 리턴.
// Partial로 감싸 optional 처리를 한다.
type MockUsersRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
type UserWithoutRelations = Omit<User, "shows" | "reservations">;

const mockRepository = () => ({
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  save: jest.fn(),
});

const mockJwtService = {
  sign: jest.fn(),
};

const configService = {
  get: jest.fn(),
};

describe("UsersService", () => {
  let service: UsersService;
  let mockUsersRepository: MockUsersRepository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        //  mockRepository로 만든 fake repo들은 다른 typeorm의 entity들이 공유해서는 안되기 때문에, 함수 형태로 작성하는 것이 좋다.
        { provide: getRepositoryToken(User), useValue: mockRepository() },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);

    mockUsersRepository = module.get(getRepositoryToken(User));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  // DB에 이메일이 없는 경우는 고려하지 않았네?
  describe("findByEmail", () => {
    it("should return user if user exists", async () => {
      // Given
      const email = "test@test.com";

      const mockReturn: UserWithoutRelations = {
        id: 1,
        email: "test@test.com",
        password: "password",
        nickname: "test",
        role: ROLE.USER,
        point: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      // When
      mockUsersRepository.findOneBy.mockResolvedValue(mockReturn);
      const result = await service.findByEmail(email);
      // Then
      expect(mockUsersRepository.findOneBy).toHaveBeenCalledWith({ email });
      expect(mockUsersRepository.findOneBy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockReturn);
    });
  });

  // 성공적으로 가입
  describe("signUp", () => {
    it("should return message if user successfully sign up", async () => {
      // Given
      const email = "test@test.com";
      const password = "password";
      const passwordConfirm = "password";
      const nickname = "nickname";
      const mockReturn = { message: "회원가입에 성공하셨습니다." };
      // When
      if (password !== passwordConfirm) {
        throw new ConflictException("비밀번호가 일치하지 않습니다.");
      }
      // jest .spyOn .mockImplementation
      jest.spyOn(service, "findByEmail");
      const existingUser = await service.findByEmail(email);
      if (existingUser) {
        throw new ConflictException("이미 해당 이메일로 가입된 사용자가 있습니다.");
      }
      mockUsersRepository.save({ email, password, nickname, role: ROLE.USER });
      const result = await service.signUp(email, password, passwordConfirm, nickname);
      // Then
      expect(service.findByEmail).toHaveBeenCalledTimes(1);
      expect(service.findByEmail).toHaveBeenCalledWith({ email });
      expect(mockUsersRepository.save).toHaveBeenCalledTimes(1);
      expect(mockUsersRepository.save).toHaveBeenCalledWith({
        email,
        password,
        nickname,
        role: ROLE.USER,
      });
      expect(result).toEqual(mockReturn);
    });
  });
  // password와 passwordConfirm이 일치하지 않으면 ERROR
  describe("signUp", () => {
    it("should fail if password is not same passwordConfirm", async () => {
      const email = "test@test.com";
      const password = "password";
      const passwordConfirm = "password";
      const nickname = "nickname";
    });
  });
  // 해당 이메일로 가입된 사용자가 있으면 ERROR
  describe("signUp", () => {
    it("should fail if user exists", async () => {
      const email = "test@test.com";
      const password = "password";
      const passwordConfirm = "password";
      const nickname = "nickname";
    });
  });
  //
  describe("signIn", () => {
    it("should fail if email, password is not correct", async () => {});
  });
});
