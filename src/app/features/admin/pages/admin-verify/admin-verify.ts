import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AdminService } from '../../services/admin-service';

@Component({
  selector: 'app-admin-verify',
  imports: [FormsModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './admin-verify.html',
  styleUrl: './admin-verify.css',
})
export default class AdminVerify {
  private adminService = inject(AdminService);
  private router = inject(Router);

  key = signal('');
  loading = signal(false);
  error = signal(false);
  showKey = signal(false);

  submit() {
    const k = this.key().trim();
    if (!k) return;
    this.loading.set(true);
    this.error.set(false);
    this.adminService.verifyKey(k).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.valid) {
          sessionStorage.setItem('admin_verified', 'true');
          sessionStorage.setItem('admin_key', k);
          this.router.navigate(['/admin/board']);
        } else {
          this.error.set(true);
        }
      },
      error: () => {
        this.loading.set(false);
        this.error.set(true);
      },
    });
  }
}
