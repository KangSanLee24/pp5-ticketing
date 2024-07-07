import { Test, TestingModule } from "@nestjs/testing";
import { UsersController } from "./users.controller";

describe("UsersController", () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("sign-up", () => {
    it("asdfasdfs", async () => {
      // Given
      // When
      // Then
    });
  });

  describe("sign-in", () => {
    it("asdfasdfs", async () => {
      // Given
      // When
      // Then
    });
  });

  describe("123456789", () => {
    it("asdfasdfs", async () => {
      // Given
      // When
      // Then
    });
  });
});
