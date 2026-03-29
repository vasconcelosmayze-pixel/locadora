export interface Customer {
  name: string;
  rg: string;
  cpf: string;
  phone: string;
  address: string;
  photo?: string;
  rgPhoto?: string;
  obs?: string;
  createdAt?: string;
}

export interface Rental {
  id: string;
  customerName: string;
  motoModel: string;
  value: number;
  date: string;
  startTime: string;
  endTime: string;
  type: 'entry' | 'renewal';
  period: RentalPeriod;
}

export type MotoModel = 'biz-old' | 'biz-new' | 'pop-new' | 'fan-2020';
export type RentalPeriod = '18h' | '24h';

export const RENTAL_PERIOD_LABELS: Record<RentalPeriod, string> = {
  '18h': 'Manhã até as 18h',
  '24h': '24 Horas',
};

export const MOTO_PRICES: Record<MotoModel, number> = {
  'biz-old': 35,
  'biz-new': 40,
  'pop-new': 50,
  'fan-2020': 80,
};

export const MOTO_NAMES: Record<MotoModel, string> = {
  'biz-old': 'Biz Modelo Antigo',
  'biz-new': 'Biz Modelo Novo',
  'pop-new': 'Pop Modelo Novo',
  'fan-2020': 'Fan Modelo 2020',
};
