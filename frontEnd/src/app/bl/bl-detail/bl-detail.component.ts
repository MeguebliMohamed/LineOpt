import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BlService } from '../bl.service';
import { Bl, BlStatus } from '../bl.model';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-bl-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './bl-detail.component.html',
  styleUrls: ['./bl-detail.component.css']
})
export class BlDetailComponent implements OnInit {
  bl: Bl | null = null;
  loading = true;
  error = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private blService: BlService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (!this.authService.getAccessToken()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadBl(id);
    } else {
      this.error = true;
      this.loading = false;
    }
  }

  loadBl(id: string): void {
    this.blService.getBl(id).subscribe({
      next: (data) => {
        this.bl = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading BL:', err);
        this.error = true;
        this.loading = false;
        
        if (err.message && err.message.includes('401')) {
          this.authService.logout();
          this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
        }
      }
    });
  }

  getStatusLabel(status: BlStatus): string {
    const statusMap: {[key: string]: string} = {
      'en_attente': 'En Attente',
      'en_cours': 'En Cours',
      'termine': 'Terminé',
      'annule': 'Annulé'
    };
    return statusMap[status] || status;
  }

  onDelete(): void {
    if (!this.authService.getAccessToken()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    
    if (confirm('Êtes-vous sûr de vouloir supprimer ce bon de livraison?')) {
      this.blService.deleteBl(this.bl!.id_bl).subscribe({
        next: () => {
          this.router.navigate(['/bl']);
        },
        error: (err) => {
          console.error('Error deleting BL:', err);
          
          if (err.message && err.message.includes('401')) {
            this.authService.logout();
            this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
          }
        }
      });
    }
  }
}