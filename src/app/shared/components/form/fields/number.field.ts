import { FormInputType } from "@core/enums";
import { BaseField } from "./base.field";

export class NumberField extends BaseField<number> {
  override type = FormInputType.NUMBER;
}