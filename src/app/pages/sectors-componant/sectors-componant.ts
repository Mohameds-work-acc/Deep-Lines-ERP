import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { SectorService } from '../../services/sector.service';
import { Sector } from '../../models/sector.model';
import { AuthService } from '../../auth/auth-service';

@Component({
  selector: 'app-sectors-componant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sectors-componant.html',
  styleUrls: ['./sectors-componant.css']
})
export class SectorsComponant implements OnInit {
  sectors: Sector[] = [];
  filtered: Sector[] = [];
  loading = false;
  searchTerm = '';

  // Template-friendly alias used in the HTML
  get searchQuery(): string {
    return this.searchTerm;
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  trackById(_index: number, item: Sector) {
    return item.id;
  }

  constructor(private svc: SectorService, private cdr: ChangeDetectorRef, private authService: AuthService) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading = true;
    this.svc.getAll().subscribe({
      next: (res) => {
        this.sectors = res || [];
        this.filtered = [...this.sectors];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.sectors = [];
        this.filtered = [];
        this.loading = false;
        this.cdr.detectChanges();
        Swal.fire('Error', 'Failed to load sectors', 'error');
      }
    });
  }

  onSearch(e: any) {
    this.searchTerm = e.target.value.toLowerCase();
    this.applyFilters();
  }

  applyFilters() {
    this.filtered = this.sectors.filter(s => {
      return this.searchTerm === '' ||
        s.title?.toLowerCase().includes(this.searchTerm) ||
        (s.description || '').toLowerCase().includes(this.searchTerm);
    });
  }

  async showForm(item?: Sector) {
    const isEdit = !!item;
    const { value: formValues, isConfirmed } = await Swal.fire({
      title: isEdit ? '✏️ Edit Sector' : '➕ Add New Sector',
      html: `
        <input id="swal-title" class="swal2-input" placeholder="Title" value="${item?.title || ''}">
        <input id="swal-image-file" type="file" class="swal2-input" style="padding:6px;">
        <textarea id="swal-desc" class="swal2-textarea" placeholder="Description">${item?.description || ''}</textarea>
        <input id="swal-vision" class="swal2-input" placeholder="Vision" value="${(item as any)?.vision || ''}">
        <input id="swal-mission" class="swal2-input" placeholder="Mission" value="${(item as any)?.mission || ''}">
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: isEdit ? 'Update' : 'Create',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#6b7280'
    });

    if (isConfirmed && formValues !== undefined) {
      const get = (id: string) => (document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement)?.value;
      const fileInput = (document.getElementById('swal-image-file') as HTMLInputElement);
      const file = fileInput?.files && fileInput.files.length ? fileInput.files[0] : null;

      const formData = new FormData();
      formData.append('title', get('swal-title'));
      formData.append('description', get('swal-desc'));
      formData.append('vision', get('swal-vision'));
      formData.append('mission', get('swal-mission'));
      formData.append('User_Id', String(this.authService.getUserId()));
      if (file) {
        formData.append('image', file, file.name);
      }

      try {
        this.loading = true;
        if (isEdit && item) {
          const res: any = await this.svc.update(item.id, formData).toPromise();
          this.loading = false;
          Swal.fire('Updated!', res?.message || 'Sector updated.', 'success');
        } else {
          const res: any = await this.svc.create(formData).toPromise();
          this.loading = false;
          Swal.fire('Created!', res?.message || 'Sector created.', 'success');
        }
        this.load();
      } catch (err: any) {
        this.loading = false;
        this.cdr.detectChanges();
        const apiMessage = err?.error?.message || (err instanceof Error ? err.message : 'Operation failed.');
        Swal.fire('Error', apiMessage, 'error');
      }
    }
  }
  // Add these methods to your component class

    getSectorsWithImages(): number {
    return this.filtered.filter(s => s.imageUrl).length;
    }

    getSectorsWithProducts(): number {
    return this.filtered.filter(s => s.relatedProductsCount && s.relatedProductsCount > 0).length;
    }

    getTotalProductsCount(): number {
    return this.filtered.reduce((total, s) => total + (s.relatedProductsCount || 0), 0);
    }

    viewRelatedProducts(sectorId: number): void {
    // Navigate to products view filtered by this sector
    // You can emit an event, navigate to a route, or trigger a method
    console.log('View products for sector:', sectorId);
    // Example: this.router.navigate(['/products'], { queryParams: { sectorId } });
    }
  confirmDelete(id: number) {
    Swal.fire({
      title: 'Delete Sector? ',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        this.svc.delete(id).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'Sector has been removed.', 'success');
            this.load();
          },
          error: () => {
            this.loading = false;
            this.cdr.detectChanges();
            Swal.fire('Error', 'Delete failed. Please try again.', 'error');
          }
        });
      }
    });
  }
}
