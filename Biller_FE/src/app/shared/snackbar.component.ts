import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-snackbar',
  standalone: true,
  imports: [NgClass],
  template: `
    <div class="snackbar-top">
      <span [ngClass]="data.class">{{ data.message }}</span>
    </div>
  `,
  styles: [`
    .snackbar-success { color: #43a047; }
    .snackbar-error { color: #e53935; }
    .snackbar-warning { color: #fbc02d; }
  `]
})
export class SnackbarComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: { message: string, class: string }) {}
}

export default SnackbarComponent;
