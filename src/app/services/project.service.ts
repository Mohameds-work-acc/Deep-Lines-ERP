import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Project } from '../models/project.model';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private base = environment.baseUrl + '/Projects';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Project[]> {
    return this.http.get<Project[]>(this.base);
  }

  getById(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.base}/${id}`);
  }

  create(project: FormData | any): Observable<any> {
    if (project instanceof FormData) {
      return this.http.post<any>(this.base, project);
    }
    return this.http.post<Project>(this.base, project);
  }

  update(id: number, project: FormData | any): Observable<any> {
    if (project instanceof FormData) {
      return this.http.put<any>(`${this.base}/${id}`, project);
    }
    return this.http.put<Project>(`${this.base}/${id}`, project);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.base}/${id}`);
  }
}
