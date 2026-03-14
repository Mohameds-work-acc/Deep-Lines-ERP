import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { SectorService } from '../../services/sector.service';
import { Sector } from '../../models/sector.model';
import { AuthService } from '../../auth/auth-service';

@Component({
  selector: 'app-products-componant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products-componant.html',
  styleUrls: ['./products-componant.css']
})
export class ProductsComponant implements OnInit {
  products: Product[] = [];
  filtered: Product[] = [];
  sectors: Sector[] = [];
  loading = false;
  searchTerm = '';

  constructor(private svc: ProductService, private sectorSvc: SectorService, private cdr: ChangeDetectorRef, private authService: AuthService) {}

  ngOnInit(): void {
    this.load();
    this.loadSectors();
  }

  loadSectors() { this.sectorSvc.getAll().subscribe({ next: s => { this.sectors = s || []; this.cdr.detectChanges(); } }); }

  load() {
    this.loading = true;
    this.svc.getAll().subscribe({ next: (res) => { this.products = res || []; this.filtered = [...this.products]; this.loading = false; this.cdr.detectChanges(); }, error: () => { this.products = []; this.filtered = []; this.loading = false; this.cdr.detectChanges(); Swal.fire('Error','Failed to load products','error'); } });
  }

  onSearch(e: any) { this.searchTerm = e.target.value.toLowerCase(); this.applyFilters(); }
  applyFilters(){ this.filtered = this.products.filter(p => { return this.searchTerm === '' || p.title?.toLowerCase().includes(this.searchTerm) || (p.description||'').toLowerCase().includes(this.searchTerm); }); }

  async showForm(item?: Product) {
    const isEdit = !!item;
    const { value: formValues, isConfirmed } = await Swal.fire({
      title: isEdit ? '✏️ Edit Product' : '➕ Add New Product',
      html: `
        <input id="swal-name" class="swal2-input" placeholder="Name" value="${item?.title || ''}">
        <input id="swal-price" type="number" class="swal2-input" placeholder="Price" value="${item?.price ?? ''}">
        <input id="swal-image-file" type="file" class="swal2-input" style="padding:6px;">
        <select id="swal-sector" class="swal2-input">
          ${this.sectors.map(s=>`<option value="${s.id}" ${ (item && (((item as any).projectId===s.id) || ((item as any).Sector_Id===s.id) || ((item as any).category && (item as any).category.id===s.id))) ? 'selected':''}>${s.title}</option>`).join('')}
        </select>
        <input id="swal-pubdate" type="datetime-local" class="swal2-input" value="${item?.published_data ? new Date(item.published_data).toISOString().slice(0,16) : new Date().toISOString().slice(0,16)}">
        <textarea id="swal-desc" class="swal2-textarea" placeholder="Description">${item?.description || ''}</textarea>
      `,
      focusConfirm:false, showCancelButton:true, confirmButtonText:isEdit? 'Update':'Create', cancelButtonText:'Cancel', confirmButtonColor:'#4f46e5', cancelButtonColor:'#6b7280'
    });

    if (isConfirmed && formValues !== undefined) {
      const get = (id:string) => (document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement)?.value;
      const fileInput = (document.getElementById('swal-image-file') as HTMLInputElement);
      const file = fileInput?.files && fileInput.files.length ? fileInput.files[0] : null;

      const formData = new FormData();
      formData.append('title', get('swal-name'));
      formData.append('description', get('swal-desc'));
      formData.append('price', get('swal-price'));
      formData.append('Sector_Id', get('swal-sector'));
      formData.append('published_data', new Date(get('swal-pubdate')).toISOString());
      formData.append('addedBy', String(this.authService.getUserId()));
      if(isEdit){
        formData.append('updatedBy', String(item?.id));
      }
      if (file) { formData.append('image', file, file.name); }

      try {
        this.loading = true;
        if (isEdit && item) { const res:any = await this.svc.update(item.id, formData).toPromise(); this.loading=false; Swal.fire('Updated!', res?.message||'Product updated.','success'); }
        else { const res:any = await this.svc.create(formData).toPromise(); this.loading=false; Swal.fire('Created!', res?.message||'Product created.','success'); }
        this.load();
      } catch (err:any) { this.loading=false; this.cdr.detectChanges(); const apiMessage = err?.error?.message || (err instanceof Error? err.message:'Operation failed.'); Swal.fire('Error', apiMessage, 'error'); }
    }
  }
  // Add these methods to your component class

    getProductsWithImages(): number {
    return this.filtered.filter(p => p.imageUrl).length;
    }

    getUniqueCategories(): number {
    const categories = new Set();
    this.filtered.forEach(p => {
        if (p.sector?.title) {
        categories.add(p.sector.title);
        }
    });
    return categories.size;
    }

    getProductsWithPrice(): number {
    return this.filtered.filter(p => p.price && p.price > 0).length;
    }

    getAveragePrice(): number {
    const productsWithPrice = this.filtered.filter(p => p.price && p.price > 0);
    if (productsWithPrice.length === 0) return 0;
    
    const sum = productsWithPrice.reduce((acc, p) => acc + (p.price || 0), 0);
    return sum / productsWithPrice.length;
    }

    clearSearch(): void {
    this.searchTerm = '';
    // Trigger your search reset logic
    }

    trackById(index: number, item: Product): number {
    return item.id;
    }
    confirmDelete(id:number){ Swal.fire({ title:'Delete Product?', text:'This action cannot be undone!', icon:'warning', showCancelButton:true, confirmButtonColor:'#ef4444', cancelButtonColor:'#6b7280', confirmButtonText:'Yes, delete it!' }).then((result)=>{ if(result.isConfirmed){ this.loading=true; this.svc.delete(id).subscribe({ next: ()=>{ Swal.fire('Deleted!','Product removed.','success'); this.load(); }, error: ()=>{ this.loading=false; this.cdr.detectChanges(); Swal.fire('Error','Delete failed.','error'); } }); } }); }
}
