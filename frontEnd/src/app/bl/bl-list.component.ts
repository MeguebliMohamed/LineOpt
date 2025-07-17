import { Component, OnInit } from '@angular/core';
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
export class BlListComponent implements OnInit {
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
    this.loadBls();
  }

  loadBls(): void {
    this.loading = true;
    this.error = false;
    
    if (!this.authService.getAccessToken()) {
      console.error('No authentication token found');
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    
    this.blService.getBLs(this.statusFilter || undefined).subscribe({
      next: (data) => {
        this.bls = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading BLs:', err);
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
    this.loadBls();
  }

  getStatusLabel(status: string): string {
    const statusMap: {[key: string]: string} = {
      'en_attente': 'En Attente',
      'en_cours': 'En Cours',
      'termine': 'Terminé',
      'annule': 'Annulé'
    };
    return statusMap[status] || status;
  }
}
