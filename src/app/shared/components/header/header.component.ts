import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, EventEmitter, inject, Output, TemplateRef, ViewChild } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RoleService } from '@core/services/role.service';
import { MatBadgeModule } from '@angular/material/badge';
import { NgClass } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Router, RouterLink } from '@angular/router';
import { AuthService, CommonService, TrafficService } from '@core/services';
import { TokenService } from '@core/services/token.service';
import { NotificationBellComponent } from '../bell/bell.component';
import { NotificationService } from '../bell/notification.service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ToastrService } from 'ngx-toastr';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserInterface } from '@core/interfaces';
import { ModalComponent } from '../modal/modal.component';
import { MatDialog } from '@angular/material/dialog';
import { UsersService } from '@core/services/users.service';
import { MatInputModule } from '@angular/material/input';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  imports: [
    MatMenuModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatSlideToggleModule,
    RouterLink,
    NgClass,
    NotificationBellComponent,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatInputModule
  ],
  providers: [UsersService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  private _roleService = inject(RoleService);
  private _trafficService = inject(TrafficService);
  private _tokenService = inject(TokenService);
  private _notificationService = inject(NotificationService);
  private _commonService = inject(CommonService);
  private _toastr = inject(ToastrService);
  private _dialog = inject(MatDialog);
  private destroyRef = inject(DestroyRef);
  private _usersService = inject(UsersService);
  private _router = inject(Router);
  private _authService = inject(AuthService)

  @Output() sideNavAction = new EventEmitter<any>();
  @ViewChild('changePasswordTemplate') changePasswordTemplate!: TemplateRef<any>;

  changePasswordForm: FormGroup;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;
  showCurrentPassword: boolean = false;
  homePage: string = '#' // used to change logo homepage redirection
  userName: string = '';
  version: string = ' ';
  notified = false;
  roleUser: any;

  ngOnInit() {
    // Change home page url logo by roleUser
    switch (this.roleUser) {
      case 'administrator':
        this.homePage = 'administrator/overview';
        break;
      case 'operator':
        this.homePage = 'operator/overview';
        break;
      case 'auditor':
        this.homePage = 'auditor/overview';
        break;
      default:
        this.homePage = '#';
    }

    localStorage.removeItem('app_notifications');
    setTimeout(() => {
      this.notify();
    }, 1000);

  }

  constructor(private cdr: ChangeDetectorRef, private fb: FormBuilder) {

    this.userName = this._tokenService.getUser()?.username || '';

    this.roleUser = this._roleService.getRole()?.toLowerCase();

    this._trafficService.getVersion().subscribe({
      next: (response: any) => {
        if (response && response.full_version) {
          this.version = response.full_version;
        } else {
          this.version = 'Unknown Version';
        }
        this.cdr.detectChanges();
      },
    });

    this.changePasswordForm = this.fb.group({
      currentPassword: ['', [
        Validators.required,
        Validators.minLength(15),
        Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])(?![^;~]*[;~])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{15,}$/)
      ]],
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
  }

  

  showOnlyUnread = false;

  isNavOpen: boolean = false;

  toggleNav() {
    this.isNavOpen = !this.isNavOpen;
    this.sideNavAction.emit(this.isNavOpen ? 'opened' : 'closed');
    return this.isNavOpen;
  }

  licenceInfos = toSignal(this._trafficService.getLicenceInfo());

  notify() {
    const licenceDateStr = this.licenceInfos()?.date;
    if (licenceDateStr) {
      const licenceDate = new Date(licenceDateStr);
      const today = new Date();
      const diffInMs = licenceDate.getTime() - today.getTime();
      const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

      if (diffInDays <= 10) {
        this._notificationService.error(`Licence expires in ${diffInDays} days!`);
      } else if (diffInDays <= 30) {
        this._notificationService.warning(`Licence expires in ${diffInDays} days.`);
      } else if (diffInDays <= 60) {
        this._notificationService.info(`Licence expires in ${diffInDays} days.`);
      }
    }
  }

  passwordMatchValidator(formGroup: AbstractControl): ValidationErrors | null {
  const newPassword = formGroup.get('newPassword')?.value;
  const confirmPassword = formGroup.get('confirmPassword')?.value;
  if (newPassword !== confirmPassword) {
    // Set the error on the confirmPassword control
    formGroup.get('confirmPassword')?.setErrors({ mismatch: true });
    return { mismatch: true };
  } else {
    // Clear the error if they match
    formGroup.get('confirmPassword')?.setErrors(null);
    return null;
  }
}

  generatePassword() {
    const generatedPassword = this._commonService.generatePassword();
    this.changePasswordForm.patchValue({
      newPassword: generatedPassword,
    });
    // Copier le mot de passe généré dans le presse-papiers
    this._commonService.copyToClipboard(generatedPassword);
    this._toastr.success('Password generated and copied to clipboard.');
  }

  openChangePasswordModal(): void {
    this.showNewPassword = false;
    this.showConfirmPassword = false;
    this.showCurrentPassword = true;

    this.changePasswordForm.reset();

    const dialogRef = this._dialog.open(ModalComponent, {
      panelClass: 'custom-dialog', // Ensure this matches your CSS class
      backdropClass: "blur-bg",
      disableClose: true,
      width: '600px',
      data: {
        disableConfirm: true,
        title: `Change my own password (${this.userName})`,
        contentTemplate: this.changePasswordTemplate,
        contentContext: {
          username: this.userName,
          isFormValid: this.changePasswordForm.valid,
          getFormValidity: () => this.changePasswordForm.valid
        },
        disableClose: true
      },
    });

    dialogRef.backdropClick().subscribe(() => {
      this._toastr.info('You clicked outside the dialog. Please complete your action or close the dialog.');
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.changePassword(this.changePasswordForm);
      } else {
        this.changePasswordForm.reset();
      }
    });
  }
  changePassword(form: FormGroup) {
    if (form.valid) {
      const params = form.value;
      this._usersService.changePassword(this.userName, params)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(
          {
            next: (response: any) => {
              this._toastr.success(response.message);
              this._dialog.closeAll(); // Fermer la modal après succès
            },
            error: (error: any) => {
              this._toastr.error(error.error?.error);
            }
          }
        );
    } else {
      this._dialog.closeAll();
    }
  }

  logout() {
    this._notificationService.clearAll();
    this._authService.logout();
  }
}
