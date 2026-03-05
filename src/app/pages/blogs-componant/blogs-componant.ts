import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { BlogService } from '../../services/blog.service';
import { Blog } from '../../models/blog.model';
import { AuthService } from '../../auth/auth-service';

@Component({
  selector: 'app-blogs-componant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './blogs-componant.html',
  styleUrls: ['./blogs-componant.css']
})
export class BlogsComponant implements OnInit {
  blogs: Blog[] = [];
  filteredBlogs: Blog[] = [];
  loading = false;
  searchTerm = '';

  constructor(private blogService: BlogService, private cdr: ChangeDetectorRef , private authService: AuthService) {}

  ngOnInit(): void {
    this.loadBlogs();
  }

  loadBlogs() {
    this.loading = true;
    this.blogService.getAll().subscribe({
      next: (res) => {
        this.blogs = res || [];
        this.filteredBlogs = [...this.blogs];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.blogs = [];
        this.filteredBlogs = [];
        this.loading = false;
        this.cdr.detectChanges();
        Swal.fire('Error', 'Failed to load blogs', 'error');
      }
    });
  }

  onSearch(event: any) {
    this.searchTerm = event.target.value.toLowerCase();
    this.applyFilters();
  }

  applyFilters() {
    this.filteredBlogs = this.blogs.filter(b => {
      return this.searchTerm === '' ||
        b.title?.toLowerCase().includes(this.searchTerm) ||
        b.content?.toLowerCase().includes(this.searchTerm);
    });
  }

  async showBlogForm(blog?: Blog) {
    const isEdit = !!blog;

    const { value: formValues, isConfirmed } = await Swal.fire({
      title: isEdit ? '✏️ Edit Blog' : '➕ Add New Blog',
      html: `
        <input id="swal-title" class="swal2-input" placeholder="Title" value="${blog?.title || ''}">
        <input id="swal-image" class="swal2-input" placeholder="Image URL" value="${blog?.imageUrl || ''}">
        <textarea id="swal-content" class="swal2-textarea" placeholder="Content">${blog?.content || ''}</textarea>
        <input id="swal-pubdate" type="datetime-local" class="swal2-input" value="${blog ? new Date(blog.published_date).toISOString().slice(0,16) : new Date().toISOString().slice(0,16)}">
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
      const payload: any = {
        title: get('swal-title'),
        imageUrl: get('swal-image'),
        content: get('swal-content'),
        published_date: new Date(get('swal-pubdate')).toISOString(),
        User_Id: this.authService.getUserId(),
        updatedBy: this.authService.getUserId()
      };

      try {
        this.loading = true;
        if (isEdit && blog) {
          await this.blogService.update(blog.id, payload).toPromise();
          Swal.fire('Updated!', 'Blog updated.', 'success');
        } else {
          await this.blogService.create(payload).toPromise();
          Swal.fire('Created!', 'Blog created.', 'success');
        }
        this.loadBlogs();
      } catch (err) {
        this.loading = false;
        this.cdr.detectChanges();
        Swal.fire('Error', 'Operation failed. Please try again.', 'error');
      }
    }
  }

  confirmDelete(id: number) {
    Swal.fire({
      title: 'Delete Blog? ',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        this.blogService.delete(id).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'Blog has been removed.', 'success');
            this.loadBlogs();
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
