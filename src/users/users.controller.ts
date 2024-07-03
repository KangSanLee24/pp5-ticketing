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
  async register(@Body() signUpDto: SignUpDto) {
    return await this.usersService.signUp(
      signUpDto.email,
      signUpDto.password,
      signUpDto.passwordConfirm,
      signUpDto.nickname,
    );
  }

  @Post("sign-in")
  async login(@Body() signInDto: SignInDto) {
    return await this.usersService.signIn(signInDto.email, signInDto.password);
  }

  @UseGuards(AuthGuard("jwt"))
  @Get("")
  async getMyInfo(@UserInfo() user: User) {
    return await this.usersService.findByEmail(user.email);
  }
}
