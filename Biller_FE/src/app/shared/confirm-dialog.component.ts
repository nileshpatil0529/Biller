import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  template: `
    <div class="confirm-dialog">
      <div class="dialog-header">
        <mat-icon color="warn" class="dialog-icon">warning</mat-icon>
        <h3 class="dialog-title">{{ data.title || 'Confirm' }}</h3>
      </div>
      <div class="dialog-message">
        <p>{{ data.message || 'Are you sure you want to delete this record?' }}</p>
      </div>
      <div class="dialog-actions">
        <button mat-stroked-button color="primary" (click)="onCancel()">Cancel</button>
        <button mat-raised-button color="warn" (click)="onConfirm()">Delete</button>
      </div>
    </div>
  `,
  styles: [`
    .confirm-dialog {
      min-width: 320px;
      padding: 24px 20px 16px 20px;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.10);
      font-family: 'Segoe UI', Arial, sans-serif;
    }
    .dialog-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }
    .dialog-icon {
      font-size: 32px;
      background: #fff3e0;
      border-radius: 50%;
      padding: 6px;
      color: #e65100;
      box-shadow: 0 2px 8px rgba(230,81,0,0.08);
    }
    .dialog-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #333;
    }
    .dialog-message {
      margin-bottom: 18px;
      color: #444;
      font-size: 1rem;
    }
    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 8px;
    }
    button[mat-stroked-button] {
      min-width: 80px;
    }
    button[mat-raised-button] {
      min-width: 80px;
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title?: string; message?: string }
  ) {}

  onConfirm() {
    this.dialogRef.close(true);
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}
