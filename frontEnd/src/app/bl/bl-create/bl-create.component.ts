import { Component, OnInit } from '@angular/core';
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
export class BlCreateComponent implements OnInit {
  blForm!: FormGroup;
  articles: Article[] = [];
  clients: Client[] = [];
  camions: Camion[] = [];
  error = false;
  
  constructor(
    private fb: FormBuilder,
    private blService: BlService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (!this.authService.getAccessToken()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    
    this.initForm();
    this.loadDropdownData();
  }

  initForm(): void {
    this.blForm = this.fb.group({
      id_bl: ['', Validators.required],
      article: ['', Validators.required],
      client: ['', Validators.required],
      camion: [''],
      quantite: ['', [Validators.required, Validators.min(0)]],
      statut: ['en_attente']
    });
  }

  loadDropdownData(): void {
    // Load articles, clients, and camions from respective services
    this.blService.getArticles().subscribe({
      next: (data) => this.articles = data,
      error: (err) => {
        console.error('Error loading articles:', err);
        this.error = true;
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
        this.error = true;
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
        this.error = true;
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
      
      this.blService.createBl(this.blForm.value).subscribe({
        next: () => {
          this.router.navigate(['/bl']);
        },
        error: (error) => {
          console.error('Error creating BL:', error);
          this.error = true;
          if (error.message && error.message.includes('401')) {
            this.authService.logout();
            this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
          }
        }
      });
    }
  }
}