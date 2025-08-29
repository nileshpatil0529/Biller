// ...existing imports...
// Remove duplicate class and misplaced code
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

export class ProductsComponent implements OnInit, AfterViewInit {
  importErrors: any[] = [];
  // Import dialog properties
  showImportForm = false;
  importFile: File | null = null;

  importProducts(): void {
    this.showImportForm = true;
    this.importFile = null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')) {
        this.importFile = file;
      } else {
        this.showSnackbar('Please select a valid Excel or CSV file (.xlsx, .xls, .csv)', 'error');
        input.value = '';
        this.importFile = null;
      }
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
      next: (res) => {
        this.importErrors = [];
        this.importFile = null;
        this.showImportForm = false;
        this.loadProducts();
        this.showSnackbar('Products imported successfully', 'success');
      },
      error: (err) => {
        this.importFile = null;
        if (err?.error?.errors) {
          this.importErrors = err.error.errors;
          this.showSnackbar('Import failed: ' + (err?.error?.message || 'Validation errors'), 'error');
        } else {
          this.importErrors = [{ row: '-', error: err?.error?.message || 'Unknown error', product: {} }];
          this.showSnackbar('Import failed: ' + (err?.error?.message || 'Unknown error'), 'error');
        }
      }
    });
  }

  cancelImport(): void {
  this.showImportForm = false;
  this.importFile = null;
  this.importErrors = [];
  }
  // Properties
  productSearch = '';
  products: Product[] = [];
  filteredProducts: Product[] = [];
  
  // Table properties
  dataSource = new MatTableDataSource<Product>();
  pageSize = 10;
  pageSizeOptions = [5, 10, 20, 30];
  total = 0;
  displayedColumns: string[] = [
    'code',
    'name',
    'nameHindi',
    'unit',
    'price',
    'stockQty',
    'actions',
  ];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  productForm: FormGroup;
  editingProduct: Product | null = null;
  showForm = false;
  addingRow = false;
  units: string[] = ['pcs', 'box', 'kg', 'ltr', 'meter', 'dozen'];

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

  private showSnackbar(message: string, type: 'success' | 'error' | 'warning' = 'success', duration: number = 3000) {
    let panelClass = '';
    switch (type) {
      case 'success':
        panelClass = 'snackbar-success';
        break;
      case 'error':
        panelClass = 'snackbar-error';
        break;
      case 'warning':
        panelClass = 'snackbar-warning';
        break;
      default:
        panelClass = 'snackbar-success';
    }
    this.snackBar.openFromComponent(SnackbarComponent, {
      data: { message, class: panelClass },
      duration,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: [panelClass]
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    this.dataSource.filterPredicate = (data: Product, filter: string) => {
      const filterValue = filter.trim().toLowerCase();
      return data.name.toLowerCase().includes(filterValue);
    };
  }

  private loadProducts(): void {
    this.productsService.getProducts().subscribe(products => {
      this.products = products;
      this.updateDataSource();
      this.filteredProducts = this.products;
    });
  }

  private updateDataSource(): void {
    this.total = this.products.length;
    this.dataSource.data = this.products;
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }
  applyFilterAutocomplete(value: string) {
    const filterValue = value ? value.trim().toLowerCase() : '';
    this.filteredProducts = this.products.filter(product =>
      product.code.toLowerCase().includes(filterValue) ||
      product.name.toLowerCase().includes(filterValue) ||
      product.nameHindi.toLowerCase().includes(filterValue) ||
      product.unit.toLowerCase().includes(filterValue)
    );
  }

  /** Opens the edit form for a product */
  openForm(product: Product): void {
    this.editingProduct = product;
    this.showForm = true;
    this.productForm.setValue({
      code: product.code,
      name: product.name,
      nameHindi: product.nameHindi,
      unit: product.unit,
      price: product.price,
      stockQty: product.stockQty,
    });
  }

  /** Closes the edit form */
  closeForm(): void {
    this.showForm = false;
    this.editingProduct = null;
    this.productForm.reset({ price: 0, stockQty: 0 });
  }

  @ViewChild('searchInput') searchInput!: ElementRef;
  @ViewChild(MatAutocompleteTrigger) autocompleteTrigger!: MatAutocompleteTrigger;

  clearFilterAutocomplete() {
    this.productSearch = '';
    this.filteredProducts = [];
    
    // Close panel and remove focus
    if (this.autocompleteTrigger) {
      this.autocompleteTrigger.closePanel();
    }
    if (this.searchInput && this.searchInput.nativeElement) {
      this.searchInput.nativeElement.blur();
    }
    
    // Reset products list after panel is closed
    requestAnimationFrame(() => {
      this.filteredProducts = this.products;
    });
    }
  
      applyFilter(value: string) {
  const filterValue = value ? value.trim().toLowerCase() : '';
  this.dataSource.filter = filterValue;
  }

  clearSearch() {
  this.productSearch = '';
  this.dataSource.filter = '';
  }

  private focusAndSelectSearchInput() {
    if (this.searchInput && this.searchInput.nativeElement) {
      const inputElement = this.searchInput.nativeElement as HTMLInputElement;
      
      // Focus the input
      inputElement.focus();
      
      // If there's text in the input, select it
      setTimeout(() => {
        if (this.productSearch) {
          inputElement.select();
        }
        
        // Open the autocomplete panel
        if (this.autocompleteTrigger) {
          this.autocompleteTrigger.openPanel();
        }
      }, 0);
    }
  }
  // ...existing code...

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  onMatPage(event: PageEvent): void {
    this.pageSize = event.pageSize;
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  addRow(): void {
    if (this.addingRow) return;
    this.addingRow = true;
    this.showForm = false;
    this.productForm.reset({ price: 0, stockQty: 0 });
    // Insert a blank row at the top for editing
    this.products = [
      {
        id: 0,
        code: '',
        name: '',
        nameHindi: '',
        unit: '',
        price: 0,
        stockQty: 0,
      },
      ...this.products
    ];
    this.dataSource.data = this.products;
    this.total = this.products.length;
    // Focus the first input if needed (handled by Angular)
  }

  saveProduct(): void {
    if (this.productForm.invalid) return;
    let product = this.productForm.value;
    if (this.addingRow) {
      // Remove id if present
      const { id, ...productPayload } = product;
      this.productsService.addProduct(productPayload).subscribe(() => {
        this.addingRow = false;
        this.loadProducts();
        this.productForm.reset({ price: 0, stockQty: 0 });
      });
    } else if (this.editingProduct && typeof this.editingProduct.id === 'number') {
      // Use id for update (assumes editingProduct has id)
      this.productsService.updateProduct(this.editingProduct.id, product).subscribe(() => {
        this.showForm = false;
        this.editingProduct = null;
        this.loadProducts();
        this.productForm.reset({ price: 0, stockQty: 0 });
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
      data: {
        title: 'Delete Product',
        message: 'Are you sure you want to delete this product?',
      },
    });
    const confirmed = await dialogRef.afterClosed().toPromise();
    if (confirmed) {
      const product = this.products[index];
      if (product && product.id) {
        this.productsService.deleteProduct(product.id).subscribe({
          next: () => {
            this.loadProducts();
            this.showSnackbar('Product deleted successfully', 'success');
          },
          error: (err) => {
            this.showSnackbar('Failed to delete product: ' + (err?.error?.message || 'Unknown error'), 'error');
          },
        });
      }
    }
  }


  exportProducts(): void {
    const csv = [
      'code,name,nameHindi,unit,price,stockQty',
      ...this.products.map((p) =>
        [p.code, p.name, p.nameHindi, p.unit, p.price, p.stockQty].join(',')
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
}
