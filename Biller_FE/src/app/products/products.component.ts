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


@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
})

export class ProductsComponent implements OnInit, AfterViewInit {
  // Properties
  productSearch = '';
  products: Product[] = [];
  filteredProducts: Product[] = [];
  
  // Table properties
  dataSource = new MatTableDataSource<Product>();
  pageSize = 5;
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
    private router: Router
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
    this.dataSource.data = this.products.filter((product: Product) =>
      product.code.toLowerCase().includes(filterValue) ||
      product.name.toLowerCase().includes(filterValue) ||
      product.nameHindi.toLowerCase().includes(filterValue) ||
      product.unit.toLowerCase().includes(filterValue)
    );
  }

  clearSearch() {
    this.productSearch = '';
    this.dataSource.data = this.products;
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
  }

  addRow(): void {
    if (this.addingRow) return;
    this.addingRow = true;
    this.showForm = false;
    this.productForm.reset({ price: 0, stockQty: 0 });
    // Insert a blank row at the top for editing
    this.products = [
      {
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
