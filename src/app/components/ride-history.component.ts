import { Component, input, output, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RideHistory } from '../models/ride-history.model';

@Component({
  selector: 'app-ride-history',
  imports: [FormsModule],
  template: `
    <div class="mt-8">
      <div class="flex justify-between items-center mb-3">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">📜 Ride History</h2>
        <div class="flex gap-3 text-sm">
          <button (click)="exportToCSV()" class="text-blue-600 dark:text-blue-400 hover:underline">Export CSV</button>
          <button (click)="clearHistory.emit()" class="text-red-600 dark:text-red-400 hover:underline">Clear</button>
        </div>
      </div>

      <!-- Search & Filter -->
      <div class="mb-3 space-y-2">
        <input [(ngModel)]="searchQuery" name="histSearch" placeholder="🔍 Search by label, date, or currency..."
          class="w-full text-sm p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
        <div class="flex gap-2">
          <select [(ngModel)]="filterCurrency" name="filterCurrency"
            class="flex-1 text-xs p-1.5 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
            <option value="">All Currencies</option>
            <option value="₹">₹ INR</option>
            <option value="$">$ USD</option>
            <option value="€">€ EUR</option>
            <option value="£">£ GBP</option>
          </select>
          <select [(ngModel)]="sortBy" name="sortBy"
            class="flex-1 text-xs p-1.5 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="cost-desc">Highest Cost</option>
            <option value="cost-asc">Lowest Cost</option>
          </select>
        </div>
      </div>

      <ul class="max-h-72 overflow-y-auto space-y-2">
        @for (ride of filteredHistory(); track $index) {
          <li class="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 text-sm border dark:border-gray-600">
            <div class="flex justify-between items-start">
              <div class="flex-1 text-gray-900 dark:text-gray-100">
                @if (ride.label) {
                  <span class="inline-block text-xs px-2 py-0.5 mb-1 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
                    {{ ride.label }}
                  </span>
                }
                @if (ride.isRoundTrip) {
                  <span class="inline-block text-xs px-2 py-0.5 mb-1 ml-1 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                    ↩ Round Trip
                  </span>
                }
                <p><strong>{{ ride.distance }} {{ ride.unit }}</strong> &#64; {{ ride.mileage }} {{ ride.fuelType === 'electric' ? 'km/kWh' : 'km/l' }}</p>
                <p>{{ ride.currency }}{{ ride.totalCost.toFixed(2) }}
                  @if (ride.costPerUnit) {
                    <span class="text-xs text-gray-500 dark:text-gray-400"> ({{ ride.currency }}{{ ride.costPerUnit.toFixed(2) }}/{{ ride.unit }})</span>
                  }
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ ride.date }}</p>
              </div>
              <div class="flex flex-col gap-1 ml-2">
                <button (click)="shareRide(ride)" class="text-green-600 dark:text-green-400 text-xs hover:underline" title="Share">🔗 Share</button>
                <button (click)="printRide(ride)" class="text-indigo-600 dark:text-indigo-400 text-xs hover:underline" title="Print">🖨️ Print</button>
              </div>
            </div>
          </li>
        } @empty {
          <li class="text-center py-6 text-gray-400 dark:text-gray-500 text-sm">No rides match your filter.</li>
        }
      </ul>
    </div>
  `,
})
export class RideHistoryComponent {
  rideHistory = input.required<RideHistory[]>();
  clearHistory = output<void>();

  searchQuery = '';
  filterCurrency = '';
  sortBy = 'date-desc';

  filteredHistory = computed(() => {
    let list = [...this.rideHistory()];

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(r =>
        r.label?.toLowerCase().includes(q) ||
        r.date.toLowerCase().includes(q) ||
        r.currency.toLowerCase().includes(q)
      );
    }

    if (this.filterCurrency) {
      list = list.filter(r => r.currency === this.filterCurrency);
    }

    switch (this.sortBy) {
      case 'date-asc': list = list.reverse(); break;
      case 'cost-desc': list = list.sort((a, b) => b.totalCost - a.totalCost); break;
      case 'cost-asc': list = list.sort((a, b) => a.totalCost - b.totalCost); break;
    }

    return list;
  });

  exportToCSV() {
    const history = this.rideHistory();
    if (history.length === 0) return;

    const headers = ['Label', 'Distance', 'Unit', 'Mileage', 'Fuel Type', 'Petrol Price', 'Total Cost', 'Cost/Unit', 'Currency', 'Round Trip', 'Date'];
    const rows = history.map(r =>
      [
        r.label ?? '',
        r.distance,
        r.unit,
        r.mileage,
        r.fuelType ?? 'petrol',
        r.petrolPrice,
        r.totalCost.toFixed(2),
        r.costPerUnit?.toFixed(2) ?? '',
        r.currency,
        r.isRoundTrip ? 'Yes' : 'No',
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

  async shareRide(ride: RideHistory) {
    const text = `🚗 Ride Cost Summary\n📏 Distance: ${ride.distance} ${ride.unit}${ride.isRoundTrip ? ' (Round Trip)' : ''}\n⛽ Mileage: ${ride.mileage} km/l\n💰 Total Cost: ${ride.currency}${ride.totalCost.toFixed(2)}\n📅 Date: ${ride.date}\n\nCalculated with Ride Cost Calculator App`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Ride Cost', text });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(text);
      alert('Ride summary copied to clipboard!');
    }
  }

  printRide(ride: RideHistory) {
    const printWindow = window.open('', '_blank', 'width=600,height=500');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Ride Receipt</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #1f2937; }
            h2 { color: #4f46e5; margin-bottom: 16px; }
            .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 12px; background: #ede9fe; color: #6d28d9; margin-bottom: 12px; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; }
            td { padding: 8px 4px; border-bottom: 1px solid #e5e7eb; }
            td:last-child { text-align: right; font-weight: 600; }
            .total { font-size: 18px; color: #16a34a; }
            footer { margin-top: 20px; text-align: center; font-size: 12px; color: #9ca3af; }
          </style>
        </head>
        <body>
          <h2>🚗 Ride Receipt</h2>
          ${ride.label ? `<span class="badge">${ride.label}</span>` : ''}
          ${ride.isRoundTrip ? `<span class="badge">↩ Round Trip</span>` : ''}
          <table>
            <tr><td>Date</td><td>${ride.date}</td></tr>
            <tr><td>Distance</td><td>${ride.distance} ${ride.unit}</td></tr>
            <tr><td>Fuel Type</td><td>${ride.fuelType ?? 'Petrol'}</td></tr>
            <tr><td>Mileage</td><td>${ride.mileage} km/l</td></tr>
            <tr><td>Fuel Price</td><td>${ride.currency}${ride.petrolPrice}/l</td></tr>
            ${ride.costPerUnit ? `<tr><td>Cost per ${ride.unit}</td><td>${ride.currency}${ride.costPerUnit.toFixed(2)}</td></tr>` : ''}
            <tr><td class="total">Total Cost</td><td class="total">${ride.currency}${ride.totalCost.toFixed(2)}</td></tr>
          </table>
          <footer>Thank you for using Ride Cost Calculator!</footer>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }
}
