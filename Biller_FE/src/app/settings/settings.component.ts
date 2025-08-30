import { Component } from '@angular/core';
import { SettingsService } from '../shared/settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {
  constructor(public settings: SettingsService) {}

  toggleLanguage() {
    const current = this.settings.getLanguage();
    this.settings.setLanguage(current === 'e' ? 'h' : 'e');
  }
}
