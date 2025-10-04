import { FormInputType } from "@core/enums";
import { BaseField } from "./base.field";

export class TextField extends BaseField<string> {
  override type = FormInputType.TEXT;
}