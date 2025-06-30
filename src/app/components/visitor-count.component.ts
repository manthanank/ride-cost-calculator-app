import { Component, input } from '@angular/core';

@Component({
  selector: 'app-visitor-count',
  template: `
    <div class="text-center mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
      @if (isLoading()) {
      <p class="text-sm text-gray-600 dark:text-gray-300">👥 Loading visitor count...</p>
      } @else if (error()) {
      <p class="text-sm text-red-600 dark:text-red-300">👥 {{ error() }}</p>
      } @else {
      <p class="text-sm text-blue-700 dark:text-blue-300">
        <span class="font-semibold">👥 {{ visitorCount() }}</span> unique visitors
      </p>
      }
    </div>
  `,
  styles: []
})
export class VisitorCountComponent {
  visitorCount = input.required<number>();
  isLoading = input.required<boolean>();
  error = input.required<string | null | undefined>();
}
