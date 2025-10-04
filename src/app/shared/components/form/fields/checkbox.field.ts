import { FormInputType } from "@core/enums";
import { BaseField } from "./base.field";

export class CheckboxField extends BaseField<boolean> {
  override type = FormInputType.CHECKBOX;
}