import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { httpResource } from '@angular/common/http';
import { Visit } from './models/visit.model';
import { RideHistory, FuelType } from './models/ride-history.model';
import { environment } from '../environments/environment.development';
import { RideHistoryComponent } from './components/ride-history.component';
import { VisitorCountComponent } from './components/visitor-count.component';
import { CostBreakdownComponent } from './components/cost-breakdown.component';
import { VehiclePresetsComponent } from './components/vehicle-presets.component';
import { HistoryStatsComponent } from './components/history-stats.component';
import { MonthlyEstimatorComponent } from './components/monthly-estimator.component';
import { ComparisonModeComponent } from './components/comparison-mode.component';
import { MultiStopComponent } from './components/multi-stop.component';
import { RideCostChartComponent } from './components/ride-cost-chart.component';
import { ThemeService } from './services/theme.service';

type Currency = '₹' | '$' | '€' | '£' | '¥' | 'A$' | 'C$';

@Component({
  selector: 'app-root',
  imports: [
    FormsModule,
    RideHistoryComponent,
    VisitorCountComponent,
    CostBreakdownComponent,
    VehiclePresetsComponent,
    HistoryStatsComponent,
    MonthlyEstimatorComponent,
    ComparisonModeComponent,
    MultiStopComponent,
    RideCostChartComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected title = 'ride-cost-calculator-app';

  private apiURL = environment.trackingApiUrl;
  private themeService = inject(ThemeService);

  // Core inputs
  distanceKm = signal<number | null>(null);
  mileage = signal<number | null>(null);
  petrolPrice = signal<number | null>(null);
  totalCost = signal<number | null>(null);

  // New feature signals
  unit = signal<'km' | 'mi'>('km');
  currency = signal<Currency>('₹');
  fuelType = signal<FuelType>('petrol');
  isRoundTrip = signal(false);
  rideLabel = signal('');

  // Ride history
  rideHistory = signal<RideHistory[]>([]);

  // Theme
  isDarkMode = this.themeService.isDarkMode;

  // Visitor tracking
  projectName = signal<string>('');

  visitResource = httpResource<Visit>(() => ({
    url: this.apiURL,
    method: 'POST',
    body: { projectName: this.projectName() }
  }));

  visitorCount = computed(() => this.visitResource.value()?.uniqueVisitors ?? 0);
  isVisitorCountLoading = computed(() => this.visitResource.isLoading());
  visitorCountError = computed(() => {
    const error = this.visitResource.error();
    return error ? error.message : null;
  });

  // Computed cost per unit of distance
  costPerUnit = computed(() => {
    const cost = this.totalCost();
    const dist = this.distanceKm();
    if (!cost || !dist) return null;
    return cost / dist;
  });

  readonly fuelLabels: Record<FuelType, string> = {
    petrol: '⛽ Petrol',
    diesel: '🛢️ Diesel',
    cng: '💨 CNG',
    electric: '⚡ Electric',
  };

  getFuelLabel(ft: string): string {
    return this.fuelLabels[ft as FuelType] ?? ft;
  }

  readonly currencies: { value: Currency; label: string }[] = [
    { value: '₹', label: '₹ INR' },
    { value: '$', label: '$ USD' },
    { value: '€', label: '€ EUR' },
    { value: '£', label: '£ GBP' },
    { value: '¥', label: '¥ JPY' },
    { value: 'A$', label: 'A$ AUD' },
    { value: 'C$', label: 'C$ CAD' },
  ];

  constructor() {
    this.loadHistory();
  }

  ngOnInit() {
    this.projectName.set(this.title);
  }

  convertDistanceToKm(): number {
    const dist = this.distanceKm()!;
    return this.unit() === 'km' ? dist : dist * 1.60934;
  }

  getEffectiveDistance(): number {
    const dist = this.distanceKm()!;
    return this.isRoundTrip() ? dist * 2 : dist;
  }

  calculateCost() {
    const dist = this.getEffectiveDistance();
    if (dist && this.mileage() && this.petrolPrice()) {
      const distInKm = this.unit() === 'km' ? dist : dist * 1.60934;
      const litersUsed = distInKm / this.mileage()!;
      const cost = litersUsed * this.petrolPrice()!;
      this.totalCost.set(cost);
      this.saveToHistory(dist, cost);
    }
  }

  onPresetSelected(preset: { mileage: number; fuelType: FuelType }) {
    this.mileage.set(preset.mileage);
    this.fuelType.set(preset.fuelType);
  }

  onMultiStopDistance(dist: number) {
    this.distanceKm.set(dist);
  }

  saveToHistory(distance: number, totalCost: number) {
    const costPerUnit = distance > 0 ? totalCost / distance : undefined;
    const record: RideHistory = {
      distance,
      mileage: this.mileage()!,
      petrolPrice: this.petrolPrice()!,
      totalCost,
      unit: this.unit(),
      currency: this.currency(),
      date: new Date().toLocaleString(),
      label: this.rideLabel() || undefined,
      fuelType: this.fuelType(),
      isRoundTrip: this.isRoundTrip(),
      costPerUnit,
    };

    const currentHistory = this.rideHistory();
    const newHistory = [record, ...currentHistory];
    this.rideHistory.set(newHistory);
    localStorage.setItem('rideHistory', JSON.stringify(newHistory));
  }

  loadHistory() {
    const saved = localStorage.getItem('rideHistory');
    if (saved) {
      this.rideHistory.set(JSON.parse(saved));
    }
  }

  retryLoadHistory() {
    this.loadHistory();
  }

  resetForm() {
    this.distanceKm.set(null);
    this.mileage.set(null);
    this.petrolPrice.set(null);
    this.totalCost.set(null);
    this.rideLabel.set('');
    this.isRoundTrip.set(false);
  }

  clearHistory() {
    localStorage.removeItem('rideHistory');
    this.rideHistory.set([]);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
