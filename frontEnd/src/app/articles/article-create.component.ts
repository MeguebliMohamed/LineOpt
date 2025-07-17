import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ArticlesService } from './articles.service';

@Component({
  selector: 'app-article-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './article-create.component.html',
  styles: []
})
export class ArticleCreateComponent {
  articleForm: FormGroup;
  submitted = false;
  saving = false;
  error = '';
  
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private articlesService: ArticlesService
  ) {
    this.articleForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255)]],
      type: ['', [Validators.required, Validators.maxLength(100)]]
    });
  }
  
  get f() { return this.articleForm.controls; }
  
  onSubmit(): void {
    this.submitted = true;
    
    if (this.articleForm.invalid) {
      return;
    }
    
    this.saving = true;
    this.error = '';
    
    this.articlesService.createArticle(this.articleForm.value).subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/articles']);
      },
      error: (err) => {
        this.error = err.message || 'Échec de la création de l\'article';
        this.saving = false;
        console.error(err);
      }
    });
  }
}