import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoaderService {
    private isLoading = new BehaviorSubject<boolean>(false);
    public readonly loading$ = this.isLoading.asObservable();

    show(): void { this.isLoading.next(true); }
    hide(): void { this.isLoading.next(false); }
}