import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Sector } from '../models/sector.model';

@Injectable({ providedIn: 'root' })
export class SectorService {
  private base = environment.baseUrl + '/Sector';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Sector[]> {
    return this.http.get<Sector[]>(this.base);
  }

  getById(id: number): Observable<Sector> {
    return this.http.get<Sector>(`${this.base}/${id}`);
  }

  create(sector: FormData | any): Observable<any> {
    if (sector instanceof FormData) {
      return this.http.post<any>(this.base, sector);
    }
    return this.http.post<Sector>(this.base, sector);
  }

  update(id: number, sector: FormData | any): Observable<any> {
    if (sector instanceof FormData) {
      return this.http.put<any>(`${this.base}/${id}`, sector);
    }
    return this.http.put<Sector>(`${this.base}/${id}`, sector);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.base}/${id}`);
  }
}
