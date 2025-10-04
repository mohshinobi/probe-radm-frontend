import { Component } from '@angular/core';
import {TimeSelectorComponent} from "@shared/components/time-selector/time-selector.component";

@Component({
    selector: 'app-usecase',
    imports: [
        TimeSelectorComponent
    ],
    templateUrl: './usecase.component.html',
    styleUrl: './usecase.component.scss'
})
export class UsecaseComponent {
  title = 'Usecase Management';

}
