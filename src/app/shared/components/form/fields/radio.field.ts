import { FormInputType } from "@core/enums";
import { BaseField } from "./base.field";

export class RadioField extends BaseField<string> {
  override type = FormInputType.RADIO;
}