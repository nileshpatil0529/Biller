export interface InvoiceForm {
  clientId?: number;
  invoiceNumber?: string;
  location: string;
  paymentMode: 'Online' | 'Cash' | 'Credit';
  discount: number;
  grandTotal: number;
  paymentStatus: 'Paid' | 'Unpaid';
}
