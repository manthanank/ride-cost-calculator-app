import { Component, input } from '@angular/core';

@Component({
  selector: 'app-cost-breakdown',
  standalone: true,
  template: `
    <div class="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
      <h3 class="text-lg font-semibold text-indigo-800 dark:text-indigo-200 mb-3">💰 Cost Breakdown</h3>
      <div class="space-y-2 text-sm text-gray-900 dark:text-gray-100">
        <div class="flex justify-between">
          <span>Distance:</span>
          <span>{{ distance() }} {{ unit() }}</span>
        </div>
        <div class="flex justify-between">
          <span>Distance in km:</span>
          <span>{{ distanceInKm().toFixed(2) }} km</span>
        </div>
        <div class="flex justify-between">
          <span>Fuel consumption:</span>
          <span>{{ fuelConsumption().toFixed(2) }} liters</span>
        </div>
        <div class="flex justify-between">
          <span>Fuel cost:</span>
          <span>{{ currency() }}{{ fuelCost().toFixed(2) }}</span>
        </div>
        <hr class="border-indigo-200 dark:border-indigo-700">
        <div class="flex justify-between font-semibold text-indigo-800 dark:text-indigo-200">
          <span>Total Cost:</span>
          <span>{{ currency() }}{{ totalCost().toFixed(2) }}</span>
        </div>
      </div>

      <div class="mt-3 p-2 bg-white dark:bg-gray-700 rounded border dark:border-gray-600">
        <p class="text-xs text-gray-600 dark:text-gray-300">
          💡 <strong>Tip:</strong>
          @if (mileage() > 15) {
            Great mileage! Your vehicle is fuel efficient.
          } @else if (mileage() > 10) {
            Consider carpooling or using public transport for long trips.
          } @else {
            Consider maintenance or driving habits to improve fuel efficiency.
          }
        </p>
      </div>
    </div>
  `,
  styles: []
})
export class CostBreakdownComponent {
  distance = input.required<number>();
  unit = input.required<'km' | 'mi'>();
  mileage = input.required<number>();
  petrolPrice = input.required<number>();
  totalCost = input.required<number>();
  currency = input.required<'₹' | '$' | '€'>();

  distanceInKm() {
    return this.unit() === 'km' ? this.distance() : this.distance() * 1.60934;
  }

  fuelConsumption() {
    return this.distanceInKm() / this.mileage();
  }

  fuelCost() {
    return this.fuelConsumption() * this.petrolPrice();
  }
}
