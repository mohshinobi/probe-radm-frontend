import { FormInputType } from "@core/enums";
import { BaseField } from "./base.field";

export class PasswordField extends BaseField<string> {
  override type = FormInputType.PASSWORD;
}