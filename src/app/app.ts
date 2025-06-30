import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { httpResource } from '@angular/common/http';
import { Visit } from './models/visit.model';
import { RideHistory } from './models/ride-history.model';
import { environment } from '../environments/environment.development';

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected title = 'ride-cost-calculator-app';

  private apiURL = environment.trackingApiUrl;

  // Convert all properties to signals
  distanceKm = signal<number | null>(null);
  mileage = signal<number | null>(null);
  petrolPrice = signal<number | null>(null);
  totalCost = signal<number | null>(null);

  unit = signal<'km' | 'mi'>('km');
  currency = signal<'₹' | '$' | '€'>('₹');

  rideHistory = signal<RideHistory[]>([]);

  // Create a signal for the project name
  projectName = signal<string>('');

  // Create the httpResource that will react to projectName changes
  visitResource = httpResource<Visit>(() => ({
    url: this.apiURL,
    method: 'POST',
    body: { projectName: this.projectName() }
  }));

  // Use computed signals from httpResource
  visitorCount = computed(() => {
    const value = this.visitResource.value();
    return value?.uniqueVisitors ?? 0;
  });

  isVisitorCountLoading = computed(() => this.visitResource.isLoading());

  visitorCountError = computed(() => this.visitResource.error());

  constructor() {
    this.loadHistory();
  }

  ngOnInit() {
    this.trackVisit();
  }

  private trackVisit(): void {
    // Update the signal to trigger the httpResource
    this.projectName.set(this.title);
  }

  convertDistanceToKm(): number {
    return this.unit() === 'km' ? this.distanceKm()! : this.distanceKm()! * 1.60934;
  }

  calculateCost() {
    if (this.distanceKm() && this.mileage() && this.petrolPrice()) {
      const distanceInKm = this.convertDistanceToKm();
      const litersUsed = distanceInKm / this.mileage()!;
      const cost = litersUsed * this.petrolPrice()!;
      this.totalCost.set(cost);
      this.saveToHistory(distanceInKm, cost);
    }
  }

  saveToHistory(distance: number, totalCost: number) {
    const record: RideHistory = {
      distance: this.distanceKm()!,
      mileage: this.mileage()!,
      petrolPrice: this.petrolPrice()!,
      totalCost,
      unit: this.unit(),
      currency: this.currency(),
      date: new Date().toLocaleString(),
    };

    const currentHistory = this.rideHistory();
    this.rideHistory.set([record, ...currentHistory]);
    localStorage.setItem('rideHistory', JSON.stringify([record, ...currentHistory]));
  }

  loadHistory() {
    const saved = localStorage.getItem('rideHistory');
    if (saved) {
      this.rideHistory.set(JSON.parse(saved));
    }
  }

  resetForm() {
    this.distanceKm.set(null);
    this.mileage.set(null);
    this.petrolPrice.set(null);
    this.totalCost.set(null);
  }

  clearHistory() {
    localStorage.removeItem('rideHistory');
    this.rideHistory.set([]);
  }

  exportToCSV() {
    const history = this.rideHistory();
    if (history.length === 0) return;

    const headers = [
      'Distance',
      'Unit',
      'Mileage',
      'Petrol Price',
      'Total Cost',
      'Currency',
      'Date',
    ];
    const rows = history.map((r) =>
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
