/** 티켓 오픈 시간보다 티켓 마감 시간이 빠르지 않은 지 체크
 * 커스텀 class-validator 어떻게 작성하지?
 */

import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";

@ValidatorConstraint({ name: "IsAfter", async: false })
export class IsAfter implements ValidatorConstraintInterface {
  validate(ticketCloseDate: Date, args: ValidationArguments) {
    const ticketOpenDate: Date = args.object[args.constraints[0]];
    console.log("ticketOpenDate: ", ticketOpenDate);
    console.log("ticketCloseDate: ", ticketCloseDate);
    return ticketOpenDate < ticketCloseDate;
  }
}
// args.object[args.property] === ticketCloseDate
// args.objest[args.constranints[0]] === ticketOpenDate
// 좀 더 찾아보자.
