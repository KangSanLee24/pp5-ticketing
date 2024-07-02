import _ from "lodash";
import { ExtractJwt, Strategy } from "passport-jwt";

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";

import { UsersService } from "src/users/users.service";
import { NotFoundError } from "rxjs";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get("JWT_SECRET_KEY"),
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findByEmail(payload.email);
    if (_.isNil(user)) {
      throw new NotFoundError("해당하는 사용자를 찾을 수 없습니다.");
    }

    return user;
  }
}
