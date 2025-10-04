import { FormInputType } from "@core/enums";
import { BaseField } from "./base.field";

export class EmailField extends BaseField<string> {
  override type = FormInputType.EMAIL;
}