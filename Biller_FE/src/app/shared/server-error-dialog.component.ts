import { Component } from '@angular/core';
@Component({
  selector: 'app-server-error-dialog',
  template: `
    <h2 mat-dialog-title>Server connection error</h2>
    <mat-dialog-content>
      <p>Make sure your server is start and connected or Restart your server</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button color="primary" (click)="reload()">OK</button>
    </mat-dialog-actions>
  `
})
export class ServerErrorDialogComponent {
  reload() {
    // reload the application
    window.location.reload();
  }
}
