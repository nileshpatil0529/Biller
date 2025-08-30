import { Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../shared/confirm-dialog.component';
import { ProductsService, Product } from '../products/products.service';
import { Router } from '@angular/router';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { ClientService, Client } from '../clients/client.service';
import { InvoiceForm } from './invoice-form.model';
import { InvoiceService } from '../invoice/invoice.service';
import { InvoiceComponent } from '../invoice/invoice.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  showInvoiceForm = false;
  get grandTotal(): number {
    const total = this.dataSource.filteredData.reduce((sum, product) => sum + ((product.sell_qty || 0) * product.price), 0);
    const discount = this.invoiceForm?.get('discount')?.value || 0;
    return total - (total * discount / 100);
  }
  productSearch = '';
  products: Product[] = [];
  dataSource = new MatTableDataSource<Product>();
  displayedColumns: string[] = [
    'code',
    'name',
    'unit',
    'price',
    'stockQty',
    'qty',
    'totalValue',
  ];
  productForm: FormGroup;
  editingProduct: Product | null = null;
  showForm = false;
  addingRow = false;
  units: string[] = ['pcs', 'box', 'kg', 'ltr', 'meter', 'dozen'];
  filteredProducts: Product[] = [];
  @ViewChild('searchInput') searchInput!: ElementRef;
  @ViewChild(MatAutocompleteTrigger) autocompleteTrigger!: MatAutocompleteTrigger;
  invoiceForm: FormGroup;
  clients: Client[] = [];
  locations: string[] = ['Table 1', 'Table 2', 'Counter 1', 'Counter 2'];
  paymentModes: string[] = ['Online', 'Cash', 'Credit'];
  paymentStatuses: string[] = ['Paid', 'Unpaid'];
  discount: number = 0;
  isEditMode: boolean = false; // Set this based on your routing or logic

  clearInvoiceForm(): void {
    this.invoiceForm.reset({
      clientId: null,
      invoiceNumber: '',
      location: '',
      paymentMode: '',
      discount: 0,
      grandTotal: 0,
      paymentStatus: 'Unpaid',
    });
    this.productSearch = '';
    this.filteredProducts = [];
  }

  updateGrandTotal(): void {
    const total = this.grandTotal;
    const discount = this.invoiceForm.get('discount')?.value || 0;
    const discountedTotal = total - (total * discount / 100);
    this.invoiceForm.patchValue({ grandTotal: discountedTotal });
  }

  incrementDiscount(): void {
    let discount = this.invoiceForm.get('discount')?.value || 0;
    discount = Math.min(discount + 5, 100);
    this.invoiceForm.patchValue({ discount });
    this.updateGrandTotal();
  }

  decrementDiscount(): void {
    let discount = this.invoiceForm.get('discount')?.value || 0;
    discount = Math.max(discount - 5, 0);
    this.invoiceForm.patchValue({ discount });
    this.updateGrandTotal();
  }

  onPrintInvoice(): void {
  const clientObj = this.clients.find(c => c.id === this.invoiceForm.get('clientId')?.value);
  const client = clientObj ? clientObj.name : 'Unknown Client';
  const location = this.invoiceForm.get('location')?.value || 'Unknown Location';
    const paymentMode = this.invoiceForm.get('paymentMode')?.value || '';
    const discount = this.invoiceForm.get('discount')?.value || 0;
    const paymentStatus = this.invoiceForm.get('paymentStatus')?.value || '';
    const total = this.dataSource.filteredData.reduce((sum, product) => sum + ((product.sell_qty || 0) * product.price), 0);
    const grandTotal = total - (total * discount / 100);
    const products = this.dataSource.filteredData.map(product => ({
      code: product.code,
      name: product.name,
      unit: product.unit,
      price: product.price,
      sell_qty: typeof product.sell_qty === 'number' ? product.sell_qty : 0,
      totalValue: ((typeof product.sell_qty === 'number' ? product.sell_qty : 0) * product.price)
    }));
    this.invoiceService.addInvoice({
      client,
      location,
      paymentMode,
      discount,
      total,
      grandTotal,
      paymentStatus,
      products
    }).subscribe({
      next: () => {
        this.router.navigate(['/invoices']);
      },
      error: (err) => {
        // Optionally show error to user
        console.error('Failed to save invoice:', err);
      }
    });
  }

  constructor(
    private fb: FormBuilder,
    private productsService: ProductsService,
    private dialog: MatDialog,
    private router: Router,
    private clientService: ClientService,
    private invoiceService: InvoiceService
  ) {
    this.productForm = this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      unit: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      stockQty: [0, [Validators.required, Validators.min(0)]],
    });
    this.invoiceForm = this.fb.group({
      clientId: [null],
      invoiceNumber: [{ value: '', disabled: true }],
      location: ['', Validators.required],
      paymentMode: ['', Validators.required],
      discount: [0],
      grandTotal: [{ value: 0, disabled: true }],
      paymentStatus: ['Unpaid', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    this.clients = this.clientService.getClients();
    this.updateGrandTotal();
  }

  allProducts: Product[] = [];
  private loadProducts(): void {
    this.productsService.getProducts().subscribe(allProducts => {
      this.allProducts = allProducts;
      this.products = allProducts.filter((p: Product) => p.sell_qty && p.sell_qty > 0);
      this.dataSource.data = this.products;
    });
  }



  openForm(product: Product): void {
    this.showForm = true;
    this.editingProduct = product;
    this.productForm.patchValue(product);
    this.addingRow = false;
  }

  closeForm(): void {
    this.showForm = false;
    this.editingProduct = null;
    this.productForm.reset({ price: 0, stockQty: 0 });
    this.addingRow = false;
  }

  addRow(): void {
    if (this.addingRow) return;
    this.addingRow = true;
    this.showForm = false;
    this.productForm.reset({ price: 0, stockQty: 0 });
    this.products = [];
    this.dataSource.data = this.products;
  }

  saveProduct(): void {
    if (this.productForm.invalid) return;
    const product = this.productForm.value;
    if (this.addingRow) {
      this.productsService.addProduct(product).subscribe(() => {
        this.addingRow = false;
        this.loadProducts();
        this.productForm.reset({ price: 0, stockQty: 0 });
      });
    } else if (this.editingProduct) {
      // Update logic would go here if backend supports it
      this.showForm = false;
      this.editingProduct = null;
      this.productForm.reset({ price: 0, stockQty: 0 });
    }
  }

  cancelNewRow(): void {
    this.addingRow = false;
    this.loadProducts();
    this.productForm.reset({ price: 0, stockQty: 0 });
  }

  async deleteProduct(index: number): Promise<void> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Product',
        message: 'Are you sure you want to delete this product?',
      },
    });
    const confirmed = await dialogRef.afterClosed().toPromise();
    if (confirmed) {
      // Delete logic would go here if backend supports it
      this.loadProducts();
    }
  }

  importProducts(): void {
    alert('Import functionality has been disabled.');
  }

  exportProducts(): void {
    const csv = [
  'code,name,unit,price,stockQty',
      ...this.products.map((p) =>
  [p.code, p.name, p.unit, p.price, p.stockQty].join(',')
      ),
    ].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  handleQtyButton(product: Product, action: 'increment' | 'decrement', event: Event, fromAutocomplete: boolean = false) {
    event.stopPropagation();
    if (typeof product.sell_qty !== 'number') product.sell_qty = 0;
    if (action === 'increment') {
      product.sell_qty++;
    } else if (action === 'decrement' && product.sell_qty > 0) {
      product.sell_qty--;
    }
    // Update local products array only
    if (product.sell_qty > 0) {
      if (!this.products.find(p => p.code === product.code)) {
        this.products.unshift(product);
      }
    } else {
      this.products = this.products.filter(p => p.code !== product.code);
    }
    this.dataSource.data = this.products;
    if (fromAutocomplete && this.searchInput && this.searchInput.nativeElement) {
      this.productSearch = '';
      this.searchInput.nativeElement.value = '';
      this.searchInput.nativeElement.focus();
    }
  }

  onSellQtyInput(product: Product, event: any) {
    event.stopPropagation();
    const val = parseFloat(event.target.value);
    product.sell_qty = isNaN(val) ? 0 : val;
    // Update local products array only
    if (product.sell_qty >= 0) {
      if (!this.products.find(p => p.code === product.code)) {
        this.products.unshift(product);
      }
    } else {
      this.products = this.products.filter(p => p.code !== product.code);
    }
    this.dataSource.data = this.products;
  }

  applyFilterAutocomplete(value: string) {
    const filterValue = value ? value.trim().toLowerCase() : '';
    this.filteredProducts = this.allProducts.filter(product =>
      product.code.toLowerCase().includes(filterValue) ||
      product.name.toLowerCase().includes(filterValue) ||
      product.unit.toLowerCase().includes(filterValue)
    );
  }

  clearFilterAutocomplete() {
    this.productSearch = '';
    this.filteredProducts = [];
    if (this.autocompleteTrigger) {
      this.autocompleteTrigger.closePanel();
    }
    if (this.searchInput && this.searchInput.nativeElement) {
      this.searchInput.nativeElement.blur();
    }
    requestAnimationFrame(() => {
      this.filteredProducts = this.allProducts;
    });
  }

  displayProduct(product?: Product | null): string {
    return product && product.code ? `${product.code} - ${product.name}` : '';
  }

  clearAllSellQty(): void {
    this.products.forEach(p => p.sell_qty = 0);
    this.products = [];
    this.dataSource.data = [];
    this.filteredProducts = this.products;
  }
}
