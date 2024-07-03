/** 티켓 오픈 시간보다 티켓 마감 시간이 빠르지 않은 지 체크 */
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";

@ValidatorConstraint({ name: "IsAfter", async: false })
export class IsAfter implements ValidatorConstraintInterface {
  validate(ticketCloseDate: Date, args: ValidationArguments): boolean {
    const ticketOpenDate: Date = args.object[args.constraints[0]];

    return ticketOpenDate < ticketCloseDate;
  }
}
// args.object[args.property] === ticketCloseDate
// args.objest[args.constranints[0]] === ticketOpenDate
