import { Injectable, signal, computed } from '@angular/core';
import { VehiclePreset } from '../models/vehicle-preset.model';

@Injectable({ providedIn: 'root' })
export class VehiclePresetService {
  private readonly KEY = 'vehiclePresets';

  presets = signal<VehiclePreset[]>(this.load());

  private load(): VehiclePreset[] {
    try {
      const raw = localStorage.getItem(this.KEY);
      return raw ? JSON.parse(raw) : this.defaults();
    } catch {
      return this.defaults();
    }
  }

  private defaults(): VehiclePreset[] {
    return [
      { id: 'bike', name: 'Bike', mileage: 45, fuelType: 'petrol' },
      { id: 'car', name: 'Car', mileage: 15, fuelType: 'petrol' },
    ];
  }

  private save() {
    localStorage.setItem(this.KEY, JSON.stringify(this.presets()));
  }

  addPreset(preset: Omit<VehiclePreset, 'id'>): void {
    const id = Date.now().toString();
    this.presets.update(list => [...list, { ...preset, id }]);
    this.save();
  }

  deletePreset(id: string): void {
    this.presets.update(list => list.filter(p => p.id !== id));
    this.save();
  }

  updatePreset(updated: VehiclePreset): void {
    this.presets.update(list => list.map(p => p.id === updated.id ? updated : p));
    this.save();
  }
}
