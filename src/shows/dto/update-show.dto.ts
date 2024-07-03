import { PartialType } from "@nestjs/mapped-types";
import { CreateShowDto } from "./create-show.dto";

export class UpdateShowDto extends PartialType(CreateShowDto) {}
// showDate: Date[]를 입력했을 때는, seat: number를 입력해야하게 하는 커스텀 벨리데이터를 만들자.