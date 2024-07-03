import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    // DTO가 유효성 검사를 자동으로 함
    new ValidationPipe({
      transform: true,
    }),
  );

  await app.listen(3000);
}

bootstrap();
