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

  exportToCSV() {
    if (this.rideHistory.length === 0) return;

    const headers = [
      'Distance',
      'Unit',
      'Mileage',
      'Petrol Price',
      'Total Cost',
      'Currency',
      'Date',
    ];
    const rows = this.rideHistory.map((r) =>
      [
        r.distance,
        r.unit,
        r.mileage,
        r.petrolPrice,
        r.totalCost.toFixed(2),
        r.currency,
        r.date,
      ].join(',')
    );
    const csvContent = [headers.join(','), ...rows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'ride_history.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  printRide(ride: RideHistory) {
    const printWindow = window.open('', '_blank', 'width=600,height=400');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Ride Receipt</title>
          <style>
            body { font-family: Arial; padding: 20px; }
            h2 { color: #4f46e5; }
            p { margin: 4px 0; }
          </style>
        </head>
        <body>
          <h2>🚗 Ride Receipt</h2>
          <p><strong>Date:</strong> ${ride.date}</p>
          <p><strong>Distance:</strong> ${ride.distance} ${ride.unit}</p>
          <p><strong>Mileage:</strong> ${ride.mileage} km/l</p>
          <p><strong>Petrol Price:</strong> ${ride.currency}${
      ride.petrolPrice
    }</p>
          <p><strong>Total Cost:</strong> ${
            ride.currency
          }${ride.totalCost.toFixed(2)}</p>
          <hr />
          <p style="text-align:center;">Thank you for using Ride Cost Calculator!</p>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }
}
