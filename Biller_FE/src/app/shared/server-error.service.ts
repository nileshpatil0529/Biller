import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ServerErrorDialogComponent } from './server-error-dialog.component';

@Injectable({ providedIn: 'root' })
export class ServerErrorService {
  private opened = false;
  constructor(private dialog: MatDialog) {}

  showError() {
    if (this.opened) return;
    this.opened = true;
    const ref = this.dialog.open(ServerErrorDialogComponent, {
      disableClose: true
    });
    ref.afterClosed().subscribe(() => {
      this.opened = false;
    });
  }
}
