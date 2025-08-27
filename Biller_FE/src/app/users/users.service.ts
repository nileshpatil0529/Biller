export interface User {
  id: number;
  name: string;
  email: string;
}

import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private users: User[] = [
    { id: 1, name: 'Alice Smith', email: 'alice@example.com' },
    { id: 2, name: 'Bob Johnson', email: 'bob@example.com' },
    { id: 3, name: 'Charlie Brown', email: 'charlie@example.com' },
    { id: 4, name: 'Diana Prince', email: 'diana@example.com' },
    { id: 5, name: 'Ethan Hunt', email: 'ethan@example.com' }
  ];

  getUsers(): User[] {
    return [...this.users];
  }

  addUser(user: User) {
    const newId = this.users.length ? Math.max(...this.users.map(u => u.id)) + 1 : 1;
    this.users.push({ ...user, id: newId });
  }

  updateUser(user: User) {
    const idx = this.users.findIndex(u => u.id === user.id);
    if (idx > -1) {
      this.users[idx] = { ...user };
    }
  }

  deleteUser(id: number) {
    this.users = this.users.filter(u => u.id !== id);
  }
}
