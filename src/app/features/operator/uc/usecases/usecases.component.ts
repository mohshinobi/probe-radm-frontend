import {AfterViewInit, Component, inject, OnDestroy, Renderer2, signal} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UsecasesService } from './usecases.service';
import { FormGroup } from '@angular/forms';
import { TableColumnInterface } from '@core/interfaces';
import { BaseField } from '@shared/components/form/fields';
import { UsecasesFormService } from '@core/services/forms/usecases-form.service';
import { TableComponent } from '@shared/components/table/table.component';
import {Router} from '@angular/router';
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {ToastrService} from "ngx-toastr";
import {PageHeaderComponent} from "@layout/header/page-header.component";

@Component({
  selector: 'app-usecases',
  standalone: true,
  imports: [
    MatCardModule,
    MatTooltipModule,
    TableComponent,
    MatButton,
    MatIcon,
    MatIconButton,
    PageHeaderComponent
  ],
  providers: [UsecasesService, UsecasesFormService],
  templateUrl: './usecases.component.html',
  styleUrl: './usecases.component.scss'
})
export class UsecasesComponent{

  private _usecasesService     = inject(UsecasesService);
  private _usecasesFormService = inject(UsecasesFormService);
  private _router = inject(Router);
  private _renderer = inject(Renderer2)
  private _toast = inject(ToastrService);

  fields!: BaseField<string | number>[];
  length = this._usecasesService.length;
  displayedColumns = this._usecasesService.displayedColumns;
  form = signal<FormGroup<any>>(this._usecasesFormService.getFormGroup());
  ordersTableColumns: TableColumnInterface[] = this._usecasesService.ordersTableColumns;

  loadingFile: string | null = null;
  downloadingFile: string | null = null;
  usecases = this._usecasesService.generateRandomObjects();
   getCellDatas(data: any) {
    switch (data.actionName) {
      case 'details':
        this.redirectToDetail(data);
        break;
      case 'redirectToRule':
        //this.redirectToRuleManagement(data);
        break;
      case 'delete':
       // this.openDeleteModal(data)
        break;
      // case 'checkbox':
      //   this._commonService.onToggleCheckbox(data, this.checkedIds);
      //   break;
      default:
        break;
    }
  }

  redirectToDetail(data: any) {
    this._router.navigate(['/operator/uc/usecases/details'], {
      queryParams: {
        name: data.usecase.name,
        description: data.usecase.description,
        steps: JSON.stringify(data.usecase.steps),
        TTPs: JSON.stringify(data.usecase.ttps),
        severity: data.usecase.severity,
        tags: JSON.stringify(data.usecase.tags),
        timespan: data.usecase.timespan,
        progress: data.usecase.progress,
        rules: JSON.stringify(data.rules ?? {})
      }
    });
  }

  uploadFile(): void {
    const input = this.createFileInput();
    input.onchange = (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;
      this.manageFileUpload(file);
    };
    input.click();
  }

  private createFileInput(): HTMLInputElement {
    const input = document.createElement('input');
    input.type = 'file';
    return input;
  }

  private manageFileUpload(file: File): void {
    const formData = new FormData();
    formData.append('file', file);
    this.loadingFile = file.name;
    this._usecasesService.upload(formData).subscribe({
      next: () => {
        this._toast.success(`File "${file.name}" uploaded successfully!`);
        this.loadingFile = null;
      },
      error: (err) => {
        this._toast.error("Error while uploading the file! " + err.error);
        this.loadingFile = null;
      }
    })
  }
}
