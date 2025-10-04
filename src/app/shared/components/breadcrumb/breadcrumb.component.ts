import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Breadcrumb, BreadcrumbService } from '@core/services/breadcrumb.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-breadcrumb',
    templateUrl: './breadcrumb.component.html',
    styleUrls: ['./breadcrumb.component.scss'],
    imports: [
        AsyncPipe,
        RouterLink
    ]
})
export class BreadcrumbComponent {

    private _breadcrumbService = inject(BreadcrumbService);
    breadcrumbs$!: Observable<Breadcrumb[]>;

    ngOnInit() {
        this.breadcrumbs$ = this._breadcrumbService.breadcrumbs$;
    }
}
