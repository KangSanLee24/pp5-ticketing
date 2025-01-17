import Joi from "joi";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";

import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";

import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { ShowsModule } from "./shows/shows.module";
import { User } from "./users/entities/user.entity";
import { Show } from "./shows/entities/show.entity";
import { ShowDetail } from "./shows/entities/show-detail.entity";
import { ReservationsModule } from "./reservations/reservations.module";
import { Reservation } from "./reservations/entities/reservation.entity";

const typeOrmModuleOptions = {
  useFactory: async (configService: ConfigService): Promise<TypeOrmModuleOptions> => ({
    namingStrategy: new SnakeNamingStrategy(),
    type: "mysql",
    username: configService.get("DB_USERNAME"),
    password: configService.get("DB_PASSWORD"),
    host: configService.get("DB_HOST"),
    port: configService.get("DB_PORT"),
    database: configService.get("DB_NAME"),
    entities: [User, Show, ShowDetail, Reservation],
    synchronize: configService.get("DB_SYNC"),
    logging: true,
  }),
  inject: [ConfigService],
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        JWT_SECRET_KEY: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_NAME: Joi.string().required(),
        DB_SYNC: Joi.boolean().required(),
      }),
    }),
    TypeOrmModule.forRootAsync(typeOrmModuleOptions),
    AuthModule,
    UsersModule,
    ShowsModule,
    ReservationsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
