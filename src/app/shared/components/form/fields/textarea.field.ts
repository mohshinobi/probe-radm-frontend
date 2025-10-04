import { FormInputType } from "@core/enums";
import { BaseField } from "./base.field";

export class TextAreaField extends BaseField<string> {
  override type = FormInputType.TEXTAREA;
}