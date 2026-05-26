import { CdkTrapFocus } from '@angular/cdk/a11y';
import { Component, computed, inject, PLATFORM_ID, signal } from '@angular/core';
import { email, form, FormField, required, submit, validate } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { AuthService } from './services/auth';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ErrorResponse } from '../../core/models/error.model';
import { isPlatformBrowser } from '@angular/common';
import { CurrentUserService } from '../../core/services/current-user-service';

@Component({
  selector: 'app-auth',
  imports: [
    CdkTrapFocus,
    MatInputModule,
    MatButtonModule,
    FormField,
    MatIconModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
  ],
  templateUrl: './auth.html',
  styleUrls: ['./auth.css', './auth.material.scss'],
})
export default class Auth {
  formAuthModel = signal({
    username: '',
    password: '',
  });

  formAuth = form(this.formAuthModel, (schemaPath) => {
    (required(schemaPath.username, { message: 'El usuario es obligatorio' }),
      required(schemaPath.password, { message: 'La contraseña es obligatoria' }));
  });

  formCreateAuthModel = signal({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
  });

  formCreateAuth = form(this.formCreateAuthModel, (schemaPath) => {
    (required(schemaPath.username, { message: 'El usuario es obligatorio' }),
      required(schemaPath.password, { message: 'La contraseña es obligatoria' }),
      email(schemaPath.email, { message: 'Ingrese un email valido' }),
      validate(schemaPath.confirmPassword, ({ value, valueOf }) => {
        const password = valueOf(schemaPath.password);
        const confirmPassword = value();
        if (password !== confirmPassword) {
          return {
            kind: 'passwordMismatch',
            message: 'La contraseña no coinciden',
          };
        }
        return null;
      }));
  });

  hidePassword = signal(true);
  hideConfirmPassword = signal(true);

  private router = inject(Router);

  private authService = inject(AuthService);

  isLoading = computed(() => this.authService.loading());

  private _snackBar = inject(MatSnackBar);

  isLoginSection = signal(true);

  private platformId = inject(PLATFORM_ID);

  private currentUserService = inject(CurrentUserService);

  toggleHidePassword(event: MouseEvent) {
    this.hidePassword.update((state) => !state);
    event.stopPropagation();
  }

  toggleHideConfirmPassword(event: MouseEvent) {
    this.hideConfirmPassword.update((state) => !state);
    event.stopPropagation();
  }

  login(event: SubmitEvent) {
    event.preventDefault();
    submit(this.formAuth, async () => {
      const username = this.formAuthModel().username;
      const password = this.formAuthModel().password;

      this.authService.login(username, password).subscribe((result) => {
        if (result.error) {
          const error = result.error;
          this.openSnackBar(error.message, 'Cerrar');
          return;
        }
        const data = result.data;
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('access_token', data.access_token);
        }

        this.currentUserService.user.set(data.user);
        this.router.navigate(['panel']);
        this.formAuth().reset();
        this.formAuthModel.set({
          username: '',
          password: '',
        });
      });
    });
  }

  create(event: SubmitEvent) {
    event.preventDefault();
    submit(this.formCreateAuth, async () => {
      // Ejecutar backend
      const username = this.formCreateAuthModel().username;
      const password = this.formCreateAuthModel().password;
      const email = this.formCreateAuthModel().email;

      this.authService
        .create(username, password, email.length === 0 ? undefined : email)
        .subscribe((result) => {
          if (result.error) {
            const error: ErrorResponse = result.error;
            this.openSnackBar(error.message, 'Cerrar');
            return;
          }

          this.openSnackBar('Usuario creado exitosamente', 'Cerrar');
          this.isLoginSection.set(true);
          this.formAuthModel.set({
            username,
            password,
          });

          this.formCreateAuth().reset();
          this.formCreateAuthModel.set({
            username: '',
            password: '',
            confirmPassword: '',
            email: '',
          });
        });
    });
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }
}
