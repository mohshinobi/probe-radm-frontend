import { FormInputType } from "@core/enums";
import { BaseField } from "./base.field";

export class SlideToggleField extends BaseField<any> {
  override type = FormInputType.SLIDE_TOGGLE;
}