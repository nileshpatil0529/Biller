import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private languageSubject = new BehaviorSubject<'e' | 'h'>('e');
  language$ = this.languageSubject.asObservable();

  setLanguage(lang: 'e' | 'h') {
    this.languageSubject.next(lang);
  }
  getLanguage(): 'e' | 'h' {
    return this.languageSubject.value;
  }
}
