import { IsString } from "class-validator";

export class FindShowsKeywordDto {
    @IsString()
    keyword: string;
}