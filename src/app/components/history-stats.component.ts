import { Component, input, computed } from '@angular/core';
import { RideHistory } from '../models/ride-history.model';

@Component({
  selector: 'app-history-stats',
  template: `
    @if (rideHistory().length > 0) {
      <div class="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-700">
        <h3 class="font-semibold text-amber-800 dark:text-amber-200 text-sm mb-3 flex items-center gap-1">
          📊 Your Ride Statistics
        </h3>
        <div class="grid grid-cols-2 gap-3 text-xs">
          <div class="bg-white dark:bg-gray-800 rounded-lg p-2 text-center border dark:border-gray-700">
            <p class="text-gray-500 dark:text-gray-400">Total Rides</p>
            <p class="text-lg font-bold text-amber-700 dark:text-amber-300">{{ stats().count }}</p>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-lg p-2 text-center border dark:border-gray-700">
            <p class="text-gray-500 dark:text-gray-400">Total Distance</p>
            <p class="text-lg font-bold text-amber-700 dark:text-amber-300">{{ stats().totalDistance.toFixed(1) }} km</p>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-lg p-2 text-center border dark:border-gray-700">
            <p class="text-gray-500 dark:text-gray-400">Total Spent</p>
            <p class="text-lg font-bold text-green-700 dark:text-green-300">{{ stats().currency }}{{ stats().totalCost.toFixed(2) }}</p>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-lg p-2 text-center border dark:border-gray-700">
            <p class="text-gray-500 dark:text-gray-400">Avg. Cost/Ride</p>
            <p class="text-lg font-bold text-green-700 dark:text-green-300">{{ stats().currency }}{{ stats().avgCost.toFixed(2) }}</p>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-lg p-2 text-center border dark:border-gray-700 col-span-2">
            <p class="text-gray-500 dark:text-gray-400">Most Expensive Ride</p>
            <p class="text-lg font-bold text-red-600 dark:text-red-400">
              {{ stats().currency }}{{ stats().maxCost.toFixed(2) }}
              <span class="text-xs font-normal text-gray-500 dark:text-gray-400">on {{ stats().maxCostDate }}</span>
            </p>
          </div>
        </div>
      </div>
    }
  `,
})
export class HistoryStatsComponent {
  rideHistory = input.required<RideHistory[]>();

  stats = computed(() => {
    const history = this.rideHistory();
    if (history.length === 0) return { count: 0, totalDistance: 0, totalCost: 0, avgCost: 0, maxCost: 0, maxCostDate: '', currency: '₹' };

    const totalCost = history.reduce((s, r) => s + r.totalCost, 0);
    const totalDistance = history.reduce((s, r) => s + (r.unit === 'mi' ? r.distance * 1.60934 : r.distance), 0);
    const maxRide = history.reduce((a, b) => (b.totalCost > a.totalCost ? b : a), history[0]);

    return {
      count: history.length,
      totalDistance,
      totalCost,
      avgCost: totalCost / history.length,
      maxCost: maxRide.totalCost,
      maxCostDate: maxRide.date,
      currency: history[0].currency,
    };
  });
}
