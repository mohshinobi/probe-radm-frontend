import { FormInputType } from "@core/enums";
import { BaseField } from "./base.field";

export class DateField extends BaseField<string> {
  override type = FormInputType.DATE;
}