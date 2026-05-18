import {
  Component,
  input,
  signal,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
  ElementRef,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { RideHistory } from '../models/ride-history.model';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-ride-cost-chart',
  template: `
    @if (rideHistory().length > 1) {
      <div class="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-700">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-semibold text-indigo-800 dark:text-indigo-200 text-sm">📈 Cost Over Time</h3>
          <div class="flex gap-1">
            @for (opt of chartOptions; track opt.value) {
              <button (click)="selectedLimit.set(opt.value)"
                [class]="selectedLimit() === opt.value ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-700 text-indigo-700 dark:text-indigo-300'"
                class="text-xs px-2 py-1 rounded border border-indigo-300 dark:border-indigo-600 transition-colors">
                {{ opt.label }}
              </button>
            }
          </div>
        </div>
        <div class="relative h-48">
          <canvas #chartCanvas></canvas>
        </div>
      </div>
    }
  `,
})
export class RideCostChartComponent implements OnChanges, AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  rideHistory = input.required<RideHistory[]>();

  selectedLimit = signal<number>(10);
  chartOptions = [
    { label: 'Last 5', value: 5 },
    { label: 'Last 10', value: 10 },
    { label: 'All', value: 999 },
  ];

  private chart: Chart | null = null;
  private initialized = false;

  ngAfterViewInit() {
    this.initialized = true;
    this.renderChart();
  }

  ngOnChanges(_: SimpleChanges) {
    if (this.initialized) this.renderChart();
  }

  private renderChart() {
    if (!this.chartCanvas) return;

    const history = [...this.rideHistory()]
      .reverse()
      .slice(0, this.selectedLimit());

    const labels = history.map(r => {
      const d = new Date(r.date);
      return isNaN(d.getTime()) ? r.date.slice(0, 10) : `${d.getDate()}/${d.getMonth() + 1}`;
    });
    const data = history.map(r => parseFloat(r.totalCost.toFixed(2)));
    const currency = history[0]?.currency ?? '₹';

    if (this.chart) {
      this.chart.destroy();
    }

    const isDark = document.documentElement.classList.contains('dark');
    const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
    const tickColor = isDark ? '#9ca3af' : '#6b7280';

    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: `Cost (${currency})`,
            data,
            backgroundColor: 'rgba(99,102,241,0.7)',
            borderColor: 'rgba(99,102,241,1)',
            borderWidth: 1,
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => `${currency}${(ctx.parsed.y ?? 0).toFixed(2)}`,
            },
          },
        },
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: tickColor, font: { size: 10 } } },
          y: {
            grid: { color: gridColor },
            ticks: {
              color: tickColor,
              font: { size: 10 },
              callback: v => `${currency}${v}`,
            },
          },
        },
      },
    });
  }

  ngOnDestroy() {
    this.chart?.destroy();
  }
}
