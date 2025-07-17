import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { BlService } from './bl.service';
import { Bl, BlStatus } from './bl.model';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-bl-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './bl-list.component.html',
  styleUrls: ['./bl-list.component.css']
})
export class BlListComponent implements OnInit, AfterViewInit {
  bls: Bl[] = [];
  loading = true;
  error = false;
  statusFilter: BlStatus | null = null;

  constructor(
    private blService: BlService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('BlListComponent: Initializing');
    this.loadBls();
  }

  ngAfterViewInit(): void {
    console.log('BlListComponent: DOM rendered', {
      table: document.querySelector('.bl-table'),
      tableStyles: getComputedStyle(document.querySelector('.bl-table') || new Element())
    });
  }

  loadBls(): void {
    this.loading = true;
    this.error = false;
    console.log('BlListComponent: Loading BLs with statusFilter', this.statusFilter);

    if (!this.authService.getAccessToken()) {
      console.error('BlListComponent: No authentication token found');
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    this.blService.getBLs(this.statusFilter || undefined).subscribe({
      next: (data) => {
        this.bls = data;
        this.loading = false;
        console.log('BlListComponent: BLs loaded', this.bls);
      },
      error: (err) => {
        console.error('BlListComponent: Error loading BLs', err);
        this.error = true;
        this.loading = false;
        if (err.message && err.message.includes('401')) {
          this.authService.logout();
          this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
        }
      }
    });
  }

  filterByStatus(status: BlStatus | null): void {
    this.statusFilter = status;
    console.log('BlListComponent: Filtering by status', status);
    this.loadBls();
  }

  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'en_attente': 'En Attente',
      'en_cours': 'En Cours',
      'termine': 'Terminé',
      'annule': 'Annulé'
    };
    return statusMap[status] || status;
  }
}
