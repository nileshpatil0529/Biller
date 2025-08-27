import { Injectable } from '@angular/core';

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
  invoices: InvoiceData[] = [];

  addInvoice(data: InvoiceData) {
    this.invoices.push(data);
  }

  getInvoices(): InvoiceData[] {
    return this.invoices;
  }
}
