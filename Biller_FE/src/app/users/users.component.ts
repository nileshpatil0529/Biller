// ...existing code...
// ...existing code...
import { Component, OnInit } from '@angular/core';
import { UsersService, User } from './users.service';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../shared/confirm-dialog.component';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  showPasswordMap: { [id: number]: boolean } = {};
  toggleShowPassword(id: number) {
    this.showPasswordMap[id] = !this.showPasswordMap[id];
  }
  displayedColumns: string[] = ['id', 'name', 'password', 'actions'];
  dataSource = new MatTableDataSource<User>();
  editingRow: number | null = null;
  addingRow = false;
  addEditForm: FormGroup;
  formRowId: number | null = null; // 0 for add, user.id for edit

  get realUserCount(): number {
    return this.dataSource.filteredData.filter(u => u.id !== 0).length;
  }

  constructor(private usersService: UsersService, private fb: FormBuilder, private dialog: MatDialog) {
    this.addEditForm = this.fb.group({
      name: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  ngOnInit() {
    this.dataSource.data = this.usersService.getUsers();
  }

  strongPasswordValidator(control: AbstractControl): ValidationErrors | null {
    // Only check for minimum length now
    return null;
  }

  addRow() {
    if (this.addingRow || this.editingRow !== null) return;
    this.addingRow = true;
    this.formRowId = 0;
    this.addEditForm.reset();
    this.dataSource.data = [
      { id: 0, name: '', email: '' },
      ...this.usersService.getUsers()
    ];
  }

  saveNewRow() {
    if (this.addEditForm.invalid) {
      this.addEditForm.markAllAsTouched();
      return;
    }
    const { name, password } = this.addEditForm.value;
    this.usersService.addUser({ id: 0, name, email: password });
    this.dataSource.data = this.usersService.getUsers();
    this.addingRow = false;
    this.formRowId = null;
    this.addEditForm.reset();
  }

  cancelNewRow() {
    this.addingRow = false;
    this.formRowId = null;
    this.addEditForm.reset();
    this.dataSource.data = this.usersService.getUsers();
  }

  startEdit(user: User) {
    if (this.addingRow) return;
    this.editingRow = user.id;
    this.formRowId = user.id;
    this.addEditForm.setValue({ name: user.name, password: user.email });
  }

  saveEdit() {
    if (this.addEditForm.invalid) {
      this.addEditForm.markAllAsTouched();
      return;
    }
    const { name, password } = this.addEditForm.value;
    this.usersService.updateUser({ id: this.formRowId!, name, email: password });
    this.dataSource.data = this.usersService.getUsers();
    this.editingRow = null;
    this.formRowId = null;
    this.addEditForm.reset();
  }

  cancelEdit() {
    this.editingRow = null;
    this.formRowId = null;
    this.addEditForm.reset();
    this.dataSource.data = this.usersService.getUsers();
  }

  async deleteUser(id: number) {
    if (this.addingRow) return;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete User',
        message: 'Are you sure you want to delete this user?'
      }
    });
    const confirmed = await dialogRef.afterClosed().toPromise();
    if (confirmed) {
      this.usersService.deleteUser(id);
      this.dataSource.data = this.usersService.getUsers();
    }
  }
}
