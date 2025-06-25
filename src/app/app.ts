import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected title = 'ride-cost-calculator-app';

  distanceKm: number = 0;
  mileage: number = 0;
  petrolPrice: number = 0;
  totalCost: number | null = null;

  calculateCost() {
    if (this.distanceKm > 0 && this.mileage > 0 && this.petrolPrice > 0) {
      const litersUsed = this.distanceKm / this.mileage;
      this.totalCost = litersUsed * this.petrolPrice;
    } else {
      this.totalCost = null;
    }
  }

  resetForm() {
    this.distanceKm = 0;
    this.mileage = 0;
    this.petrolPrice = 0;
    this.totalCost = null;
  }
}
