import { Component, inject, PLATFORM_ID } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CurrentUserService } from '../../../../core/services/current-user-service';
import { isPlatformServer } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [MatButtonModule, MatIconModule, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrls: ['./header.css', './header.material.scss'],
})
export class Header {
  private currentUserService = inject(CurrentUserService);
  currentUser = this.currentUserService.user;
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);

  logOunt() {
    if (isPlatformServer(this.platformId)) {
      return;
    }
    this.currentUser.set(null);
    localStorage.clear();
    this.router.navigate(['']);
  }
}
