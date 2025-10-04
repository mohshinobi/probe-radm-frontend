import { TrueFalseCellComponent } from './../../../shared/components/table/cell/true-false-cell.component';
import { Component, DestroyRef, inject, signal, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { UserInterface, TableColumnInterface } from '@core/interfaces';
import { TableComponent } from '../../../shared/components/table/table.component';
import { TableCellTypeEnum } from '@core/enums';
import { BaseField } from '@shared/components/form/fields';
import { Router } from '@angular/router';
import { UsersFormService } from '@core/services/forms/user-form.service';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { UserQueryParams, UsersService } from '@core/services/users.service';
import { ToastrService } from 'ngx-toastr';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { RoleService } from '@core/services/role.service';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, map, switchMap } from 'rxjs';
import { error } from 'highcharts';
import { TokenService } from '@core/services/token.service';
import { CommonService } from '@core/services';
import { TimeSelectorComponent } from "@shared/components/time-selector/time-selector.component";
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.scss'],
    imports: [
        CommonModule,
        MatTableModule,
        MatDialogModule,
        MatButtonModule,
        MatCardModule,
        MatIconModule,
        MatToolbarModule,
        MatCheckboxModule,
        MatSlideToggleModule,
        TableComponent,
        MatFormFieldModule,
        MatInputModule,
        MatGridListModule,
        MatGridListModule,
        ReactiveFormsModule,
        MatSelectModule,
        TimeSelectorComponent,
        MatTooltipModule
    ],
    providers: [UsersService]
})
export class UsersComponent {
  @ViewChild('addUserTemplate') addUserTemplate!: TemplateRef<any>;
  @ViewChild('updateUserTemplate') updateUserTemplate!: TemplateRef<any>;
  @ViewChild('changePasswordTemplate') changePasswordTemplate!: TemplateRef<any>;
  @ViewChild('deleteTemplate') deleteTemplate!: TemplateRef<any>;

  private readonly _usersService = inject(UsersService);
  private readonly _router = inject(Router);
  private readonly _userFormService = inject(UsersFormService);
  private readonly _roleService = inject(RoleService);
  private readonly _tokenService = inject(TokenService);
  private readonly _commonService = inject(CommonService);

  private destroyRef = inject(DestroyRef);

  fields!: BaseField<string | number>[];
  length: number = 0;
  displayedColumns = [
    "id",
    "username",
    "enabled",
    "authorized",
    "firstConnection",
    "createdAt",
    "updatedAt",
    "deletedAt",
    "roles",
    // 'select',
    'actions'
  ];

  selection = new SelectionModel<UserInterface>(true, []);
  isEditing: boolean = false;
  userToDelete: UserInterface | null = null;
  expandedUser: UserInterface | null = null;

  dialog = inject(MatDialog);
  toastr = inject(ToastrService);

  usersQueryParams = signal<UserQueryParams>({ 'order[createdAt]': 'desc', page: 1, size: 10 });
  form = signal<FormGroup<any>>(this._userFormService.getFormGroup());

  showNewPassword: boolean = false;
  showConfirmNewPassword: boolean = false;
  addUserForm: FormGroup;
  updateUserForm: FormGroup;
  changePasswordForm: FormGroup;

  readonly users = toSignal(
    combineLatest([toObservable(this.usersQueryParams)])
      .pipe(
        switchMap(([params]) => {
          return this._usersService.getAllUsers(params)
            .pipe(map((response) => {
              this.length = response.total;
              return response.users;
            })
            );
        })
      )
  );

  roles = ['ROLE_ADMIN', 'ROLE_OPERATOR'];

  constructor(private fb: FormBuilder) {
    this.fields = this._userFormService.getFormFields();

    this.changePasswordForm = this.fb.group({
      newPassword: ['', [
        Validators.required,
        Validators.minLength(15),
        Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])(?![^;~]*[;~])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{15,}$/)
      ]],
      confirmPassword: ['', [
        Validators.required,
        Validators.minLength(15),
        Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])(?![^;~]*[;~])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{15,}$/)
      ]],
    }, { validators: this.passwordMatchValidator });

    this.addUserForm = this.fb.group({
      username: ['', [
        Validators.required, 
        Validators.minLength(4), 
        Validators.maxLength(20),
        Validators.pattern(/^[A-Za-z0-9-_]+$/) // Allows uppercase, lowercase, numbers, hyphens, and underscores
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(15),
        Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])(?![^;~]*[;~])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{15,}$/)
      ]],
      confirmPassword: ['', [
        Validators.required,
        Validators.minLength(15),
        Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])(?![^;~]*[;~])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{15,}$/)
      ]],
      roles: ['', Validators.required],
      enabled: [true],
      authorized: [true],
    }, { validators: this.addPasswordMatchValidator }); 

    this.updateUserForm = this.fb.group({
      id: [''],
      username: ['', [
        Validators.required, 
        Validators.minLength(4), 
        Validators.maxLength(20),
        Validators.pattern(/^[A-Za-z0-9-_]+$/) // Allows uppercase, lowercase, numbers, hyphens, and underscores
      ]],
      roles: ['', Validators.required],
      enabled: [],
      authorized: [],
    });
  }

  // Charger les utilisateurs depuis l'API
  get ordersTableColumns(): TableColumnInterface[] {
    return [
      { name: '', dataKey: 'id', type: TableCellTypeEnum.CHECKBOX2, isSortable: false},
      { name: 'username', dataKey: 'username', type: TableCellTypeEnum.TEXT, isSortable: false},
      { name: 'roles', dataKey: 'roles', type: TableCellTypeEnum.TEXT, isSortable: false},
      { name: 'enabled', dataKey: 'enabled', type: TableCellTypeEnum.TRUE_FALSE , isSortable: false},
      { name: 'authorized', dataKey: 'authorized', type: TableCellTypeEnum.TRUE_FALSE , isSortable: false},
      { name: 'First Connection', dataKey: 'firstConnection', type: TableCellTypeEnum.TRUE_FALSE , isSortable: false},
      { name: 'Created At', dataKey: 'createdAt', type: TableCellTypeEnum.DATE, isSortable: false},
      { name: 'Updated At', dataKey: 'updatedAt', type: TableCellTypeEnum.DATE, isSortable: false},
      {
        name: 'Action',
        dataKey: 'actions',
        type: TableCellTypeEnum.ACTIONS,
        actions: this.getDynamicActions(), isSortable: false
      },
    ];
  }

  getDynamicActions(): any[] {
    const currentUser = this.getUserFromStorage();
    // Retourne les actions sans "Change Password" pour l'utilisateur connecté
    return [
      { name: 'update', icon: 'edit', label: 'Edit User', condition: (row: any) => row.username !== currentUser && row.username !== 'admin' },
      { name: 'delete', icon: 'delete', label: 'Delete User', condition: (row: any) => row.username !== currentUser && row.username !== 'admin' },
      {
        name: 'changePassword',
        icon: 'vpn_key',
        label: 'Reset Password',
        condition: (row: any) => row.username !== currentUser && row.username !== 'admin'
      }
    ];
  }

  tableActions(tableActions: UserQueryParams) {
    this.usersQueryParams.update(() => ({ ...this.usersQueryParams(), ...tableActions }));
  }

  getUserFromStorage() {
    return this._tokenService.getUser()?.username ?? '';
  }

  deleteUser(data: any) {
    const userId = parseInt(data?.id ?? '', 10);

    if (userId) {
      this._usersService.deleteUser(userId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(
          {
            next: (response: any) => {
              this.toastr.success('User deleted successfully');
              this.usersQueryParams.update(() => ({ ...this.usersQueryParams() }));
            },
            error: (error: any) => {
              this.toastr.error(error.error?.detail, 'Error deleting user!');
              this.dialog.closeAll();
            },
          }
        );
    }
  }

  passwordMatchValidator(formGroup: AbstractControl): ValidationErrors | null {
  const newPassword = formGroup.get('newPassword')?.value;
  const confirmPassword = formGroup.get('confirmPassword')?.value;
  if (newPassword !== confirmPassword) {
    formGroup.get('confirmPassword')?.setErrors({ mismatch: true });
    return { mismatch: true };
  } else {
    formGroup.get('confirmPassword')?.setErrors(null);
    return null;
  }
}

addPasswordMatchValidator(addUserForm: AbstractControl): ValidationErrors | null {
  const newPassword = addUserForm.get('password')?.value;
  const confirmPassword = addUserForm.get('confirmPassword')?.value;
  console.log(newPassword, confirmPassword)
  if (newPassword !== confirmPassword) {
    addUserForm.get('confirmPassword')?.setErrors({ mismatch: true });
    return { mismatch: true };
  } else {
    addUserForm.get('confirmPassword')?.setErrors(null);
    return null;
  }
  return null
}

  changePasswordByAdmin(form: FormGroup, user: UserInterface) {
    const username = user?.username;
    if (form.valid && username && this._roleService.isAdministrator()) {
      const params = form.value;

      this._usersService.changePassword(username, params)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(
          {
            next: (response: any) => {
              this.toastr.success(response.message);
              this.usersQueryParams.update(() => ({ ...this.usersQueryParams() }));
              this.dialog.closeAll();
            },
            error: (error: any) => {
              this.toastr.error(error.error?.error);
            }
          }
        );
    } else {
      this.dialog.closeAll();
    }
  }

  // modal add user
 openAddUserModal(): void {
  this.addUserForm.reset();
  //set default values for the form
  this.addUserForm.patchValue({
    enabled: true,
    authorized: true,
  });
  this.isEditing = false;
  this.showNewPassword = false;
  this.showConfirmNewPassword = false;
  this.addUserForm.markAsUntouched();
  this.addUserForm.markAsPristine();
  this.addUserForm.updateValueAndValidity();
  
   const dialogRef = this.dialog.open(ModalComponent, {
    backdropClass: "blur-bg",
    width: '600px',
    data: {
      title: 'Add User',
      contentTemplate: this.addUserTemplate,
      contentContext: {
        isFormValid: this.addUserForm.valid,
        getFormValidity: () => this.addUserForm.valid
      },
    },
    disableClose: true,
  });
  
  dialogRef.backdropClick().subscribe(() => {
    this.toastr.info('You clicked outside the dialog. Please complete your action or close the dialog.');
  });

  dialogRef.afterClosed().subscribe((confirmed) => {
    if (confirmed) {
      console.log('this.addUserForm.valid', this.addUserForm.valid);
      if (this.addUserForm.valid) {
        this.createUser();
      } else {
        this.toastr.error('Please fill in all required fields correctly.');
        this.addUserForm.markAllAsTouched();
      }
    } else {
      this.addUserForm.reset(); // Réinitialiser le formulaire après la fermeture
      if (this.isEditing) {
        this.isEditing = false;
      } else {
        this._router.navigate(['/administrator/users']);
      }
    }
  });
}

  // modal update user
  openUpdateUserModal(user: UserInterface): void {
    this.isEditing = true;
    this.updateUserForm.patchValue({
      id: user.id,
      username: user.username,
      roles: user.roles[0], // Assuming roles is an array
      enabled: user.enabled,
      authorized: user.authorized,
    });
    const dialogRef = this.dialog.open(ModalComponent, {
      backdropClass: "blur-bg",
      width: '600px',
      data: {
        title: 'Update User',
        contentTemplate: this.updateUserTemplate,
        contentContext: {
          isFormValid: this.updateUserForm.valid,
          getFormValidity: () => this.updateUserForm.valid
        },
      },
      disableClose: true,
    });

    dialogRef.backdropClick().subscribe(() => {
      this.toastr.info('You clicked outside the dialog. Please complete your action or close the dialog.');
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        if (this.updateUserForm.valid) {
          this.updateUser();
        } else {
          this.toastr.error('Please fill in all required fields correctly.');
          this.updateUserForm.markAllAsTouched();
        }
      } else {
        this.updateUserForm.reset(); // Réinitialiser le formulaire après la fermeture
        if (this.isEditing) {
          this.isEditing = false;
        } else {
          this._router.navigate(['/administrator/users']);
        }
      }
    });
  }


  // modal delete user
  openDeleteModal(user: UserInterface): void {
    const dialogRef = this.dialog.open(ModalComponent, {
      backdropClass: "blur-bg",
      width: '400px',
      data: {
        title: 'Delete User',
        contentTemplate: this.deleteTemplate,
        contentContext: { username: user.username },
      },
      disableClose: true,
    });

    dialogRef.backdropClick().subscribe(() => {
      this.toastr.info('You clicked outside the dialog. Please complete your action or close the dialog.');
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.deleteUser(user);
      }
    });
  }

  closeDialog() {
    this.dialog.closeAll();
  }

  createUser() {
  if (this.addUserForm.invalid) {
    this.toastr.error('Please fill in all required fields correctly.');
    this.addUserForm.markAllAsTouched();
    return;
  }
  const { confirmPassword, ...userData } = this.addUserForm.value;
  const params = this.prepareFormData(userData, userData.roles, null);
  this._usersService.addNewUser(params)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (response: any) => {
        // selon la réponse de l'API, on peut afficher un message de succès
        switch(response.status) {
          case 201:
            this.toastr.success('User created successfully');
            this.usersQueryParams.update(() => ({ ...this.usersQueryParams() }));
            this.addUserForm.reset();
            this.dialog.closeAll();
            break;
          case 422:
            this.toastr.error(response.error.error || 'Failed to create user');
            break;
          default:
            this.toastr.error('Unexpected response from server');
            break;
        }
      },
      error: (error: any) => {
        this.addUserForm.reset();
        this.dialog.closeAll();
        this.toastr.error(error.error);
      }
    });
  } 

  params!: object;

  prepareFormData(rest:any[],roles:string, user:any): UserQueryParams{
    if(user)
    {
      this.params = {
        ...rest,
        roles: [roles], // Conversion de `role` en `roles` sous forme de tableau
        updatedAt: new Date(), // Date actuelle
      }

    }else{
      this.params = {
        ...rest,
        roles: [roles], // Conversion de `role` en `roles` sous forme de tableau
        createdAt: new Date(), // Date actuelle
        firstConnection : true
    };
    }
    return this.params;
  }

  handleDataSet(action: any) {
    switch (action.actionName) {
      case 'update':
        this.openUpdateUserModal(action);
        break;
      case 'delete':
        this.openDeleteModal(action);
        break;
      case 'changePassword':
        this.openChangePasswordModal(action);
        break;
      case 'checkbox':
        this.onToggleCheckbox(action);
        break;
      default:
        console.warn(`Unhandled action: ${action.actionName}`);
    }
  }

  checkedIds: number[] = [];

  onToggleCheckbox(event: any) {
    const { id, checked } = event;

    if (checked && !this.checkedIds.includes(id)) {
      this.checkedIds.push(id);
    } else {
      this.checkedIds = this.checkedIds.filter(existingId => existingId !== id);
    }
  }

  userName = this._tokenService.getUser()?.username;

  deleteUsers(): void {
    if (!this.isSelectedUsers()) {
      this.toastr.error('No users selected for deletion.');
      return;
    }

    this._usersService.getDeleteUsers(this.checkedIds)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          const count = response.deleted ?? 0;
          const message = count > 0
            ? `${count} user${count > 1 ? 's' : ''} deleted successfully.`
            : 'No users were deleted.';

          this.toastr.success(message);
          this.usersQueryParams.update(() => ({ ...this.usersQueryParams() }));
          this.checkedIds = [];
        },
        error: (error: any) => {
          console.error(error);
          const errorMessage = error?.error?.message || 'An error occurred while deleting users.';
          this.toastr.error(errorMessage, 'Error');
          this.dialog.closeAll();
        }
      });
  }


  isSelectedUsers() {
    return this.checkedIds.length > 0;
  }

  openUsersDeleteModal(): void {
    const dialogRef = this.dialog.open(ModalComponent, {
      width: '400px',
      data: {
        title: 'Delete Users',
        contentTemplate: this.deleteTemplate
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.deleteUsers();
      }
    });
  }
  //modal change password
 openChangePasswordModal(user: UserInterface): void {
  this.showNewPassword = false;
  this.showConfirmNewPassword = false;
  this.changePasswordForm.reset();
  const dialogRef = this.dialog.open(ModalComponent, {
    panelClass: 'custom-dialog', // Ensure this matches your CSS class
    backdropClass: "blur-bg",
    disableClose: true,
    width: '600px',
    data: {
      title: 'Reset Password',
      contentTemplate: this.changePasswordTemplate,
      contentContext: {
        username: user.username,
        isFormValid: this.isChangePasswordFormValid,
        getFormValidity: () => this.changePasswordForm.valid
      },
    },
  });

  dialogRef.afterClosed().subscribe((confirmed) => {
    if (confirmed) {
      this.changePasswordByAdmin(this.changePasswordForm, user);
    } else {
      this.changePasswordForm.reset();
    }
  });
}

updateUser() {
  if (this.updateUserForm.invalid) {
    this.toastr.error('Please fill in all required fields correctly.');
    this.updateUserForm.markAllAsTouched();
    return;
  }
  const { id, ...userData } = this.updateUserForm.value;
  const params = this.prepareFormData(userData, userData.roles, { id });
  console.log('params', params);
  this._usersService.updateUserById(id, params)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (response: any) => {
        console.log('response', response);
        switch(response.status) {
          case 200:
            this.toastr.success(response.message || 'User updated successfully');
            this.usersQueryParams.update(() => ({ ...this.usersQueryParams() }));
            this.updateUserForm.reset();
            this.dialog.closeAll();
            break;
          case 422:
            this.toastr.error(response.error.error || 'Failed to update user');
            break;
          default:    
            this.toastr.error('Unexpected response from server');
            break;
        }
        this.updateUserForm.reset(); // Réinitialiser le formulaire après la mise à jour
        this.isEditing = false; // Réinitialiser l'état d'édition
      },
      error: (error: any) => {
        this.toastr.error(error.error?.message || 'Failed to update user');
      }
    });
  } 

  get newPassword() { return this.changePasswordForm.get('newPassword'); }
  get confirmPassword() { return this.changePasswordForm.get('confirmPassword'); }

  passwordsMatch(): boolean {
    const newPassword = this.changePasswordForm.get('newPassword')?.value;
    const confirmPassword = this.changePasswordForm.get('confirmPassword')?.value;
    return newPassword === confirmPassword;
  }
  get isChangePasswordFormValid(): boolean {
    return this.changePasswordForm.valid && this.passwordsMatch();
  }

  generatePassword(action:string) {
    const generatedPassword = this._commonService.generatePassword();
    switch (action) {
      case 'addUser':
        this.addUserForm.patchValue({
          password: generatedPassword,
        });
        break;
      case 'changePassword':
        this.changePasswordForm.patchValue({
          newPassword: generatedPassword,
        });
        break;
      }
    // Copier le mot de passe généré dans le presse-papiers
    this._commonService.copyToClipboard(generatedPassword);
    this.toastr.success('Password generated and copied to clipboard.');
  }


}