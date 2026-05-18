export interface RideHistory {
  distance: number;
  mileage: number;
  petrolPrice: number;
  totalCost: number;
  unit: string;
  currency: string;
  date: string;
  label?: string;
  fuelType?: FuelType;
  isRoundTrip?: boolean;
  costPerUnit?: number;
}

export type FuelType = 'petrol' | 'diesel' | 'cng' | 'electric';
