import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';
import { Employee } from '../../models/employee.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-employees-componant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employees-componant.html',
  styleUrls: ['./employees-componant.css']
})
export class EmployeesComponant implements OnInit {
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  loading = false;
  searchTerm = '';
  selectedDepartment = '';
  selectedStatus = '';

  departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations', 'IT'];
  statuses = ['active', 'inactive', 'on leave'];

  constructor(private employeeService: EmployeeService) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees() {
    this.loading = true;
    this.employeeService.getAll().subscribe({
      next: (res) => {
        this.employees = res || [];
        this.filteredEmployees = [...this.employees];
        this.loading = false;
      },
      error: () => {
        this.employees = [];
        this.filteredEmployees = [];
        this.loading = false;
        Swal.fire('Error', 'Failed to load employees', 'error');
      }
    });
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  onSearch(event: any) {
    this.searchTerm = event.target.value.toLowerCase();
    this.applyFilters();
  }

  filterByDepartment(event: any) {
    this.selectedDepartment = event.target.value;
    this.applyFilters();
  }

  filterByStatus(event: any) {
    this.selectedStatus = event.target.value;
    this.applyFilters();
  }
  getActiveEmployees(): number {
    return this.employees.filter(e => e.status === 'active').length;
  }

  getOnLeaveEmployees(): number {
    return this.employees.filter(e => e.status === 'on leave').length;
  }

  getActivePercentage(): string {
    if (this.employees.length === 0) return '0';
    return ((this.getActiveEmployees() / this.employees.length) * 100).toFixed(1);
  }

  getOnLeavePercentage(): string {
    if (this.employees.length === 0) return '0';
    return ((this.getOnLeaveEmployees() / this.employees.length) * 100).toFixed(1);
  }

  getUniqueDepartments(): number {
    return new Set(this.employees.map(e => e.department)).size;
  }

  applyFilters() {
    this.filteredEmployees = this.employees.filter(emp => {
      const matchesSearch = this.searchTerm === '' ||
        emp.name?.toLowerCase().includes(this.searchTerm) ||
        emp.email?.toLowerCase().includes(this.searchTerm) ||
        emp.jopTitle?.toLowerCase().includes(this.searchTerm) ||
        emp.department?.toLowerCase().includes(this.searchTerm) ||
        emp.role?.toLowerCase().includes(this.searchTerm);

      const matchesDepartment = this.selectedDepartment === '' ||
        emp.department === this.selectedDepartment;

      const matchesStatus = this.selectedStatus === '' ||
        emp.status === this.selectedStatus;

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }

  async showEmployeeForm(employee?: Employee) {
    const isEdit = !!employee;

    const { value: formValues, isConfirmed } = await Swal.fire({
      title: isEdit ? '✏️ Edit Employee' : '➕ Add New Employee',
      html: `
        <div class="swal-form-container" style="max-height: 70vh; overflow-y: auto; padding: 10px;">
          <input id="swal-Name" class="swal2-input" placeholder="Full Name *" value="${employee?.name || ''}" style="margin-bottom: 8px;">
          <input id="swal-Email" class="swal2-input" placeholder="Email *" type="email" value="${employee?.email || ''}" style="margin-bottom: 8px;">
          <input id="swal-Phone" class="swal2-input" placeholder="Phone *" value="${employee?.phone || ''}" style="margin-bottom: 8px;">
          <input id="swal-Address" class="swal2-input" placeholder="Address" value="${employee?.address || ''}" style="margin-bottom: 8px;">
          <input id="swal-Password" class="swal2-input" placeholder="Password" type="password" value="${employee?.password || ''}" style="margin-bottom: 8px;">

          <select id="swal-department" class="swal2-input" style="margin-bottom: 8px;">
            <option value="">Select Department *</option>
            ${this.departments.map(d => `<option value="${d}" ${employee?.department === d ? 'selected' : ''}>${d}</option>`).join('')}
          </select>

          <input id="swal-jopTitle" class="swal2-input" placeholder="Job Title *" value="${employee?.jopTitle || ''}" style="margin-bottom: 8px;">
          <input id="swal-Role" class="swal2-input" placeholder="Role *" value="${employee?.role || ''}" style="margin-bottom: 8px;">

          <select id="swal-status" class="swal2-input" style="margin-bottom: 8px;">
            <option value="">Select Status</option>
            <option value="active" ${employee?.status === 'active' ? 'selected' : ''}>Active</option>
            <option value="inactive" ${employee?.status === 'inactive' ? 'selected' : ''}>Inactive</option>
            <option value="on leave" ${employee?.status === 'on leave' ? 'selected' : ''}>On Leave</option>
          </select>

          <select id="swal-employmentType" class="swal2-input" style="margin-bottom: 8px;">
            <option value="">Employment Type</option>
            <option value="full-time" ${employee?.employmentType === 'full-time' ? 'selected' : ''}>Full Time</option>
            <option value="part-time" ${employee?.employmentType === 'part-time' ? 'selected' : ''}>Part Time</option>
            <option value="contract" ${employee?.employmentType === 'contract' ? 'selected' : ''}>Contract</option>
          </select>

          <input id="swal-joinedDate" type="date" class="swal2-input" value="${employee ? new Date(employee.joinedDate).toISOString().slice(0,10) : new Date().toISOString().slice(0,10)}" style="margin-bottom: 8px;">
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: isEdit ? 'Update' : 'Create',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#6b7280',
      background: 'rgba(255, 255, 255, 0.95)',
      backdrop: 'rgba(0, 0, 0, 0.2)',
      customClass: {
        container: 'glass-swal-container',
        popup: 'glass-swal-popup'
      },
      preConfirm: () => {
        const get = (id: string) => (document.getElementById(id) as HTMLInputElement)?.value;
        const dept = (document.getElementById('swal-department') as HTMLSelectElement)?.value;
        const status = (document.getElementById('swal-status') as HTMLSelectElement)?.value;
        const empType = (document.getElementById('swal-employmentType') as HTMLSelectElement)?.value;

        // Validation
        if (!get('swal-Name')) {
          Swal.showValidationMessage('Name is required');
          return false;
        }
        if (!get('swal-Email')) {
          Swal.showValidationMessage('Email is required');
          return false;
        }
        if (!get('swal-Phone')) {
          Swal.showValidationMessage('Phone is required');
          return false;
        }
        if (!dept) {
          Swal.showValidationMessage('Department is required');
          return false;
        }

        return {
          Name: get('swal-Name'),
          Email: get('swal-Email'),
          Phone: get('swal-Phone'),
          Address: get('swal-Address'),
          Password: get('swal-Password'),
          status: status || 'active',
          Role: get('swal-Role') || 'Employee',
          department: dept,
          jopTitle: get('swal-jopTitle') || 'Staff',
          employmentType: empType || 'full-time',
          joinedDate: get('swal-joinedDate') || new Date().toISOString().slice(0,10)
        };
      }
    });

    if (isConfirmed && formValues) {
      try {
        this.loading = true;
        if (isEdit && employee) {
          await this.employeeService.update(employee.id, formValues).toPromise();
          Swal.fire({
            icon: 'success',
            title: 'Updated!',
            text: 'Employee has been updated.',
            timer: 1500,
            showConfirmButton: false,
            background: 'rgba(255, 255, 255, 0.95)',
            customClass: { popup: 'glass-swal-popup' }
          });
        } else {
          await this.employeeService.create(formValues).toPromise();
          Swal.fire({
            icon: 'success',
            title: 'Created!',
            text: 'New employee has been added.',
            timer: 1500,
            showConfirmButton: false,
            background: 'rgba(255, 255, 255, 0.95)',
            customClass: { popup: 'glass-swal-popup' }
          });
        }
        this.loadEmployees();
      } catch (err) {
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Operation failed. Please try again.',
          background: 'rgba(255, 255, 255, 0.95)',
          customClass: { popup: 'glass-swal-popup' }
        });
      }
    }
  }

  confirmDelete(id: number) {
    Swal.fire({
      title: 'Delete Employee?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      background: 'rgba(255, 255, 255, 0.95)',
      customClass: { popup: 'glass-swal-popup' }
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        this.employeeService.delete(id).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Employee has been removed.',
              timer: 1500,
              showConfirmButton: false,
              background: 'rgba(255, 255, 255, 0.95)',
              customClass: { popup: 'glass-swal-popup' }
            });
            this.loadEmployees();
          },
          error: () => {
            this.loading = false;
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Delete failed. Please try again.',
              background: 'rgba(255, 255, 255, 0.95)',
              customClass: { popup: 'glass-swal-popup' }
            });
          }
        });
      }
    });
  }
}
