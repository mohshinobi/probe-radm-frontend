import { Component, inject, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '@core/services/auth.service';
import { TokenService } from '@core/services/token.service';
import { UsersService } from '@core/services/users.service';

interface PasswordVisibility {
  new: boolean;
  confirm: boolean;
}

const PASSWORD_PATTERN = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])(?![^;~]*[;~])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{15,}$/;

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  providers: [UsersService],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss'
})
export class ChangePasswordComponent implements OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly tokenService = inject(TokenService);
  private readonly toastr = inject(ToastrService);
  private readonly _usersService = inject(UsersService);

  passwordVisibility: PasswordVisibility = {
    new: false,
    confirm: false
  };

  changePasswordForm = this.fb.group({
    newPassword: ['', [
      Validators.required,
      Validators.minLength(15),
      Validators.maxLength(40),
      Validators.pattern(PASSWORD_PATTERN)
    ]],
    confirmPassword: ['', [Validators.required]]
  });

  constructor() {
    this.changePasswordForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.validatePasswordMatch();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getFieldError(fieldName: string): string | null {
    const control = this.changePasswordForm.get(fieldName);
    if (!control?.errors) return null;

    const errors = control.errors;
    if (errors['required']) return 'This field is required';
    if (errors['minlength']) return 'Password must be at least 16 characters';
    if (errors['maxlength']) return 'Password must be at most 40 characters';
    if (errors['pattern']) return 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (excluding ; and ~).';
    if (errors['passwordMismatch']) return 'Passwords do not match';

    return null;
  }

  private validatePasswordMatch(): void {
    const { newPassword, confirmPassword } = this.changePasswordForm.value;
    const confirmControl = this.changePasswordForm.get('confirmPassword');

    if (!confirmControl) return;

    const currentErrors = confirmControl.errors || {};

    const hasPasswordMismatch = newPassword && confirmPassword && newPassword !== confirmPassword;
    if (hasPasswordMismatch) currentErrors['passwordMismatch'] = true;

    confirmControl.setErrors(Object.keys(currentErrors).length ? currentErrors : null);
  }

  togglePasswordVisibility(field: keyof PasswordVisibility): void {
    this.passwordVisibility[field] = !this.passwordVisibility[field];
  }

  getInputType(field: keyof PasswordVisibility): string {
    return this.passwordVisibility[field] ? 'text' : 'password';
  }

  getVisibilityIcon(field: keyof PasswordVisibility): string {
    return this.passwordVisibility[field] ? 'visibility_off' : 'visibility';
  }

  getVisibilityTooltip(field: keyof PasswordVisibility): string {
    return this.passwordVisibility[field] ? 'Hide Password' : 'Show Password';
  }

  onSubmit(): void {

    if (this.changePasswordForm.invalid) {
      return;
    }

    const { newPassword } = this.changePasswordForm.getRawValue();

    if (!newPassword) {
      return;
    }

    this._usersService.changePassword(this.tokenService?.getUser()?.username || "", { newPassword })
      .subscribe({
        next: (response: any) => {
          this.toastr.success(response.message || 'Password changed successfully!');
          this.authService.logout();
        },
        error: (response) => {
          this.toastr.error(response?.error?.error || 'Failed to change password');
        }
      });
  }
}
