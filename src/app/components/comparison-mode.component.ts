import { Component, input, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface VehicleInput {
  name: string;
  mileage: number | null;
  petrolPrice: number | null;
}

@Component({
  selector: 'app-comparison-mode',
  imports: [FormsModule],
  template: `
    <div class="mt-4 p-4 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-200 dark:border-rose-700">
      <button (click)="expanded.set(!expanded())"
        class="w-full flex items-center justify-between text-sm font-semibold text-rose-800 dark:text-rose-200">
        <span>⚔️ Vehicle Comparison Mode</span>
        <span class="text-rose-500 text-xs">{{ expanded() ? '▲ Collapse' : '▼ Expand' }}</span>
      </button>

      @if (expanded()) {
        <p class="text-xs text-rose-600 dark:text-rose-400 mt-2 mb-3">
          Compare two vehicles for the same distance ({{ distance() }} {{ unit() }}).
        </p>

        <div class="grid grid-cols-2 gap-3">
          @for (v of vehicles; track $index; let i = $index) {
            <div class="bg-white dark:bg-gray-800 rounded-lg p-3 border dark:border-gray-700 space-y-2">
              <p class="text-xs font-semibold text-rose-700 dark:text-rose-300">Vehicle {{ i + 1 }}</p>
              <input [(ngModel)]="v.name" [name]="'vName' + i" placeholder="Name (e.g. Car)"
                class="w-full text-xs p-1.5 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
              <input type="number" [(ngModel)]="v.mileage" [name]="'vMileage' + i" placeholder="Mileage (km/l)"
                class="w-full text-xs p-1.5 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
              <input type="number" [(ngModel)]="v.petrolPrice" [name]="'vPrice' + i" placeholder="Fuel price/l"
                class="w-full text-xs p-1.5 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
              @if (costs()[i] !== null) {
                <div class="text-center py-1 rounded" [class]="i === cheaperIndex() ? 'bg-green-100 dark:bg-green-900/40' : 'bg-gray-100 dark:bg-gray-700'">
                  <p class="text-sm font-bold" [class]="i === cheaperIndex() ? 'text-green-700 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'">
                    {{ currency() }}{{ costs()[i]!.toFixed(2) }}
                    @if (i === cheaperIndex()) { <span class="text-xs">✅ Cheaper</span> }
                  </p>
                </div>
              }
            </div>
          }
        </div>

        @if (savings() > 0) {
          <p class="text-xs text-center mt-3 text-rose-700 dark:text-rose-300 font-medium">
            💰 You save {{ currency() }}{{ savings().toFixed(2) }} by choosing {{ vehicles[cheaperIndex()].name }}
          </p>
        }
      }
    </div>
  `,
})
export class ComparisonModeComponent {
  distance = input.required<number>();
  unit = input.required<string>();
  currency = input.required<string>();

  expanded = signal(false);

  vehicles: VehicleInput[] = [
    { name: 'Vehicle A', mileage: null, petrolPrice: null },
    { name: 'Vehicle B', mileage: null, petrolPrice: null },
  ];

  private calcCost(v: VehicleInput): number | null {
    if (!v.mileage || !v.petrolPrice || !this.distance()) return null;
    const distKm = this.unit() === 'mi' ? this.distance() * 1.60934 : this.distance();
    return (distKm / v.mileage) * v.petrolPrice;
  }

  costs = computed(() => this.vehicles.map(v => this.calcCost(v)));

  cheaperIndex = computed(() => {
    const c = this.costs();
    if (c[0] === null || c[1] === null) return -1;
    return c[0]! <= c[1]! ? 0 : 1;
  });

  savings = computed(() => {
    const c = this.costs();
    if (c[0] === null || c[1] === null) return 0;
    return Math.abs(c[0]! - c[1]!);
  });
}
