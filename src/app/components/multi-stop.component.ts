import { Component, input, signal, computed, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MultiStopLeg } from '../models/multi-stop-leg.model';

@Component({
  selector: 'app-multi-stop',
  imports: [FormsModule],
  template: `
    <div class="mt-4 p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl border border-cyan-200 dark:border-cyan-700">
      <button (click)="expanded.set(!expanded())"
        class="w-full flex items-center justify-between text-sm font-semibold text-cyan-800 dark:text-cyan-200">
        <span>📍 Multi-Stop Route</span>
        <span class="text-cyan-500 text-xs">{{ expanded() ? '▲ Collapse' : '▼ Expand' }}</span>
      </button>

      @if (expanded()) {
        <p class="text-xs text-cyan-600 dark:text-cyan-400 mt-2 mb-3">
          Add multiple legs. Total distance will be calculated for you.
        </p>

        <div class="space-y-2">
          @for (leg of legs(); track leg.id; let i = $index) {
            <div class="flex items-center gap-2">
              <span class="text-xs text-cyan-600 dark:text-cyan-400 min-w-4">{{ i + 1 }}.</span>
              <input [(ngModel)]="leg.label" [name]="'legLabel' + leg.id" placeholder="e.g. Home → Office"
                class="flex-1 text-xs p-1.5 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
              <input type="number" [(ngModel)]="leg.distance" [name]="'legDist' + leg.id" placeholder="{{ unit() }}"
                class="w-20 text-xs p-1.5 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
              <button (click)="removeLeg(leg.id)" class="text-red-400 hover:text-red-600 text-xs" title="Remove leg">✕</button>
            </div>
          }
        </div>

        <div class="flex gap-2 mt-3">
          <button (click)="addLeg()"
            class="flex-1 text-xs py-1.5 border border-cyan-400 dark:border-cyan-600 text-cyan-700 dark:text-cyan-300 rounded-md hover:bg-cyan-100 dark:hover:bg-cyan-900/40 transition-colors">
            + Add Stop
          </button>
          <button (click)="applyTotal()"
            [disabled]="totalDistance() <= 0"
            class="flex-1 text-xs py-1.5 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:opacity-40 transition-colors">
            Use Total ({{ totalDistance().toFixed(1) }} {{ unit() }})
          </button>
        </div>
      }
    </div>
  `,
})
export class MultiStopComponent {
  unit = input.required<string>();

  totalDistanceSelected = output<number>();

  expanded = signal(false);
  legs = signal<MultiStopLeg[]>([
    { id: '1', label: 'Home → Office', distance: 0 },
    { id: '2', label: 'Office → Home', distance: 0 },
  ]);

  totalDistance = computed(() =>
    this.legs().reduce((sum, l) => sum + (Number(l.distance) || 0), 0)
  );

  addLeg() {
    this.legs.update(l => [...l, { id: Date.now().toString(), label: '', distance: 0 }]);
  }

  removeLeg(id: string) {
    this.legs.update(l => l.filter(leg => leg.id !== id));
  }

  applyTotal() {
    this.totalDistanceSelected.emit(this.totalDistance());
  }
}
