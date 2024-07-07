import {
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Validate,
} from "class-validator";
import { SHOW_CATEGORY } from "../types/show-category.type";
import { Type } from "class-transformer";
import { IsAfter } from "../validators/is-after.validators";
import { IsSortedDatesValidator } from "../validators/is-sorted-dates.validator";

export class CreateShowDto {
  @IsString()
  @IsNotEmpty({ message: "제목을 입력해주세요." })
  title: string;

  @IsString()
  @IsNotEmpty({ message: "설명을 입력해주세요." })
  description: string;

  @IsString()
  @IsNotEmpty({ message: "이미지를 입력해주세요." })
  img: string;

  @IsEnum(SHOW_CATEGORY)
  @IsNotEmpty({ message: "카테고리를 입력해주세요." })
  category: SHOW_CATEGORY;

  @IsString()
  @IsNotEmpty({ message: "장소를 입력해주세요." })
  address: string;

  @IsNumber()
  @IsNotEmpty({ message: "가격을 입력해주세요." })
  @Max(50000, { message: "50000원 이하로 입력해주세요." })
  price: number;

  @Type(() => Date) // JSON의 날짜 문자열을 Date 타입으로 변환
  @IsDate()
  @IsNotEmpty({ message: "티켓 오픈 날짜와 시간을 입력해주세요." })
  ticketOpenDate: Date;

  @Type(() => Date) // JSON의 날짜 문자열을 Date 타입으로 변환
  @IsDate()
  @IsNotEmpty({ message: "티켓 마감 날짜와 시간을 입력해주세요." })
  @Validate(IsAfter, ["ticketOpenDate"], {
    message: "티켓 마감 날짜를 티켓 오픈 날짜보다 늦게 입력해주세요.",
  })
  ticketCloseDate: Date;

  @Type(() => Date) // JSON의 날짜 문자열을 Date 타입으로 변환
  @IsArray()
  @IsNotEmpty({ message: "공연 날짜와 시간을 입력해주세요." })
  @IsDate({ each: true }) // : Date 타입인지 확인하는 거임.
  @Validate(IsSortedDatesValidator, {
    message: "공연 날짜를 시간순으로 입력해주세요.",
  }) // 시간순으로 정렬되있는지?
  showDate: Date[];
  // @IsDateString() : ISO 8601 형식의 날짜 문자열인지 확인하는 거임.

  @IsNumber()
  @IsNotEmpty({ message: "좌석 수를 입력해주세요." })
  seat: number;
}
