import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LoginInterface } from '@core/interfaces';
import { AuthService } from '@core/services/auth.service';

interface LoginForm {
  username: FormControl<string>;
  password: FormControl<string>;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  showPassword = false;

  readonly loginForm = new FormGroup<LoginForm>({
    username: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
      ]
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
      ]
    })
  });

  get usernameControl(): FormControl<string> {
    return this.loginForm.controls.username;
  }

  get passwordControl(): FormControl<string> {
    return this.loginForm.controls.password;
  }

  get usernameErrorMessage(): string | null {
    const control = this.usernameControl;
    if (control.touched && control.invalid) {
      if (control.hasError('required')) {
        return 'Username is required';
      }
    }
    return null;
  }

  get passwordErrorMessage(): string | null {
    const control = this.passwordControl;
    if (control.touched && control.invalid) {
      if (control.hasError('required')) {
        return 'Password is required';
      }
    }
    return null;
  }

  onSubmit(): void {
    const { username, password } = this.loginForm.value;

    const loginPayload: LoginInterface = {
      username: username?.trim(),
      password,
      token: ''
    };

    this.authService.login(loginPayload);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
