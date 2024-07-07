import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import { User } from "./entities/user.entity";
import { SignUpDto } from "./dto/sign-up.dto";
import { SignInDto } from "./dto/sign-in.dto";
import { UsersService } from "./users.service";
import { UserInfo } from "../utils/userInfo.decorator";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post("sign-up")
  async register(@Body() signUpDto: SignUpDto): Promise<{ message: string }> {
    return await this.usersService.signUp({
      email: signUpDto.email,
      password: signUpDto.password,
      passwordConfirm: signUpDto.passwordConfirm,
      nickname: signUpDto.nickname,
    });
  }

  @Post("sign-in")
  async login(@Body() signInDto: SignInDto): Promise<{ accessToken: string }> {
    return await this.usersService.signIn({
      email: signInDto.email,
      password: signInDto.password,
    });
  }

  @UseGuards(AuthGuard("jwt"))
  @Get("")
  async getMyInfo(@UserInfo() user: User): Promise<User> {
    return await this.usersService.findByEmail({ email: user.email });
  }
}
