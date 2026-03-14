import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private base = environment.baseUrl + '/Product';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Product[]> {
    return this.http.get<Product[]>(this.base);
  }

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.base}/${id}`);
  }

  create(product: FormData | any): Observable<any> {
    if (product instanceof FormData) {
      return this.http.post<any>(this.base, product);
    }
    return this.http.post<Product>(this.base, product);
  }

  update(id: number, product: FormData | any): Observable<any> {
    if (product instanceof FormData) {
      return this.http.put<any>(`${this.base}/${id}`, product);
    }
    return this.http.put<Product>(`${this.base}/${id}`, product);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.base}/${id}`);
  }
}
