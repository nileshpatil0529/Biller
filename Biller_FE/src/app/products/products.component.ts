import { Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../shared/confirm-dialog.component';
import { ProductsService } from './products.service';
import type { Product } from './products.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../shared/snackbar.component';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
})

export class ProductsComponent implements OnInit {
  // All variable declarations at the top
  importErrors: any[] = [];
  showImportForm = false;
  importFile: File | null = null;
  productSearch = '';
  products: Product[] = [];
  private _paginator!: MatPaginator;
  @ViewChild(MatPaginator)
  set paginator(p: MatPaginator) {
    this._paginator = p;
    if (this.dataSource) {
      this.dataSource.paginator = p;
    }
  }
  dataSource = new MatTableDataSource<Product>();
  pageSize = 10;
  pageSizeOptions = [5, 10, 20, 30];
  total = 0;
  displayedColumns: string[] = ['code', 'name', 'nameHindi', 'unit', 'price', 'stockQty', 'actions'];
  units: string[] = ['pcs', 'box', 'kg', 'ltr', 'meter', 'dozen'];
  productForm: FormGroup;
  editingProduct: Product | null = null;
  showForm = false;
  addingRow = false;

  @ViewChild('searchInput') searchInput!: ElementRef;
  @ViewChild(MatAutocompleteTrigger) autocompleteTrigger!: MatAutocompleteTrigger;

  constructor(
    private fb: FormBuilder,
    private productsService: ProductsService,
    private dialog: MatDialog,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.productForm = this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      nameHindi: ['', Validators.required],
      unit: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      stockQty: [0, [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    this.dataSource.filterPredicate = (data: Product, filter: string) => data.name.toLowerCase().includes(filter.trim().toLowerCase());
  }

  // Methods below
  importProducts(): void {
    this.showImportForm = true;
    this.importFile = null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file && file.name.match(/\.(xlsx|xls|csv)$/)) {
      this.importFile = file;
    } else {
      this.showSnackbar('Please select a valid Excel or CSV file (.xlsx, .xls, .csv)', 'error');
      if (input) input.value = '';
      this.importFile = null;
    }
  }

  uploadImportFile(): void {
    if (!this.importFile) {
      this.showSnackbar('No file selected', 'error');
      this.importErrors = [];
      return;
    }
    const formData = new FormData();
    formData.append('file', this.importFile);
    this.productsService.uploadProductFile(formData).subscribe({
      next: () => {
        this.importErrors = [];
        this.importFile = null;
        this.showImportForm = false;
        this.loadProducts();
        this.showSnackbar('Products imported successfully', 'success');
      },
      error: (err) => {
        this.importFile = null;
        this.importErrors = err?.error?.errors || [{ row: '-', error: err?.error?.message || 'Unknown error', product: {} }];
        this.showSnackbar('Import failed: ' + (err?.error?.message || 'Unknown error'), 'error');
      }
    });
  }

  cancelImport(): void {
    this.showImportForm = false;
    this.importFile = null;
    this.importErrors = [];
  }

  private showSnackbar(message: string, type: 'success' | 'error' | 'warning' = 'success', duration: number = 3000) {
    const panelClass = type === 'error' ? 'snackbar-error' : type === 'warning' ? 'snackbar-warning' : 'snackbar-success';
    this.snackBar.openFromComponent(SnackbarComponent, {
      data: { message, class: panelClass }, duration, horizontalPosition: 'center', verticalPosition: 'top', panelClass: [panelClass]
    });
  }

  private loadProducts(): void {
    this.productsService.getProducts().subscribe(products => {
      this.products = products;
      this.updateDataSource();
    });
  }

  private updateDataSource(): void {
    this.total = this.products.length;
    this.dataSource.data = this.products;
    if (this.paginator) this.dataSource.paginator = this.paginator;
  }

  /** Opens the edit form for a product */
  openForm(product: Product): void {
  this.editingProduct = product;
  this.showForm = true;
  this.productForm.patchValue(product);
  }

  /** Closes the edit form */
  closeForm(): void {
    this.showForm = false;
    this.editingProduct = null;
    this.productForm.reset({ price: 0, stockQty: 0 });
  }

  clearFilterAutocomplete() {
  this.productSearch = '';
  this.autocompleteTrigger?.closePanel();
  this.searchInput?.nativeElement?.blur();
  }

  applyFilter(value: string) {
    this.dataSource.filter = value ? value.trim().toLowerCase() : '';
  }

  clearSearch() {
    this.productSearch = '';
    this.dataSource.filter = '';
  }

  private focusAndSelectSearchInput() {
    const inputElement = this.searchInput?.nativeElement as HTMLInputElement;
    if (inputElement) {
      inputElement.focus();
      setTimeout(() => {
        if (this.productSearch) inputElement.select();
        this.autocompleteTrigger?.openPanel();
      }, 0);
    }
  }

  onMatPage(event: PageEvent): void {
    this.pageSize = event.pageSize;
    if (this.paginator) this.dataSource.paginator = this.paginator;
  }

  addRow(): void {
    if (this.addingRow) return;
    this.addingRow = true;
    this.showForm = false;
    this.productForm.reset({ price: 0, stockQty: 0 });
    this.products = [{ id: 0, code: '', name: '', nameHindi: '', unit: '', price: 0, stockQty: 0 }, ...this.products];
    this.updateDataSource();
  }

  saveProduct(): void {
    if (this.productForm.invalid) return;
    const product = this.productForm.value;
    if (this.addingRow) {
      const { id, ...productPayload } = product;
      this.productsService.addProduct(productPayload).subscribe({
        next: () => {
          this.addingRow = false;
          this.loadProducts();
          this.productForm.reset({ price: 0, stockQty: 0 });
          this.showSnackbar('Product added successfully', 'success');
        },
        error: (err) => {
          this.showSnackbar('Failed to add product: ' + (err?.error?.message || 'Unknown error'), 'error');
        }
      });
    } else if (this.editingProduct?.id != null) {
      this.productsService.updateProduct(this.editingProduct.id, product).subscribe({
        next: () => {
          this.showForm = false;
          this.editingProduct = null;
          this.loadProducts();
          this.productForm.reset({ price: 0, stockQty: 0 });
        },
        error: (err) => {
          this.showSnackbar('Failed to update product: ' + (err?.error?.message || 'Unknown error'), 'error');
        }
      });
    } else {
      this.showSnackbar('Cannot update: Product ID is missing.', 'error');
    }
  }

  cancelNewRow(): void {
    this.addingRow = false;
    this.loadProducts();
    this.productForm.reset({ price: 0, stockQty: 0 });
  }

  async deleteProduct(index: number): Promise<void> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Product', message: 'Are you sure you want to delete this product?' }
    });
    if (await dialogRef.afterClosed().toPromise()) {
      const product = this.products[index];
      if (product?.id) {
        this.productsService.deleteProduct(product.id).subscribe({
          next: () => { this.loadProducts(); this.showSnackbar('Product deleted successfully', 'success'); },
          error: (err) => { this.showSnackbar('Failed to delete product: ' + (err?.error?.message || 'Unknown error'), 'error'); },
        });
      }
    }
  }

  exportProducts(): void {
    const csv = ['code,name,nameHindi,unit,price,stockQty', ...this.products.map(p => [p.code, p.name, p.nameHindi, p.unit, p.price, p.stockQty].join(','))].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
