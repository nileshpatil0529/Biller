import { Injectable } from '@angular/core';

export interface Product {
  code: string;
  name: string;
  nameHindi: string;
  unit: string;
  price: number;
  stockQty: number;
  sell_qty?: number;
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private products: Product[] = [
    { code: 'P001', name: 'Product One', nameHindi: 'उत्पाद एक', unit: 'pcs', price: 100, stockQty: 50 },
    { code: 'P002', name: 'Product Two', nameHindi: 'उत्पाद दो', unit: 'box', price: 250, stockQty: 20 },
    { code: 'P003', name: 'Product Three', nameHindi: 'उत्पाद तीन', unit: 'kg', price: 75, stockQty: 100 },
    { code: 'P004', name: 'Product Four', nameHindi: 'उत्पाद चार', unit: 'ltr', price: 120, stockQty: 10 },
    { code: 'P005', name: 'Product Five', nameHindi: 'उत्पाद पांच', unit: 'pcs', price: 60, stockQty: 200 },
    { code: 'P006', name: 'Product Six', nameHindi: 'उत्पाद छह', unit: 'box', price: 180, stockQty: 15 },
    { code: 'P007', name: 'Product Seven', nameHindi: 'उत्पाद सात', unit: 'kg', price: 90, stockQty: 80 },
    { code: 'P008', name: 'Product Eight', nameHindi: 'उत्पाद आठ', unit: 'ltr', price: 210, stockQty: 25 },
    { code: 'P009', name: 'Product Nine', nameHindi: 'उत्पाद नौ', unit: 'pcs', price: 55, stockQty: 120 },
    { code: 'P010', name: 'Product Ten', nameHindi: 'उत्पाद दस', unit: 'meter', price: 300, stockQty: 5 },
    { code: 'P011', name: 'Product Eleven', nameHindi: 'उत्पाद ग्यारह', unit: 'dozen', price: 400, stockQty: 8 },
    { code: 'P012', name: 'Product Twelve', nameHindi: 'उत्पाद बारह', unit: 'pcs', price: 70, stockQty: 60 },
    { code: 'P013', name: 'Product Thirteen', nameHindi: 'उत्पाद तेरह', unit: 'box', price: 220, stockQty: 18 },
    { code: 'P014', name: 'Product Fourteen', nameHindi: 'उत्पाद चौदह', unit: 'kg', price: 95, stockQty: 90 },
    { code: 'P015', name: 'Product Fifteen', nameHindi: 'उत्पाद पंद्रह', unit: 'ltr', price: 130, stockQty: 12 }
  ];

  getProducts(): Product[] {
    return [...this.products];
  }

  addProduct(product: Product): void {
    this.products.push(product);
  }

  updateProduct(index: number, product: Product): void {
    this.products[index] = product;
  }

  deleteProduct(index: number): void {
    this.products.splice(index, 1);
  }
}
