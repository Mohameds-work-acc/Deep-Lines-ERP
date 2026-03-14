// change-password.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { AuthService } from '../../auth/auth-service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
interface FailResponse {
  code: number;
  message: string;
}

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password-componant.html',
  styleUrls: ['./change-password-componant.css'],
  imports: [CommonModule, ReactiveFormsModule ]
})
export class ChangePasswordComponent {
  passwordForm: FormGroup;
  loading = false;
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  // Custom validator to check if passwords match
  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  // Toggle password visibility
  togglePasswordVisibility(field: string): void {
    switch(field) {
      case 'current':
        this.showCurrentPassword = !this.showCurrentPassword;
        break;
      case 'new':
        this.showNewPassword = !this.showNewPassword;
        break;
      case 'confirm':
        this.showConfirmPassword = !this.showConfirmPassword;
        break;
    }
  }

  // Get password strength indicator
  getPasswordStrength(): { strength: string; color: string; width: string } {
    const password = this.passwordForm.get('newPassword')?.value || '';
    
    if (!password) {
      return { strength: '', color: 'bg-gray-200', width: '0%' };
    }

    let strength = 0;
    
    // Check length
    if (password.length >= 8) strength += 25;
    // Check for lowercase
    if (/[a-z]/.test(password)) strength += 25;
    // Check for uppercase
    if (/[A-Z]/.test(password)) strength += 25;
    // Check for numbers and special characters
    if (/\d/.test(password) && /[@$!%*?&]/.test(password)) strength += 25;

    if (strength <= 25) {
      return { strength: 'Weak', color: 'bg-red-500', width: '25%' };
    } else if (strength <= 50) {
      return { strength: 'Fair', color: 'bg-orange-500', width: '50%' };
    } else if (strength <= 75) {
      return { strength: 'Good', color: 'bg-yellow-500', width: '75%' };
    } else {
      return { strength: 'Strong', color: 'bg-green-500', width: '100%' };
    }
  }

  onSubmit(): void {
    if (this.passwordForm.invalid) {
      // Show validation errors
      Object.keys(this.passwordForm.controls).forEach(key => {
        const control = this.passwordForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      
      Swal.fire({
        title: 'Validation Error',
        text: 'Please check all fields and try again.',
        icon: 'error',
        confirmButtonColor: '#6366f1',
        timer: 3000,
        timerProgressBar: true
      });
      return;
    }

    this.loading = true;

    // Prepare the request body
    const changePasswordRequest = {
      userId: Number(this.authService.getUserId()),
      oldPassword: this.passwordForm.get('currentPassword')?.value,
      newPassword: this.passwordForm.get('newPassword')?.value,
    };

    // Make API call
    this.authService.changePassword(changePasswordRequest).subscribe({
        next: (response: any) => {
          this.loading = false;
          
          // Success message
          Swal.fire({
            title: 'Success!',
            text: 'Your password has been changed successfully.',
            icon: 'success',
            confirmButtonColor: '#6366f1',
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: true
          }).then(() => {
            // Reset form after success
            this.authService.logout();
            this.router.navigate(['/login']);
          });
        },
        error: (error: any) => {
          this.loading = false;
          
          // Handle the failResponse DTO
          const failResponse: FailResponse = error.error;
          
          if (failResponse) {
            // Show specific error message from backend
            Swal.fire({
              title: `Error ${failResponse.code}`,
              text: failResponse.message,
              icon: 'error',
              confirmButtonColor: '#6366f1',
              confirmButtonText: 'Try Again',
              showCancelButton: true,
              cancelButtonText: 'Cancel',
              timer: 5000,
              timerProgressBar: true
            }).then((result) => {
              if (result.isConfirmed) {
                // Focus on current password field for retry
                this.passwordForm.get('currentPassword')?.reset();
                this.passwordForm.get('currentPassword')?.markAsTouched();
              }
            });
          } else {
            // Generic error message
            Swal.fire({
              title: 'Error',
              text: 'An unexpected error occurred. Please try again.',
              icon: 'error',
              confirmButtonColor: '#6366f1'
            });
          }

          // Log error for debugging
          console.error('Password change failed:', error);
        }
      });
  }

  // Helper method to check if field is invalid and touched
  isFieldInvalid(fieldName: string): boolean {
    const field = this.passwordForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  // Get validation error message
  getErrorMessage(fieldName: string): string {
    const field = this.passwordForm.get(fieldName);
    
    if (field?.errors) {
      if (field.errors['required']) {
        return 'This field is required';
      }
      if (field.errors['minlength']) {
        return 'Password must be at least 8 characters';
      }
      if (field.errors['pattern']) {
        return 'Password must contain uppercase, lowercase, number and special character';
      }
    }
    
    if (fieldName === 'confirmPassword' && this.passwordForm.errors?.['mismatch']) {
      return 'Passwords do not match';
    }
    
    return '';
  }
}