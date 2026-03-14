import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'
import { AuthService } from '../../auth/auth-service';
import { Router, RouterLink } from '@angular/router';
@Component({
  selector: 'app-sidebar-componant',
  imports: [CommonModule, RouterLink],
  templateUrl: './sidebar-componant.html',
  styleUrl: './sidebar-componant.css',
})
export class SidebarComponant {

  currentName: string | null;
  currentRole: string | null = null;
  currentJobTitle: string | null = null;
  constructor(private router: Router , private authService:AuthService) {

    this.currentName = this.authService.getUserFullName() || null;

    this.currentRole = this.authService.getUserDepartment() || null;

    this.currentJobTitle = this.authService.getUserJobTitle() || null;

  }
  collapsed = false;
  activeLink = 'dashboard'; // default active
  openSectors = {
    finance: false,
    hr: false,
    contentCreators: false
  };

  toggleSidebar() {
    this.collapsed = !this.collapsed;
  }

  toggleSector(sector: 'finance' | 'hr' | 'contentCreators') {
    this.openSectors[sector] = !this.openSectors[sector];
  }

  setActiveLink( linkId: string) {
    this.activeLink = linkId;
  }
}

