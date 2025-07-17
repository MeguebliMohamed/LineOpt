export interface Article {
  id: string;
  nom: string;
}

export interface Client {
  id: string;
  nom: string;
}

export interface Camion {
  id: string;
  matricule: string;
}

export type BlStatus = 'en_attente' | 'en_cours' | 'termine' | 'annule';

export interface Bl {
  id_bl: string;
  article: Article;
  client: Client;
  camion?: Camion;
  quantite: number;
  statut: BlStatus;
  date_bl: string;
}