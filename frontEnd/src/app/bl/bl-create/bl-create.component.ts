import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { BlService } from '../bl.service';
import { Article, BlStatus, Camion, Client } from '../bl.model';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-bl-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './bl-create.component.html',
  styleUrls: ['./bl-create.component.css']
})
export class BlCreateComponent implements OnInit, AfterViewInit {
  blForm: FormGroup;
  articles: Article[] = [];
  clients: Client[] = [];
  camions: Camion[] = [];
  error = '';
  saving = false;

  constructor(
    private fb: FormBuilder,
    private blService: BlService,
    protected router: Router,
    private authService: AuthService
  ) {
    this.blForm = this.fb.group({
      id_bl: ['', [Validators.required, Validators.maxLength(50)]],
      article: [null, Validators.required],
      client: [null, Validators.required],
      camion: [null],
      quantite: ['', [Validators.required, Validators.min(0)]],
      statut: ['en_attente', Validators.required]
    });
    console.log('BlCreateComponent: Form initialized', this.blForm.value);
  }

  ngOnInit(): void {
    if (!this.authService.getAccessToken()) {
      console.error('BlCreateComponent: No authentication token found');
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    this.loadDropdownData();
    this.blForm.statusChanges.subscribe(status => {
      console.log('BlCreateComponent: Form status changed', {
        status,
        formValues: this.blForm.value,
        errors: this.blForm.errors
      });
    });
  }

  ngAfterViewInit(): void {
    console.log('BlCreateComponent: DOM rendered', {
      idBlInput: document.querySelector('input[name="id_bl"]'),
      idBlInputStyles: getComputedStyle(document.querySelector('input[name="id_bl"]') || new Element())
    });
  }

  loadDropdownData(): void {
    this.blService.getArticles().subscribe({
      next: (data) => {
        this.articles = data;
        console.log('BlCreateComponent: Articles loaded', this.articles);
      },
      error: (err) => {
        console.error('BlCreateComponent: Error loading articles', err);
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
        console.log('BlCreateComponent: Clients loaded', this.clients);
      },
      error: (err) => {
        console.error('BlCreateComponent: Error loading clients', err);
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
        console.log('BlCreateComponent: Camions loaded', this.camions);
      },
      error: (err) => {
        console.error('BlCreateComponent: Error loading camions', err);
        this.error = 'Échec du chargement des camions';
        if (err.message && err.message.includes('401')) {
          this.authService.logout();
          this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
        }
      }
    });
  }

  onSubmit(): void {
    console.log('BlCreateComponent: onSubmit called', {
      formValid: this.blForm.valid,
      formValues: this.blForm.value,
      errors: this.blForm.errors
    });

    if (this.blForm.invalid) {
      this.blForm.markAllAsTouched();
      console.log('BlCreateComponent: Form invalid, errors:', this.blForm.errors);
      return;
    }

    if (!this.authService.getAccessToken()) {
      console.error('BlCreateComponent: No authentication token found');
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    this.saving = true;
    this.error = '';

    this.blService.createBl(this.blForm.value).subscribe({
      next: () => {
        console.log('BlCreateComponent: BL created successfully');
        this.saving = false;
        this.router.navigate(['/bl']);
      },
      error: (err) => {
        this.error = err.message || 'Échec de la création du bon de livraison';
        this.saving = false;
        console.error('BlCreateComponent: Error creating BL', err);
        if (err.message && err.message.includes('401')) {
          this.authService.logout();
          this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
        }
      }
    });
  }
}
