/** showDate로 받는 공연 상영시간 배열이 오름차순인지 채크 */
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";

@ValidatorConstraint({ name: "isSortedDates", async: false })
export class IsSortedDatesValidator implements ValidatorConstraintInterface {
  validate(showDates: Date[], args: ValidationArguments): boolean {
    for (let i = 1; i < showDates.length; i++) {
      if (showDates[i] < showDates[i - 1]) {
        return false;
      }
    }

    return true;
  }
}
