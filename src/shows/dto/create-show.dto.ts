import { IsArray, IsDate, IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { SHOW_CATEGORY } from "../types/show-category.type";

export class CreateShowDto {
    @IsString()
    @IsNotEmpty({ message: '제목을 입력해주세요.'})
    title: string

    @IsString()
    @IsNotEmpty({ message: '설명을 입력해주세요.'})
    description: string

    @IsString()
    @IsNotEmpty({ message: '이미지를 입력해주세요.'})
    img: string

    @IsEnum(SHOW_CATEGORY)
    @IsNotEmpty({ message: '카테고리를 입력해주세요.'})
    category: SHOW_CATEGORY

    @IsString()
    @IsNotEmpty({ message: '장소를 입력해주세요.'})
    location: string

    @IsNumber()
    @IsNotEmpty({ message: '가격을 입력해주세요.'})
    price: number

    @IsDate()
    @IsNotEmpty({ message: '티켓 오픈 날짜와 시간을 입력해주세요.'})
    ticketOpenDate: Date

    @IsDate()
    @IsNotEmpty({ message: '티켓 마감 날짜와 시간을 입력해주세요.'})
    ticketCloseDate: Date

    @IsArray()
    @IsNotEmpty({ message: '공연 날짜와 시간을 입력해주세요.'})
    @IsDate({ each: true }) // : Date 타입인지 확인하는 거임.
    showDate: Date[]
    // @IsDateString() : ISO 8601 형식의 날짜 문자열인지 확인하는 거임.

    @IsNumber()
    @IsNotEmpty({ message: '좌석 수를 입력해주세요.'})
    seat: number
}