import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface RideHistory {
  distance: number;
  mileage: number;
  petrolPrice: number;
  totalCost: number;
  unit: string;
  currency: string;
  date: string;
}

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected title = 'ride-cost-calculator-app';

  distanceKm: number | null = null;
  mileage: number | null = null;
  petrolPrice: number | null = null;
  totalCost: number | null = null;

  unit: 'km' | 'mi' = 'km';
  currency: '₹' | '$' | '€' = '₹';

  rideHistory: RideHistory[] = [];

  constructor() {
    this.loadHistory();
  }

  convertDistanceToKm(): number {
    return this.unit === 'km' ? this.distanceKm! : this.distanceKm! * 1.60934;
  }

  calculateCost() {
    if (this.distanceKm && this.mileage && this.petrolPrice) {
      const distanceInKm = this.convertDistanceToKm();
      const litersUsed = distanceInKm / this.mileage;
      this.totalCost = litersUsed * this.petrolPrice;
      this.saveToHistory(distanceInKm, litersUsed * this.petrolPrice);
    }
  }

  saveToHistory(distance: number, totalCost: number) {
    const record: RideHistory = {
      distance: this.distanceKm!,
      mileage: this.mileage!,
      petrolPrice: this.petrolPrice!,
      totalCost,
      unit: this.unit,
      currency: this.currency,
      date: new Date().toLocaleString(),
    };

    this.rideHistory.unshift(record);
    localStorage.setItem('rideHistory', JSON.stringify(this.rideHistory));
  }

  loadHistory() {
    const saved = localStorage.getItem('rideHistory');
    if (saved) {
      this.rideHistory = JSON.parse(saved);
    }
  }

  resetForm() {
    this.distanceKm = null;
    this.mileage = null;
    this.petrolPrice = null;
    this.totalCost = null;
  }

  clearHistory() {
    localStorage.removeItem('rideHistory');
    this.rideHistory = [];
  }
}
