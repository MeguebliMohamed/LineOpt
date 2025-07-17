import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BlService } from '../bl.service';
import { Article, Bl, BlStatus, Camion, Client } from '../bl.model';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-bl-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './bl-detail.component.html',
  styleUrls: ['./bl-detail.component.css']
})
export class BlDetailComponent implements OnInit, AfterViewInit {
  bl: Bl | null = null;
  blForm: FormGroup;
  articles: Article[] = [];
  clients: Client[] = [];
  camions: Camion[] = [];
  loading = true;
  error = '';
  isEditing = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private blService: BlService,
    private authService: AuthService
  ) {
    this.blForm = this.fb.group({
      id_bl: [{ value: '', disabled: true }],
      article: [null, Validators.required],
      client: [null, Validators.required],
      camion: [null],
      quantite: ['', [Validators.required, Validators.min(0)]],
      statut: ['en_attente', Validators.required]
    });
    console.log('BlDetailComponent: Form initialized', this.blForm.value);
  }

  ngOnInit(): void {
    if (!this.authService.getAccessToken()) {
      console.error('BlDetailComponent: No authentication token found');
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadBl(id);
      this.loadDropdownData();
    } else {
      this.error = 'ID du bon de livraison manquant';
      this.loading = false;
    }

    this.blForm.statusChanges.subscribe(status => {
      console.log('BlDetailComponent: Form status changed', {
        status,
        formValues: this.blForm.value,
        errors: this.blForm.errors
      });
    });
  }

  ngAfterViewInit(): void {
    console.log('BlDetailComponent: DOM rendered', {
      container: document.querySelector('.bl-detail-container'),
      containerStyles: getComputedStyle(document.querySelector('.bl-detail-container') || new Element())
    });
  }

  loadBl(id: string): void {
    this.blService.getBl(id).subscribe({
      next: (data) => {
        this.bl = data;
        this.blForm.patchValue({
          id_bl: data.id_bl,
          article: this.articles.find(a => a.id === data.article.id) || data.article,
          client: this.clients.find(c => c.id === data.client.id) || data.client,
          camion: data.camion ? this.camions.find(c => c.id === data.camion!.id) || data.camion : null,
          quantite: data.quantite,
          statut: data.statut
        });
        this.loading = false;
        console.log('BlDetailComponent: BL loaded', this.bl);
      },
      error: (err) => {
        console.error('BlDetailComponent: Error loading BL', err);
        this.error = 'Échec du chargement des détails du bon de livraison';
        this.loading = false;
        if (err.message && err.message.includes('401')) {
          this.authService.logout();
          this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
        }
      }
    });
  }

  loadDropdownData(): void {
    this.blService.getArticles().subscribe({
      next: (data) => {
        this.articles = data;
        console.log('BlDetailComponent: Articles loaded', this.articles);
        if (this.bl) {
          this.blForm.patchValue({
            article: this.articles.find(a => a.id === this.bl!.article.id) || this.bl!.article
          });
        }
      },
      error: (err) => {
        console.error('BlDetailComponent: Error loading articles', err);
        this.error = 'Échec du chargement des articles';
        if (err.message && err.message.includes('401')) {
          this.authService.logout();
          this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
        }
      }
    });

    this.blService.getClients().subscribe({
      next: (data) => {
        this.clients = data;
        console.log('BlDetailComponent: Clients loaded', this.clients);
        if (this.bl) {
          this.blForm.patchValue({
            client: this.clients.find(c => c.id === this.bl!.client.id) || this.bl!.client
          });
        }
      },
      error: (err) => {
        console.error('BlDetailComponent: Error loading clients', err);
        this.error = 'Échec du chargement des clients';
        if (err.message && err.message.includes('401')) {
          this.authService.logout();
          this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
        }
      }
    });

    this.blService.getCamions().subscribe({
      next: (data) => {
        this.camions = data;
        console.log('BlDetailComponent: Camions loaded', this.camions);
        if (this.bl && this.bl.camion) {
          this.blForm.patchValue({
            camion: this.camions.find(c => c.id === this.bl!.camion!.id) || this.bl!.camion
          });
        }
      },
      error: (err) => {
        console.error('BlDetailComponent: Error loading camions', err);
        this.error = 'Échec du chargement des camions';
        if (err.message && err.message.includes('401')) {
          this.authService.logout();
          this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
        }
      }
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    console.log('BlDetailComponent: Toggled edit mode', { isEditing: this.isEditing });
    if (!this.isEditing) {
      this.blForm.reset({
        id_bl: this.bl?.id_bl,
        article: this.articles.find(a => a.id === this.bl?.article.id) || this.bl?.article,
        client: this.clients.find(c => c.id === this.bl?.client.id) || this.bl?.client,
        camion: this.bl?.camion ? this.camions.find(c => c.id === this.bl?.camion!.id) || this.bl?.camion : null,
        quantite: this.bl?.quantite,
        statut: this.bl?.statut
      });
    }
  }

  onSubmit(): void {
    console.log('BlDetailComponent: onSubmit called', {
      formValid: this.blForm.valid,
      formValues: this.blForm.value,
      errors: this.blForm.errors
    });

    if (this.blForm.invalid) {
      this.blForm.markAllAsTouched();
      console.log('BlDetailComponent: Form invalid, errors:', this.blForm.errors);
      return;
    }

    if (!this.authService.getAccessToken()) {
      console.error('BlDetailComponent: No authentication token found');
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
    }

    const formData = {
      ...this.blForm.getRawValue(),
      id_bl: this.bl!.id_bl
    };

    this.blService.updateBl(this.bl!.id_bl.toString(), formData).subscribe({
      next: (data) => {
        console.log('BlDetailComponent: BL updated successfully', data);
        this.bl = data;
        this.isEditing = false;
        this.loadBl(this.bl!.id_bl.toString());
      },
      error: (err) => {
        console.error('BlDetailComponent: Error updating BL', err);
        this.error = 'Échec de la mise à jour du bon de livraison';
        if (err.message && err.message.includes('401')) {
          this.authService.logout();
          this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
        }
      }
    });
  }

  onDelete(): void {
    if (!this.authService.getAccessToken()) {
      console.error('BlDetailComponent: No authentication token found');
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    if (confirm('Êtes-vous sûr de vouloir supprimer ce bon de livraison ?')) {
      this.blService.deleteBl(this.bl!.id_bl).subscribe({
        next: () => {
          console.log('BlDetailComponent: BL deleted successfully');
          this.router.navigate(['/bl']);
        },
        error: (err) => {
          console.error('BlDetailComponent: Error deleting BL', err);
          this.error = 'Échec de la suppression du bon de livraison';
          if (err.message && err.message.includes('401')) {
            this.authService.logout();
            this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
          }
        }
      });
    }
  }

  getStatusLabel(status: BlStatus): string {
    const statusMap: { [key: string]: string } = {
      'en_attente': 'En Attente',
      'en_cours': 'En Cours',
      'termine': 'Terminé',
      'annule': 'Annulé'
    };
    return statusMap[status] || status;
  }
}
