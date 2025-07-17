export interface Truck {
  id?: number;
  matricule: string;
  statut: TruckStatus;
  client_par_defaut?: number | null;
  articles: number[];
}

export type TruckStatus = 
  | 'disponible'
  | 'en_attente'
  | 'en_pause'
  | 'en_panne'
  | 'en_entretien'
  | 'charge'
  | 'sorti';

export const TRUCK_STATUS_LABELS: Record<TruckStatus, string> = {
  'disponible': 'Disponible',
  'en_attente': 'En Attente',
  'en_pause': 'En Pause',
  'en_panne': 'En Panne',
  'en_entretien': 'En Entretien',
  'charge': 'Chargé',
  'sorti': 'Sorti'
};