import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BlService } from '../bl.service';
import { Article, Bl, BlStatus, Camion, Client } from '../bl.model';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-bl-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './bl-edit.component.html',
  styleUrls: ['./bl-edit.component.css']
})
export class BlEditComponent implements OnInit {
  blForm!: FormGroup;
  articles: Article[] = [];
  clients: Client[] = [];
  camions: Camion[] = [];
  loading = true;
  error = false;
  blId: string = '';
  
  constructor(
    private fb: FormBuilder,
    private blService: BlService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (!this.authService.getAccessToken()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    
    this.initForm();
    this.loadDropdownData();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.blId = id;
      this.loadBl(id);
    } else {
      this.error = true;
      this.loading = false;
    }
  }

  initForm(): void {
    this.blForm = this.fb.group({
      id_bl: [{value: '', disabled: true}],
      article: ['', Validators.required],
      client: ['', Validators.required],
      camion: [''],
      quantite: ['', [Validators.required, Validators.min(0)]],
      statut: ['en_attente']
    });
  }

  loadDropdownData(): void {
    this.blService.getArticles().subscribe({
      next: (data) => this.articles = data,
      error: (err) => {
        console.error('Error loading articles:', err);
        if (err.message && err.message.includes('401')) {
          this.authService.logout();
          this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
        }
      }
    });
    
    this.blService.getClients().subscribe({
      next: (data) => this.clients = data,
      error: (err) => {
        console.error('Error loading clients:', err);
        if (err.message && err.message.includes('401')) {
          this.authService.logout();
          this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
        }
      }
    });
    
    this.blService.getCamions().subscribe({
      next: (data) => this.camions = data,
      error: (err) => {
        console.error('Error loading camions:', err);
        if (err.message && err.message.includes('401')) {
          this.authService.logout();
          this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
        }
      }
    });
  }

  loadBl(id: string): void {
    this.blService.getBl(id).subscribe({
      next: (data) => {
        this.blForm.patchValue({
          id_bl: data.id_bl,
          article: data.article.id,
          client: data.client.id,
          camion: data.camion ? data.camion.id : '',
          quantite: data.quantite,
          statut: data.statut
        });
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

  onSubmit(): void {
    if (this.blForm.valid) {
      if (!this.authService.getAccessToken()) {
        this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
        return;
      }
      
      const formData = {
        ...this.blForm.getRawValue(),
        id_bl: this.blId
      };
      
      this.blService.updateBl(this.blId, formData).subscribe({
        next: () => {
          this.router.navigate(['/bl', this.blId]);
        },
        error: (error) => {
          console.error('Error updating BL:', error);
          
          if (error.message && error.message.includes('401')) {
            this.authService.logout();
            this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
          }
        }
      });
    }
  }
}