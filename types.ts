
export enum TransportMode {
  BICYCLE = 'Bicicleta',
  CAR = 'Carro',
  BUS = 'Ônibus',
  VAN = 'Caminhão/Van',
  PLANE = 'Avião'
}

export interface EmissionFactor {
  mode: TransportMode;
  kgCo2PerKm: number;
  icon: string;
}

export interface CalculationResult {
  distance: number;
  totalCo2: number;
  carbonCredits: number;
  cost: number;
  comparisons: {
    mode: TransportMode;
    emission: number;
    percentageDiff: number;
  }[];
}
