import { Component, Input } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { BaseInputModule } from "./base-input.module";
import { BaseField } from "../fields";

@Component({
    template: '',
    imports: [
        BaseInputModule,
    ]
})
export class BaseInputComponent<T> {

    @Input() field!: BaseField<T>;
    @Input() form!: FormGroup;

    get errors() {   

        let key = this.field.key;
        let errors = this.form.controls[key].errors;
        let message: string = "";

        if (errors != null) {
            Object.keys(errors).forEach(keyError => {
              message = this.field.validation.errorMessages[keyError]
            });
        }
        
        return message;
    }
}