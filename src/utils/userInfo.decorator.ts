import { createParamDecorator, ExecutionContext } from "@nestjs/common";

// JWT 인증이 완료된 유저에 한해서 유저 데이터를 갖고오게 하는 데코레이터
export const UserInfo = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user ? request.user : null;
});
