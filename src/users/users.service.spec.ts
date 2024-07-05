import { Test, TestingModule } from "@nestjs/testing";
import { Repository } from "typeorm";
import bcrypt, { compare, hash } from "bcrypt";
import { JwtService } from "@nestjs/jwt";

import { UsersService } from "./users.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { ROLE } from "./types/user-role.type";
import { ConfigService } from "@nestjs/config";
import { ConflictException, UnauthorizedException } from "@nestjs/common";

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
    jest.resetAllMocks();
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

  // 이게 뭔지 찾아봐야합니다.
  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("signUp", () => {
    it("password와 passwordConfirm이 다를 경우, status: 409, message: `비밀번호가 일치하지 않습니다.`", async () => {
      // Given
      const email = "test@test.com";
      const password = "password";
      const passwordConfirm = "password123";
      const nickname = "nickname";
      const mockReturn = { message: "비밀번호가 일치하지 않습니다." };

      // When
      // signUp() : Prpmise니까 await
      await expect(service.signUp({ email, password, passwordConfirm, nickname })).rejects.toThrow(
        new ConflictException(mockReturn.message),
      );

      // Then
      expect(password).not.toEqual(passwordConfirm);
      expect(mockUsersRepository.findOneBy).toHaveBeenCalledTimes(0);

      expect(mockUsersRepository.save).toHaveBeenCalledTimes(0);
    });
    it("이메일이 이미 DB에 존재하는 경우, status:409, message: `이미 해당 이메일로 가입된 사용자가 있습니다.`", async () => {
      // Given
      const email = "test@test.com";
      const password = "password";
      const passwordConfirm = "password";
      const nickname = "nickname";
      const mockUser: UserWithoutRelations = {
        id: 1,
        email,
        password,
        nickname,
        role: ROLE.USER,
        point: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockReturn = { message: "이미 해당 이메일로 가입된 사용자가 있습니다." };
      mockUsersRepository.findOneBy.mockResolvedValue(mockUser);

      // When
      await expect(service.signUp({ email, password, passwordConfirm, nickname })).rejects.toThrow(
        new ConflictException(mockReturn.message),
      );

      // Then
      expect(password).toEqual(passwordConfirm);
      expect(mockUsersRepository.findOneBy).toHaveBeenCalledTimes(1);
      expect(mockUsersRepository.findOneBy).toHaveBeenCalledWith({ email });
      expect(email).toEqual(mockUser.email);

      expect(mockUsersRepository.save).toHaveBeenCalledTimes(0);
    });
    it("회원가입에 성공했을 경우, message: 회원가입에 성공하셨습니다.", async () => {
      // Given
      const email = "test@test.com";
      const password = "password";
      const passwordConfirm = "password";
      const nickname = "nickname";

      const hashedPassword: string = "hashedPassword";
      jest
        .spyOn(bcrypt, "hash")
        .mockImplementation((data: string | Buffer, salt: string | number) =>
          Promise.resolve(hashedPassword),
        );
      const mockUser: UserWithoutRelations = {
        id: 1,
        email,
        password: hashedPassword,
        nickname,
        role: ROLE.USER,
        point: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockUsersRepository.findOneBy.mockResolvedValue(null);
      mockUsersRepository.save.mockResolvedValue(mockUser);
      const mockReturn = { message: "회원가입에 성공하셨습니다." };

      // When
      const result = await service.signUp({ email, password, passwordConfirm, nickname });

      // Then
      expect(password).toEqual(passwordConfirm);
      expect(mockUsersRepository.findOneBy).toHaveBeenCalledTimes(1);
      expect(mockUsersRepository.findOneBy).toHaveBeenCalledWith({ email });

      expect(hash).toHaveBeenCalledTimes(1);
      expect(mockUsersRepository.save).toHaveBeenCalledTimes(1);
      expect(mockUsersRepository.save).toHaveBeenCalledWith({
        email,
        password: hashedPassword,
        nickname,
        role: ROLE.USER,
      });
      expect(result).toEqual(mockReturn);
    });
  });
  //
  describe("signIn", () => {
    it("이메일이 일치하는 사용자가 없을 경우, status:401, message: 이메일을 확인해주세요.", async () => {
      // Given
      const email = "test@test.com";
      const password = "password";

      mockUsersRepository.findOne.mockResolvedValue(null);
      const mockReturn = { message: "이메일을 확인해주세요." };

      // When
      await expect(service.signIn({ email, password })).rejects.toThrow(
        new UnauthorizedException(mockReturn.message),
      );

      // Then
      expect(mockUsersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        select: ["id", "email", "password"],
        where: { email },
      });

      expect(mockUsersRepository.save).toHaveBeenCalledTimes(0);
    });
    it("입력한 password와 DB의 hashedPassword가 일치하지 않는 경우, status: 401, message: 비밀번호를 확인해주세요.", async () => {
      // Given
      const email = "test@test.com";
      const password = "password";
      const nickname = "nickname";
      const hashedPassword = "hashedPassword";
      const mockUser: UserWithoutRelations = {
        id: 1,
        email,
        password,
        nickname,
        role: ROLE.USER,
        point: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest
        .spyOn(bcrypt, "compare")
        .mockImplementation((password, hashedPassword) => Promise.resolve(false));
      const payload = { email, id: mockUser.id, role: mockUser.role };
      mockJwtService.sign.mockReturnValue(payload); // sign 비동기 함수 아님.

      mockUsersRepository.findOne.mockResolvedValue(mockUser);
      const mockReturn = { message: "비밀번호를 확인해주세요." };

      // When
      await expect(service.signIn({ email, password })).rejects.toThrow(
        new UnauthorizedException(mockReturn.message),
      );

      // Then
      expect(mockUsersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        select: ["id", "email", "password"],
        where: { email },
      });
      expect(email).toEqual(mockUser.email);

      expect(compare).toHaveBeenCalledTimes(1);
      expect(compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(compare).toBeTruthy();
    });
    it("로그인에 성공했을 경우, accessToken : `accessToken`", async () => {
      // Given
      const email = "test@test.com";
      const password = "password";
      const nickname = "nickname";
      const hashedPassword = "hashedPassword";
      const mockUser: UserWithoutRelations = {
        id: 1,
        email,
        password,
        nickname,
        role: ROLE.USER,
        point: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest
        .spyOn(bcrypt, "compare")
        .mockImplementation((password, hashedPassword) => Promise.resolve(true));

      const mockReturn = { accessToken: "accessToken" };

      // When
      mockUsersRepository.findOne.mockResolvedValue(mockUser);
      mockJwtService.sign.mockResolvedValue(mockReturn.accessToken);

      const result = await service.signIn({ email, password });

      // Then
      expect(mockUsersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        select: ["id", "email", "password"],
        where: { email },
      });
      expect(mockJwtService.sign).toHaveBeenCalledTimes(1);
      expect(mockJwtService.sign).toHaveBeenCalledWith({ email, id: 1, role: ROLE.USER });
      expect(result).toEqual(mockReturn);
    });
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
      const result = await service.findByEmail({ email });

      // Then
      expect(mockUsersRepository.findOneBy).toHaveBeenCalledTimes(1);
      expect(mockUsersRepository.findOneBy).toHaveBeenCalledWith({ email });

      expect(result).toEqual(mockReturn);
    });
  });
});

// 아니 mockReturnValue랑 mockResolvedValue 때문에 몇번을 갈아 엎냐고 바보야!!
