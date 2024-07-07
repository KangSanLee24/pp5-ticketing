import { compare, hash } from "bcrypt";
import _ from "lodash";
import { Repository } from "typeorm";

import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";
import { User } from "./entities/user.entity";
import { ROLE } from "./types/user-role.type";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signUp({
    email,
    password,
    passwordConfirm,
    nickname,
  }: {
    email: string;
    password: string;
    passwordConfirm: string;
    nickname: string;
  }): Promise<{ message: string }> {
    // password = passwordConfirm ?
    if (password !== passwordConfirm) {
      throw new ConflictException("비밀번호가 일치하지 않습니다.");
    }

    const existingUser = await this.findByEmail({ email });
    if (existingUser) {
      throw new ConflictException("이미 해당 이메일로 가입된 사용자가 있습니다.");
    }

    const hashedPassword = await hash(password, this.configService.get<number>("HASH_TIMES"));
    await this.userRepository.save({
      email,
      password: hashedPassword,
      nickname,
      role: ROLE.USER,
    });

    return { message: "회원가입에 성공하셨습니다." };
  }
  async signIn({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<{ accessToken: string }> {
    const user = await this.userRepository.findOne({
      select: ["id", "email", "password"],
      where: { email },
    });
    if (_.isNil(user)) {
      throw new UnauthorizedException("이메일을 확인해주세요.");
    }

    if (!(await compare(password, user.password))) {
      throw new UnauthorizedException("비밀번호를 확인해주세요.");
    }

    const payload = { email, id: user.id, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
  async findByEmail({ email }: { email: string }): Promise<User> {
    return await this.userRepository.findOneBy({ email });
  }
}
