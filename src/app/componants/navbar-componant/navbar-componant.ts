import { Component, HostListener } from '@angular/core';

import { CommonModule } from '@angular/common'
import { AuthService } from '../../auth/auth-service';
import { Router, RouterLink } from '@angular/router';


@Component({
  selector: 'app-navbar-componant',
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar-componant.html',
  styleUrl: './navbar-componant.css',
})
export class NavbarComponant {

  isUserMenuOpen = false;
  currentName: string | null = null;
  currentEmail: string | null = null;
  constructor(private authService: AuthService , private router: Router) {
    this.currentName = this.authService.getUserFullName() || null;
    this.currentEmail = this.authService.getUserEmail() || null;
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  onSettings(event: Event) {
    event.preventDefault();
    
    console.log('Navigate to settings');
    // Add your navigation logic here
    this.isUserMenuOpen = false;
  }

  onLogout(event: Event) {
    event.preventDefault();
    this.authService.logout();
    this.isUserMenuOpen = false;
    this.router.navigate(['/login']);
  }

  @HostListener('document:click', ['$event'])
onDocumentClick(event: MouseEvent) {
  const target = event.target as HTMLElement;
  const userMenu = document.querySelector('.user-menu-container');

  if (userMenu && !userMenu.contains(target)) {
    this.isUserMenuOpen = false;
  }
}

}

