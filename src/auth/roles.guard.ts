import { ROLE } from "src/users/types/user-role.type";

import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
// extends AuthGuard('jwt') : JWT 인증 전략을 기본으로 가져가면서 부가적으로 인가 기능까지 수행하려고
export class RolesGuard extends AuthGuard("jwt") implements CanActivate {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const authenticated = await super.canActivate(context);
    if (!authenticated) {
      return false;
    }

    const requiredRoles = this.reflector.getAllAndOverride<ROLE[]>("roles", [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role === role);
  }
}
