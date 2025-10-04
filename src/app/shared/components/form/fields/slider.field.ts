import { FormInputType } from "@core/enums";
import { BaseField } from "./base.field";
import { NumberInput } from "@angular/cdk/coercion";

export class SliderField extends BaseField<NumberInput> {
  override type = FormInputType.SLIDER;
}