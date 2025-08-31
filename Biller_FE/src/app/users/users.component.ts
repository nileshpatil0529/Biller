// ...existing code...
// ...existing code...
import { Component, OnInit } from '@angular/core';
import { UsersService, User } from './users.service';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import SnackbarComponent from '../shared/snackbar.component';
import { ConfirmDialogComponent } from '../shared/confirm-dialog.component';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  addUserBtnDisabled = false;
  showUserForm = false;
  editingUserId: number | null = null; // null for add, user.id for edit
  displayedColumns: string[] = ['id', 'username', 'role', 'actions'];
  dataSource = new MatTableDataSource<User>();
  userForm: FormGroup;

  get realUserCount(): number {
    return this.dataSource.filteredData.filter(u => u.id !== 0).length;
  }

  constructor(
    private usersService: UsersService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(5)]],
      role: ['user', Validators.required]
    });
  }

  ngOnInit() {
    this.usersService.getUsers().subscribe({
      next: (users) => {
        this.dataSource.data = users;
      }
    });
  }

  cancelUserForm() {
    this.userForm.reset({ role: 'user' });
    this.showUserForm = false;
    this.editingUserId = null;
    this.addUserBtnDisabled = false;
  }
  onAddUserClick() {
    this.addUserBtnDisabled = true;
    this.showUserForm = true;
    this.editingUserId = null;
    this.userForm.reset({ role: 'user' });
  }

  onSubmit() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }
  const { username, role } = this.userForm.value;
  if (this.editingUserId === null) {
      // Add user
      this.usersService.createUser({ username, role }).subscribe({
        next: (user) => {
          this.usersService.getUsers().subscribe({
            next: (users) => {
              this.dataSource.data = users;
              this.userForm.reset({ role: 'user' });
              this.showUserForm = false;
              this.editingUserId = null;
              this.addUserBtnDisabled = false;
              this.snackBar.openFromComponent(SnackbarComponent, {
                data: { message: 'User added successfully!', class: 'snackbar-success' },
                duration: 3000,
                verticalPosition: 'top'
              });
            }
          });
        },
        error: (err) => {
          let msg = 'Error adding user';
          if (err?.error?.message) msg = err.error.message;
          this.addUserBtnDisabled = false;
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: { message: msg, class: 'snackbar-error' },
            duration: 4000,
            verticalPosition: 'top'
          });
        }
      });
    } else {
      // Edit user
      this.usersService.updateUser(this.editingUserId, { username, role }).subscribe({
        next: (user) => {
          this.usersService.getUsers().subscribe({
            next: (users) => {
              this.dataSource.data = users;
              this.userForm.reset({ role: 'user' });
              this.showUserForm = false;
              this.editingUserId = null;
              this.snackBar.openFromComponent(SnackbarComponent, {
                data: { message: 'User updated successfully!', class: 'snackbar-success' },
                duration: 3000,
                verticalPosition: 'top'
              });
            }
          });
        },
        error: (err) => {
          let msg = 'Error updating user';
          if (err?.error?.message) msg = err.error.message;
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: { message: msg, class: 'snackbar-error' },
            duration: 4000,
            verticalPosition: 'top'
          });
        }
      });
    }
  }

  async deleteUser(id: number) {
  // No longer using addingRow, just proceed
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete User',
        message: 'Are you sure you want to delete this user?'
      }
    });
    const confirmed = await dialogRef.afterClosed().toPromise();
    if (confirmed) {
      this.usersService.deleteUser(id).subscribe({
        next: () => {
          this.usersService.getUsers().subscribe({
            next: (users) => {
              this.dataSource.data = users;
              this.snackBar.openFromComponent(SnackbarComponent, {
                data: { message: 'User deleted successfully!', class: 'snackbar-success' },
                duration: 3000,
                verticalPosition: 'top'
              });
            }
          });
        },
        error: (err) => {
          let msg = 'Error deleting user';
          if (err?.error?.message) msg = err.error.message;
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: { message: msg, class: 'snackbar-error' },
            duration: 4000,
            verticalPosition: 'top'
          });
        }
      });
    }
  }

  editUser(user: User) {
  // Use 'username' property for the form
  this.userForm.setValue({ username: user.username || '', role: user.role || 'user' });
    this.showUserForm = true;
    this.editingUserId = user.id;
  }
}
