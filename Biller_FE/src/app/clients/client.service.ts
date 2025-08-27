import { Injectable } from '@angular/core';

export interface Client {
  id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class ClientService {
  private clients: Client[] = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' },
    { id: 3, name: 'Acme Corp.' },
    { id: 4, name: 'Global Traders' },
  ];

  getClients(): Client[] {
    return this.clients;
  }

  getClientById(id: number): Client | undefined {
    return this.clients.find(client => client.id === id);
  }
}
