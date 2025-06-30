import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'theme-preference';

  // Signal to track the current theme
  private themeSignal = signal<'light' | 'dark'>('light');

  // Computed signal to check if dark mode is active
  isDarkMode = computed(() => this.themeSignal() === 'dark');

  constructor() {
    this.initializeTheme();
  }

  private initializeTheme(): void {
    // Check localStorage first, then system preference, then default to light
    const savedTheme = localStorage.getItem(this.THEME_KEY);

    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      this.themeSignal.set(savedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.themeSignal.set(prefersDark ? 'dark' : 'light');
    }

    this.applyTheme();
  }

  toggleTheme(): void {
    const newTheme = this.themeSignal() === 'light' ? 'dark' : 'light';
    this.themeSignal.set(newTheme);
    localStorage.setItem(this.THEME_KEY, newTheme);
    this.applyTheme();
  }

  setTheme(theme: 'light' | 'dark'): void {
    this.themeSignal.set(theme);
    localStorage.setItem(this.THEME_KEY, theme);
    this.applyTheme();
  }

  private applyTheme(): void {
    const isDark = this.isDarkMode();

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  getCurrentTheme(): 'light' | 'dark' {
    return this.themeSignal();
  }
}
