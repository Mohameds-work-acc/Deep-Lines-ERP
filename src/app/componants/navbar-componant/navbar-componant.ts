import { Component, HostListener } from '@angular/core';

import { CommonModule } from '@angular/common'
import { AuthService } from '../../auth/auth-service';


@Component({
  selector: 'app-navbar-componant',
  imports: [CommonModule],
  templateUrl: './navbar-componant.html',
  styleUrl: './navbar-componant.css',
})
export class NavbarComponant {

  isUserMenuOpen = false;
  currentName: string | null = null;
  currentEmail: string | null = null;
  constructor(private authService: AuthService) {
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
    console.log('Logout user');
    // Add your logout logic here
    this.isUserMenuOpen = false;
  }

  onProfile(event: Event) {
    event.preventDefault();
    console.log('Navigate to profile');
    // Add your navigation logic here
    this.isUserMenuOpen = false;
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

