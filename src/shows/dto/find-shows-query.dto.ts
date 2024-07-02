import { IsEnum, IsOptional, IsString } from "class-validator";
import { SHOW_CATEGORY } from "../types/show-category.type";

export class FindShowsQuery {
  @IsOptional()
  @IsEnum(SHOW_CATEGORY)
  category: SHOW_CATEGORY;

  @IsOptional()
  @IsEnum(["ASC", "DESC"])
  sort: "ASC" | "DESC";
}
