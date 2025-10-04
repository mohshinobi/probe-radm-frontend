import { Component, DestroyRef, inject, Input, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { ToastrService } from 'ngx-toastr';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RuleFlowService } from '../rule-flow.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import {MatSelectModule} from "@angular/material/select";

@Component({
    selector: 'app-rule-flow-edit',
    imports: [ReactiveFormsModule, MatFormFieldModule, MatDividerModule, MatInputModule, MatButtonModule, MatIconModule, MatSelectModule],
    templateUrl: './edit.component.html',
    styleUrl: './edit.component.scss',
    providers: [RuleFlowService]
})
export class RuleFlowEditComponent  implements OnInit {

  private _service = inject(RuleFlowService);
  private readonly formBuilder = inject(FormBuilder);
  private _destroy$ = inject(DestroyRef);
  private _router = inject(Router);

  @Input() sid!: number;

  toastr = inject(ToastrService);

  searchRuleFlow = new FormGroup({
    sid: new FormControl<number>(0)
  });

  editRuleFlow = this.formBuilder.group({
    sid: [],
    action: ['', Validators.required],
    msg: ['', Validators.required],
    threshold: [],
    protocol: [],
    src_ip: [],
    dest_ip: [],
    direction: [],
    src_port: [],
    dest_port: [],
    options: [],
    status: [],
    rev: [],
    source: [],
  });

  ngOnInit(): void {
    if(this.sid){
      this.searchRuleFlow.patchValue({ sid: this.sid });
      this.submitSearchRuleFlow();
    }
  }

  submitSearchRuleFlow( ){
    const sid = this.searchRuleFlow.value.sid  ?? 0 ;

    this._service.getRuleFlowBySid(sid)
    .pipe(takeUntilDestroyed(this._destroy$))
    .subscribe({
      next:(data : any ) => {
        this.editRuleFlow.patchValue(data);
      },
      error: () => {
        this.toastr.error('Error when searching rule by sid');
      },
    });
  }

  submitEditRuleFlow(): void {
    if (!this.editRuleFlow.valid) {
      if (this.editRuleFlow.get('action')?.invalid || this.editRuleFlow.get('msg')?.invalid) {
        this.toastr.error('Les champs "Action" et "Message" sont requis');
      } else {
        this.toastr.error('Veuillez corriger les erreurs du formulaire');
      }
      return;
    }
    const { action, threshold, msg, sid } = this.editRuleFlow.value;
    const filteredParams = { action, threshold, msg };

    this._service.updateRuleFlowBySid(sid ?? 0, filteredParams)
    .pipe(takeUntilDestroyed(this._destroy$))
    .subscribe({
      next: () => {
        this._service.selectedRuleFileName.set(this.editRuleFlow.value.source ||'');
        this._router.navigate(['/operator/parameters/rules/view-rules']);
        this.toastr.success('Rule updated successfully');
      },
      error: () => {
        this.toastr.error('Failed to update rule');
      },
    });
  }
}
