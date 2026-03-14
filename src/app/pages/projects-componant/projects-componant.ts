import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project.model';
import { SectorService } from '../../services/sector.service';
import { Sector } from '../../models/sector.model';
import { AuthService } from '../../auth/auth-service';

@Component({
  selector: 'app-projects-componant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './projects-componant.html',
  styleUrls: ['./projects-componant.css']
})
export class ProjectsComponant implements OnInit {
  projects: Project[] = [];
  filtered: Project[] = [];
  sectors: Sector[] = [];
  loading = false;
  searchTerm = '';

  constructor(private svc: ProjectService, private sectorSvc: SectorService, private cdr: ChangeDetectorRef, private authService: AuthService) {}

  ngOnInit(): void {
    this.load();
    this.loadSectors();
  }

  loadSectors() {
    this.sectorSvc.getAll().subscribe({ next: (s) => { this.sectors = s || []; this.cdr.detectChanges(); } });
  }

  load() {
    this.loading = true;
    this.svc.getAll().subscribe({
      next: (res) => { this.projects = res || []; this.filtered = [...this.projects]; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.projects = []; this.filtered = []; this.loading = false; this.cdr.detectChanges(); Swal.fire('Error', 'Failed to load projects', 'error'); }
    });
  }

  onSearch(e: any) { this.searchTerm = e.target.value.toLowerCase(); this.applyFilters(); }

  applyFilters() {
    this.filtered = this.projects.filter(p => {
      return this.searchTerm === '' ||
        p.title?.toLowerCase().includes(this.searchTerm) ||
        (p.description || '').toLowerCase().includes(this.searchTerm);
    });
  }

  async showForm(item?: Project) {
    const isEdit = !!item;
    const { value: formValues, isConfirmed } = await Swal.fire({
      title: isEdit ? '✏️ Edit Project' : '➕ Add New Project',
      html: `
        <input id="swal-title" class="swal2-input" placeholder="Title" value="${item?.title || ''}">
        <input id="swal-image-file" type="file" class="swal2-input" style="padding:6px;">
        <select id="swal-sector" class="swal2-input">
          ${this.sectors.map(s=>`<option value="${s.id}" ${item?.sectorId===s.id? 'selected':''}>${s.title}</option>`).join('')}
        </select>
        <textarea id="swal-desc" class="swal2-textarea" placeholder="Description">${item?.description || ''}</textarea>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: isEdit ? 'Update' : 'Create',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#6b7280'
    });

    if (isConfirmed && formValues !== undefined) {
      const get = (id: string) => (document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement)?.value;
      const fileInput = (document.getElementById('swal-image-file') as HTMLInputElement);
      const file = fileInput?.files && fileInput.files.length ? fileInput.files[0] : null;

      const formData = new FormData();
      formData.append('title', get('swal-title'));
      formData.append('description', get('swal-desc'));
      formData.append('Sector_Id', get('swal-sector'));
      formData.append('User_Id', String(this.authService.getUserId()));
      if (file) { formData.append('image', file, file.name); }

      try {
        this.loading = true;
        if (isEdit && item) {
          const res: any = await this.svc.update(item.id, formData).toPromise();
          this.loading = false; Swal.fire('Updated!', res?.message || 'Project updated.', 'success');
        } else {
          const res: any = await this.svc.create(formData).toPromise();
          this.loading = false; Swal.fire('Created!', res?.message || 'Project created.', 'success');
        }
        this.load();
      } catch (err: any) {
        this.loading = false; this.cdr.detectChanges(); const apiMessage = err?.error?.message || (err instanceof Error ? err.message : 'Operation failed.'); Swal.fire('Error', apiMessage, 'error');
      }
    }
  }

  confirmDelete(id: number) {
    Swal.fire({ title: 'Delete Project? ', text: 'This action cannot be undone!', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#6b7280', confirmButtonText: 'Yes, delete it!' }).then((result)=>{
      if (result.isConfirmed) { this.loading = true; this.svc.delete(id).subscribe({ next: ()=>{ Swal.fire('Deleted!','Project removed.','success'); this.load(); }, error: ()=>{ this.loading=false; this.cdr.detectChanges(); Swal.fire('Error','Delete failed.','error'); } }); }
    });
  }
    // Add these methods to your component class

    getProjectsWithImages(): number {
    return this.filtered.filter(p => p.imageUrl).length;
    }

    getUniqueSectors(): number {
    const sectors = new Set();
    this.filtered.forEach(p => {
        if (p.sector?.title) {
        sectors.add(p.sector.title);
        } else if (p.sectorId) {
        sectors.add(`Sector ${p.sectorId}`);
        }
    });
    return sectors.size;
    }

    getProjectsWithSector(): number {
    return this.filtered.filter(p => p.sector || p.sectorId).length;
    }

    getUniqueAuthors(): number {
    const authors = new Set();
    this.filtered.forEach(p => {
        if (p.author?.Id) authors.add(p.author.Id);
        if (p.updatedBy?.Id) authors.add(p.updatedBy.Id);
    });
    return authors.size;
    }

    clearSearch(): void {
    this.searchTerm = '';
    // Trigger your search reset logic
    }

    trackById(index: number, item: Project): number {
    return item.id;
    }
}
