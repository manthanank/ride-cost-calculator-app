export interface VehiclePreset {
  id: string;
  name: string;
  mileage: number;
  fuelType: 'petrol' | 'diesel' | 'cng' | 'electric';
}
