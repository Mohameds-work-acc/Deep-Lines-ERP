import { Component } from '@angular/core';

import { CommonModule } from '@angular/common'
import { AuthService } from '../../auth/auth-service';

@Component({
  selector: 'app-dashboard-componant',
  imports: [CommonModule],
  templateUrl: './dashboard-componant.html',
  styleUrl: './dashboard-componant.css',
  providers:[AuthService]
})
export class DashboardComponant {

  currentFullName: string | null;

  constructor(private authService:AuthService) {

    this.currentFullName = this.authService.getUserFullName() || null;

  }



  currentDate = new Date();


}
