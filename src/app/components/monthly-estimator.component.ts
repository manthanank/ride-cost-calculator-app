import { Component, input, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-monthly-estimator',
  imports: [FormsModule],
  template: `
    <div class="mt-4 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-xl border border-teal-200 dark:border-teal-700">
      <button (click)="expanded.set(!expanded())"
        class="w-full flex items-center justify-between text-sm font-semibold text-teal-800 dark:text-teal-200">
        <span>📅 Monthly Cost Estimator</span>
        <span class="text-teal-500 text-xs">{{ expanded() ? '▲ Collapse' : '▼ Expand' }}</span>
      </button>

      @if (expanded()) {
        <div class="mt-3 space-y-3">
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-xs text-teal-700 dark:text-teal-300 mb-1">Trips per Day</label>
              <input type="number" [(ngModel)]="tripsPerDay" name="tripsPerDay" min="1"
                class="w-full text-sm p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
            </div>
            <div>
              <label class="block text-xs text-teal-700 dark:text-teal-300 mb-1">Working Days/Month</label>
              <input type="number" [(ngModel)]="workingDays" name="workingDays" min="1" max="31"
                class="w-full text-sm p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
            </div>
          </div>

          @if (estimation() > 0) {
            <div class="bg-white dark:bg-gray-800 rounded-lg p-3 border dark:border-gray-700 text-center">
              <p class="text-xs text-gray-500 dark:text-gray-400">Estimated Monthly Fuel Cost</p>
              <p class="text-2xl font-bold text-teal-700 dark:text-teal-300 mt-1">
                {{ currency() }}{{ estimation().toFixed(2) }}
              </p>
              <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {{ tripsPerDay }} trips × {{ workingDays }} days × {{ currency() }}{{ costPerRide().toFixed(2) }}/ride
              </p>
            </div>
          } @else {
            <p class="text-xs text-teal-500 dark:text-teal-400 italic text-center">
              Calculate a ride first to see monthly projections.
            </p>
          }
        </div>
      }
    </div>
  `,
})
export class MonthlyEstimatorComponent {
  costPerRide = input.required<number>();
  currency = input.required<string>();

  expanded = signal(false);
  tripsPerDay = 2;
  workingDays = 22;

  estimation = computed(() => {
    const cost = this.costPerRide();
    if (!cost || cost <= 0) return 0;
    return cost * this.tripsPerDay * this.workingDays;
  });
}
