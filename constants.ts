
import { TransportMode, EmissionFactor } from './types';

export const EMISSION_FACTORS: EmissionFactor[] = [
  { mode: TransportMode.BICYCLE, kgCo2PerKm: 0, icon: '🚲' },
  { mode: TransportMode.CAR, kgCo2PerKm: 0.12, icon: '🚗' },
  { mode: TransportMode.BUS, kgCo2PerKm: 0.03, icon: '🚌' },
  { mode: TransportMode.VAN, kgCo2PerKm: 0.20, icon: '🚚' },
  { mode: TransportMode.PLANE, kgCo2PerKm: 0.25, icon: '✈️' },
];

export const CARBON_CREDIT_PRICE_PER_TON = 100.00; // R$ per 1000kg
