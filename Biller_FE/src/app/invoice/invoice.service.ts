import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface InvoiceProduct {
  code: string;
  name: string;
  unit: string;
  price: number;
  sell_qty: number;
  totalValue?: number;
}

export interface InvoiceData {
  id?: number;
  client: string;
  location: string;
  discount: number;
  total: number;
  grandTotal: number;
  paymentStatus: string;
  invoiceNumber?: string;
  paymentMode?: string;
  products: InvoiceProduct[];
}

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  deleteInvoice(invoiceId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${invoiceId}`);
  }
  private apiUrl = 'http://localhost:3000/api/invoices'; // Update with your backend URL

  updateInvoiceByNumber(invoiceNumber: string, data: InvoiceData): Observable<any> {
    console.log(`${this.apiUrl}/${invoiceNumber}`);
    
    return this.http.put(`${this.apiUrl}/${invoiceNumber}`, data);
  }

  getInvoiceProducts(invoiceId: number): Observable<InvoiceProduct[]> {
    return this.http.get<InvoiceProduct[]>(`${this.apiUrl}/${invoiceId}/invoice_products`);
  }

  constructor(private http: HttpClient) {}

  addInvoice(data: InvoiceData): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  getInvoices(): Observable<InvoiceData[]> {
    return this.http.get<InvoiceData[]>(this.apiUrl);
  }
}
