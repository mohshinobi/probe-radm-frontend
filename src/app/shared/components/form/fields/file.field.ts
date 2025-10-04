import { FormInputType } from "@core/enums";
import { BaseField } from "./base.field";

export class FileField extends BaseField<string> {
  override type = FormInputType.FILE;
  override icon: string = "attach_file";
}