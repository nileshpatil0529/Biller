import { Component } from '@angular/core';
import { SettingsService } from '../shared/settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {
  showConfirm = false;
  settingsService: SettingsService;

  constructor(settingsService: SettingsService) {
    this.settingsService = settingsService;
  }

  toggleLanguage() {
    const current = this.settingsService.getLanguage();
    this.settingsService.setLanguage(current === 'e' ? 'h' : 'e');
  }

  onLangToggle(event: any) {
    this.settingsService.setLanguage(event.checked ? 'h' : 'e');
  }

  saveSettings() {
  }
}
