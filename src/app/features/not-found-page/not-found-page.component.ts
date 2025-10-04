import { Component, inject } from '@angular/core';
import { Location } from '@angular/common'

@Component({
    selector: 'app-not-found-page',
    imports: [],
    templateUrl: './not-found-page.component.html',
    styleUrl: './not-found-page.component.scss'
})
export class NotFoundPageComponent {
  
  location = inject(Location);
  
  goBackToPrevPage(): void {
    this.location.back();
  }

}
