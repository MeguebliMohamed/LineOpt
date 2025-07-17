import { CdkTableDataSourceInput } from '@angular/cdk/table';
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TrucksService } from './trucks.service';
import { Truck, TRUCK_STATUS_LABELS, TruckStatus } from './truck.interface';

@Component({
  selector: 'app-trucks-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './trucks-list.component.html',
  styleUrls: ['./trucks-list.component.css']
})
export class TrucksListComponent implements OnInit {
  trucks: Truck[] = [];
  filteredTrucks: Truck[] = [];
  dataSource = new MatTableDataSource<Truck>([]);
  displayedColumns: string[] = ['matricule', 'statut', 'client_par_defaut', 'articles', 'actions'];
  loading = false;
  error = '';
  statusLabels = TRUCK_STATUS_LABELS;
  selectedStatus: TruckStatus | '' = '';
  clientFilter: string = '';
  itemsPerPage: number = 10;
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

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private trucksService: TrucksService) {}

  ngOnInit(): void {
    this.loadTrucks();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
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
    this.dataSource.data = this.filteredTrucks;
    if (this.paginator) {
      this.paginator.length = this.filteredTrucks.length;
      this.paginator.firstPage();
    }
  }

  clearFilters(): void {
    this.selectedStatus = '';
    this.clientFilter = '';
    this.applyFilters();
  }

  sortData(sort: Sort): void {
    const data = [...this.filteredTrucks];
    if (!sort.active || sort.direction === '') {
      this.filteredTrucks = data;
      return;
    }

    this.filteredTrucks = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'matricule':
          return compare(a.matricule, b.matricule, isAsc);
        case 'statut':
          return compare(a.statut, b.statut, isAsc);
        case 'client_par_defaut':
          return compare(a.client_par_defaut ?? '', b.client_par_defaut ?? '', isAsc);
        case 'articles':
          return compare(a.articles.length, b.articles.length, isAsc);
        default:
          return 0;
      }
    });
    this.dataSource.data = this.filteredTrucks;
  }

  onPageChange(event: PageEvent): void {
    this.itemsPerPage = event.pageSize;
    this.dataSource.data = this.filteredTrucks;
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
}

function compare(a: string | number, b: string | number, isAsc: boolean): number {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
