import { Component, input, output, signal } from '@angular/core';
import { RideHistory } from '../models/ride-history.model';

@Component({
  selector: 'app-ride-history',
  standalone: true,
  template: `
    <div class="mt-8">
      <div class="flex justify-between items-center mb-2">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">📜 Ride History</h2>
        <div class="flex gap-3 text-sm">
          <button (click)="exportToCSV()" class="text-blue-600 dark:text-blue-400 hover:underline">Export CSV</button>
          <button (click)="clearHistory.emit()" class="text-red-600 dark:text-red-400 hover:underline">Clear</button>
        </div>
      </div>
      <ul class="max-h-60 overflow-y-auto space-y-2">
        @for (ride of rideHistory(); track $index) {
        <li class="bg-gray-100 dark:bg-gray-700 rounded-md p-2 text-sm flex justify-between items-start">
          <div class="flex justify-between items-start">
            <div class="text-gray-900 dark:text-gray-100">
              <p><strong>{{ ride.distance }} {{ ride.unit }}</strong> &#64; {{ ride.mileage }} km/l</p>
              <p>{{ ride.currency }}{{ ride.totalCost.toFixed(2) }} on {{ ride.date }}</p>
            </div>
            <button (click)="printRide(ride)" class="text-indigo-600 dark:text-indigo-400 text-sm hover:underline ml-2">🖨️ Print</button>
          </div>
        </li>
        }
      </ul>
    </div>
  `,
  styles: []
})
export class RideHistoryComponent {
  rideHistory = input.required<RideHistory[]>();
  clearHistory = output<void>();

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
