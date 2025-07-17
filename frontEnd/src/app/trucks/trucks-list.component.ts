
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TrucksService } from './trucks.service';
import { Truck, TRUCK_STATUS_LABELS, TruckStatus } from './truck.interface';

@Component({
  selector: 'app-trucks-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './trucks-list.component.html',
  styleUrls: ['./trucks-list.component.css']
})
export class TrucksListComponent implements OnInit {
  trucks: Truck[] = [];
  filteredTrucks: Truck[] = [];
  loading = false;
  error = '';
  statusLabels = TRUCK_STATUS_LABELS;
  selectedStatus: TruckStatus | '' = '';
  clientFilter: string = '';
  itemsPerPage: number = 10;
  pageIndex: number = 0;
  filtersVisible: boolean = true;

  statusOptions: { value: TruckStatus; label: string }[] = [
    { value: 'disponible', label: TRUCK_STATUS_LABELS['disponible'] },
    { value: 'en_attente', label: TRUCK_STATUS_LABELS['en_attente'] },
    { value: 'en_pause', label: TRUCK_STATUS_LABELS['en_pause'] },
    { value: 'en_panne', label: TRUCK_STATUS_LABELS['en_panne'] },
    { value: 'en_entretien', label: TRUCK_STATUS_LABELS['en_entretien'] },
    { value: 'charge', label: TRUCK_STATUS_LABELS['charge'] },
    { value: 'sorti', label: TRUCK_STATUS_LABELS['sorti'] }
  ];

  constructor(private trucksService: TrucksService) {}

  ngOnInit(): void {
    this.loadTrucks();
  }

  loadTrucks(): void {
    this.loading = true;
    this.trucksService.getTrucks().subscribe({
      next: (data) => {
        this.trucks = data;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Échec du chargement des camions';
        this.loading = false;
        console.error('Error loading trucks:', err);
      }
    });
  }

  applyFilters(): void {
    this.filteredTrucks = this.trucks.filter(truck => {
      const matchesStatus = this.selectedStatus ? truck.statut === this.selectedStatus : true;
      const clientName = truck.client_par_defaut?.toString() ?? '';
      const matchesClient = this.clientFilter
        ? clientName.toLowerCase().includes(this.clientFilter.toLowerCase())
        : true;
      return matchesStatus && matchesClient;
    });
    this.pageIndex = 0;
  }

  clearFilters(): void {
    this.selectedStatus = '';
    this.clientFilter = '';
    this.applyFilters();
  }

  onPageSizeChange(): void {
    this.pageIndex = 0;
  }

  getStatusLabel(status: TruckStatus): string {
    return this.statusLabels[status] || 'Inconnu';
  }

  getClientDisplay(clientId: number | null | undefined): string {
    return clientId !== null ? clientId!.toString() : 'Non assigné';
  }

  toggleFilters(): void {
    this.filtersVisible = !this.filtersVisible;
  }

  deleteTruck(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer ce camion ?')) {
      this.loading = true;
      this.trucksService.deleteTruck(id).subscribe({
        next: () => {
          this.trucks = this.trucks.filter(truck => truck.id !== id);
          this.applyFilters();
          this.loading = false;
        },
        error: (err) => {
          this.error = err.message || 'Échec de la suppression du camion';
          this.loading = false;
          console.error('Error deleting truck:', err);
        }
      });
    }
  }

  get paginatedTrucks(): Truck[] {
    const start = this.pageIndex * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredTrucks.slice(start, end);
  }

  get pageCount(): number {
    return Math.ceil(this.filteredTrucks.length / this.itemsPerPage);
  }

  hasNextPage(): boolean {
    return (this.pageIndex + 1) * this.itemsPerPage < this.filteredTrucks.length;
  }

  previousPage(): void {
    if (this.pageIndex > 0) {
      this.pageIndex--;
    }
  }

  nextPage(): void {
    if (this.hasNextPage()) {
      this.pageIndex++;
    }
  }

  protected readonly Number = Number;
}
