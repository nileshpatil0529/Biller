import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface InvoiceProduct {
  code: string;
  name: string;
  nameHindi: string;
  unit: string;
  price: number;
  sell_qty: number;
  totalValue?: number;
}

export interface InvoiceData {
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
  private apiUrl = 'http://localhost:3000/api/invoices'; // Update with your backend URL

  constructor(private http: HttpClient) {}

  addInvoice(data: InvoiceData): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  getInvoices(): Observable<InvoiceData[]> {
    return this.http.get<InvoiceData[]>(this.apiUrl);
  }
}
