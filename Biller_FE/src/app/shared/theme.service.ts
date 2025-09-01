// Available Angular Material prebuilt themes:
// indigo-pink:    https://cdn.jsdelivr.net/npm/@angular/material@15.2.9/prebuilt-themes/indigo-pink.css
// deeppurple-amber: https://cdn.jsdelivr.net/npm/@angular/material@15.2.9/prebuilt-themes/deeppurple-amber.css
// pink-bluegrey:  https://cdn.jsdelivr.net/npm/@angular/material@15.2.9/prebuilt-themes/pink-bluegrey.css
// purple-green:   https://cdn.jsdelivr.net/npm/@angular/material@15.2.9/prebuilt-themes/purple-green.css
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private darkMode: boolean;

  constructor() {
  const storedTheme = localStorage.getItem('theme');
  this.darkMode = storedTheme ? storedTheme === 'dark' : true;
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(this.darkMode ? 'dark-theme' : 'light-theme');
  }


  setDarkMode(enabled: boolean) {
    this.darkMode = enabled;
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(enabled ? 'dark-theme' : 'light-theme');
    localStorage.setItem('theme', enabled ? 'dark' : 'light');
  }

  toggleTheme() {
    this.setDarkMode(!this.darkMode);
  }


  isDarkMode(): boolean {
    return this.darkMode;
  }
}
