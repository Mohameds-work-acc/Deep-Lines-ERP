import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from "@angular/router";
import { ILoginDto } from '../../models/Request/AuthDTOs/login-request.dto';
import { SharedService } from '../../shared/shared-service';
import { AuthService } from '../../auth/auth-service';
@Component({
  selector: 'app-login-componant',
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './login-componant.html',
  styleUrl: './login-componant.css',
})
export class LoginComponant {
   loading: boolean = false;

  constructor(private authService: AuthService , private sharedService:SharedService , private router:Router) {

  }


  model = new ILoginDto();

  forgetPassword(){
    this.sharedService.showToast('Contact Your Administrator to reset your password', 'info');
  }
  onSubmit(form:NgForm) {
    this.loading = true;
    if (form.valid) {
      this.authService.Login(this.model).subscribe(
        {
          next: (res) => {
            this.loading = false;
            this.sharedService.showToast(res.message, 'success');
            this.router.navigate(['/dashboard']);
          }
          ,
          error: (err) => {
            this.loading = false;
            this.sharedService.showToast('Login Failed: ' + err.error, 'error');
          }
        }
      );
    }
  }
}
