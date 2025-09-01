import { Component } from '@angular/core';
import { InvoiceService, InvoiceData } from './invoice.service';
import { LoaderService } from '../shared/services/loader.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../shared/confirm-dialog.component';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.css']
})
export class InvoiceComponent {
  onMarkPaid(id: number) {
    console.log('Mark Paid clicked for invoice id:', id);
  }
  onNewInvoice() {
    this.router.navigate(['/home']);
  }
  invoices: InvoiceData[] = [];
  displayedColumns: string[] = [
    'client',
    'location',
    'grandTotal',
    'paymentStatus',
    'action'
  ];
  onDeleteInvoice(invoice: any) {
    if (!invoice.id) {
      console.error('Invoice id is required to delete');
      return;
    }
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Invoice',
        message: 'Are you sure you want to delete this invoice?'
      }
    });
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.loader.show();
        this.invoiceService.deleteInvoice(invoice.id).subscribe({
          next: () => {
            this.invoices = this.invoices.filter(inv => inv.id !== invoice.id);
          },
          error: (err) => {
            console.error('Failed to delete invoice:', err);
            this.loader.hide();
          },
          complete: () => this.loader.hide()
        });
      }
    });
  }

  constructor(
    private invoiceService: InvoiceService,
    private router: Router,
    private dialog: MatDialog,
    private loader: LoaderService
  ) {
    this.loader.show();
    this.invoiceService.getInvoices().subscribe({
      next: (data) => { this.invoices = data; console.log(this.invoices); },
      error: (err) => { console.error('Failed to fetch invoices:', err); this.loader.hide(); },
      complete: () => this.loader.hide()
    });
  }

  onInvoiceRowClick(invoice: any) {
    if (!invoice.id) {
      console.error('Invoice id is required to fetch products');
      return;
    }
    this.loader.show();
    this.invoiceService.getInvoiceProducts(invoice.id).subscribe({
      next: (products) => { this.router.navigate(['/home'], { state: { invoice, products } }); },
      error: (err) => { console.error('Failed to fetch invoice products:', err); this.loader.hide(); },
      complete: () => this.loader.hide()
    });
  }

}
