import { Component, inject, signal, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { VehiclePresetService } from '../services/vehicle-preset.service';
import { VehiclePreset } from '../models/vehicle-preset.model';

@Component({
  selector: 'app-vehicle-presets',
  imports: [FormsModule],
  template: `
    <div class="mb-4 p-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl border border-violet-200 dark:border-violet-700">
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-semibold text-violet-800 dark:text-violet-200 text-sm flex items-center gap-1">
          🚘 Vehicle Presets
        </h3>
        <button (click)="showForm.set(!showForm())"
          class="text-xs px-2 py-1 rounded-md bg-violet-600 text-white hover:bg-violet-700 transition-colors">
          {{ showForm() ? 'Cancel' : '+ Add' }}
        </button>
      </div>

      <!-- Preset list -->
      <div class="flex flex-wrap gap-2 mb-2">
        @for (preset of service.presets(); track preset.id) {
          <div class="flex items-center gap-1">
            <button
              (click)="selectPreset(preset)"
              [class.ring-2]="selectedId() === preset.id"
              class="px-3 py-1 text-xs rounded-full border border-violet-300 dark:border-violet-600 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-800 transition-all ring-violet-500">
              {{ fuelEmoji(preset.fuelType) }} {{ preset.name }} ({{ preset.mileage }} {{ preset.fuelType === 'electric' ? 'km/kWh' : 'km/l' }})
            </button>
            <button (click)="deletePreset(preset.id)"
              class="text-red-400 hover:text-red-600 text-xs transition-colors" title="Delete preset">✕</button>
          </div>
        }
        @if (service.presets().length === 0) {
          <p class="text-xs text-violet-500 dark:text-violet-400 italic">No presets yet. Add one!</p>
        }
      </div>

      <!-- Add form -->
      @if (showForm()) {
        <div class="mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 space-y-2">
          <input [(ngModel)]="newName" name="presetName" placeholder="Name (e.g. My Bike)"
            class="w-full text-sm p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
          <div class="flex gap-2">
            <input type="number" [(ngModel)]="newMileage" name="presetMileage" placeholder="Mileage"
              class="flex-1 text-sm p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
            <select [(ngModel)]="newFuelType" name="presetFuelType"
              class="flex-1 text-sm p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
              <option value="petrol">⛽ Petrol</option>
              <option value="diesel">🛢️ Diesel</option>
              <option value="cng">💨 CNG</option>
              <option value="electric">⚡ Electric</option>
            </select>
          </div>
          <button (click)="addPreset()"
            class="w-full text-sm py-1.5 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors">
            Save Preset
          </button>
        </div>
      }
    </div>
  `,
})
export class VehiclePresetsComponent {
  service = inject(VehiclePresetService);

  presetSelected = output<{ mileage: number; fuelType: VehiclePreset['fuelType'] }>();

  showForm = signal(false);
  selectedId = signal<string | null>(null);
  newName = '';
  newMileage: number | null = null;
  newFuelType: VehiclePreset['fuelType'] = 'petrol';

  fuelEmoji(type: string): string {
    const map: Record<string, string> = { petrol: '⛽', diesel: '🛢️', cng: '💨', electric: '⚡' };
    return map[type] ?? '⛽';
  }

  selectPreset(preset: VehiclePreset) {
    this.selectedId.set(preset.id);
    this.presetSelected.emit({ mileage: preset.mileage, fuelType: preset.fuelType });
  }

  addPreset() {
    if (!this.newName || !this.newMileage) return;
    this.service.addPreset({ name: this.newName, mileage: this.newMileage, fuelType: this.newFuelType });
    this.newName = '';
    this.newMileage = null;
    this.newFuelType = 'petrol';
    this.showForm.set(false);
  }

  deletePreset(id: string) {
    if (this.selectedId() === id) this.selectedId.set(null);
    this.service.deletePreset(id);
  }
}
