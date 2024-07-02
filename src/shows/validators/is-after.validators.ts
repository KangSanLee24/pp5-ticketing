/** 티켓 오픈 시간보다 티켓 마감 시간이 빠르지 않은 지 체크 
 * 커스텀 class-validator 어떻게 작성하지?
*/

import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

@ValidatorConstraint({ name: 'IsAfter', async: false })
export class  IsAfter implements ValidatorConstraintInterface {
  validate(ticketOpenDate: Date, args: ValidationArguments) {
    const ticketCloseDate = args.object[args.property];
    return ticketOpenDate < ticketCloseDate;
  }
}