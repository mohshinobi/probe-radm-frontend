import { FormInputType } from "@core/enums";

interface Validation {
  constraints: any[],
  errorMessages: { [key: string]: string }
}

interface Option {
  key: number|string,
  value: number|string
}

export class BaseField<T> {

  value: T | undefined;
  key: string = '';
  label: string = '';
  icon: string = '';
  placeholder: string = '';
  validation: Validation = { constraints: [], errorMessages: {} };
  order: number = 1;
  type: FormInputType = FormInputType.TEXT;
  options: Option[] = [];
  multiple: boolean = false;
  accept: string = '*';

  constructor(
    params: {
      value?: T,
      key?: string,
      label?: string,
      icon?: string,
      placeholder?: string,
      validation?: Validation,
      order?: number,
      type?: FormInputType,
      options?: Option[],
      multiple?: boolean,
      accept?: string
    } = {}) {

    this.value = params.value;
    this.key = params.key ?? this.key;
    this.label = params.label ?? this.label;
    this.icon = params.icon ?? this.icon;
    this.placeholder = params.placeholder ?? this.placeholder;
    this.validation = params.validation ?? this.validation;
    this.order = params.order ?? this.order;
    this.type = params.type ?? this.type;
    this.options = params.options ?? this.options;
    this.accept = params.accept ?? this.accept;


    if (this.type === FormInputType.SELECT || this.type === FormInputType.FILE) {
      this.multiple = params.multiple ?? this.multiple;
    }
  }
}
