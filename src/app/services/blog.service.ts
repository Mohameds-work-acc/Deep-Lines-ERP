import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Blog } from '../models/blog.model';

@Injectable({ providedIn: 'root' })
export class BlogService {
  private base = environment.baseUrl + '/Blog';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Blog[]> {
    return this.http.get<Blog[]>(this.base);
  }

  getById(id: number): Observable<Blog> {
    return this.http.get<Blog>(`${this.base}/${id}`);
  }

  create(blog: any): Observable<Blog> {
    return this.http.post<Blog>(this.base, blog);
  }

  update(id: number, blog: any): Observable<Blog> {
    return this.http.put<Blog>(`${this.base}/${id}`, blog);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.base}/${id}`);
  }
}
