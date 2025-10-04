import { FormInputType } from "@core/enums";
import { 
    CheckboxInputComponent,
    DateInputComponent, 
    EmailInputComponent, 
    FileInputComponent, 
    NumberInputComponent, 
    RadioInputComponent, 
    SelectInputComponent, 
    SlideToggleInputComponent, 
    SliderInputComponent, 
    TextAreaInputComponent, 
    TextInputComponent } from "./inputs";

export class InputBuilder {

    constructor(private inputType: FormInputType) {}

    build() {

        const componentMap: { [key in FormInputType]: any }  = {
            [FormInputType.TEXT]        : TextInputComponent,
            [FormInputType.PASSWORD]    : TextInputComponent,
            [FormInputType.EMAIL]       : EmailInputComponent,
            [FormInputType.CHECKBOX]    : CheckboxInputComponent,
            [FormInputType.DATE]        : DateInputComponent,
            [FormInputType.FILE]        : FileInputComponent,
            [FormInputType.RADIO]       : RadioInputComponent,
            [FormInputType.SELECT]      : SelectInputComponent,
            [FormInputType.TEXTAREA]    : TextAreaInputComponent,
            [FormInputType.NUMBER]      : NumberInputComponent,
            [FormInputType.SLIDE_TOGGLE]: SlideToggleInputComponent,
            [FormInputType.SLIDER]      : SliderInputComponent
        }

        return componentMap[this.inputType];
    }
}