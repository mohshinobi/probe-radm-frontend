import { BaseField } from "./base.field";
import { FormInputType } from "@core/enums";

export class SelectField extends BaseField<string> {
  override type = FormInputType.SELECT;
}