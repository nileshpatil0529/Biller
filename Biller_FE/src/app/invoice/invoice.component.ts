import { Component } from '@angular/core';
import { InvoiceService, InvoiceData } from './invoice.service';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.css']
})
export class InvoiceComponent {
  invoices: InvoiceData[] = [];
  displayedColumns: string[] = [
    'client',
    'location',
    'discount',
    'total',
    'grandTotal',
    'paymentStatus'
  ];

  constructor(private invoiceService: InvoiceService) {
    this.invoices = this.invoiceService.getInvoices();
    console.log(this.invoices);
    
  }
}
