import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export interface Product {
  id?: number;
  code: string;
  name: string;
  nameHindi: string;
  unit: string;
  price: number;
  stockQty: number;
  sell_qty?: number;
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
  uploadProductFile(formData: FormData): Observable<any> {
    return this.http.post<any>(this.apiUrl + '/upload', formData, {
      headers: this.getAuthHeaders()
    });
  }
  private apiUrl = 'http://localhost:3000/api/products';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  addProduct(product: Product | Product[]): Observable<any> {
    // Accepts single product or array
    const payload = Array.isArray(product) ? product : [product];
    return this.http.post(this.apiUrl, payload, { headers: this.getAuthHeaders() });
  }

  updateProduct(id: number, product: Product): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, product, { headers: this.getAuthHeaders() });
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }
}
