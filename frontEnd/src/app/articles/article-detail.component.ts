import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ArticlesService } from './articles.service';
import { Article } from './article.interface';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './article-detail.component.html',
  styles: []
})
export class ArticleDetailComponent implements OnInit {
  deleting = false;
  articleId: number | null = null;
  article: Article | null = null;
  articleForm: FormGroup;
  loading = false;
  saving = false;
  submitted = false;
  error = '';
  isEditMode = false;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private articlesService: ArticlesService
  ) {
    this.articleForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255)]],
      type: ['', [Validators.required, Validators.maxLength(100)]]
    });
  }
  
  get f() { return this.articleForm.controls; }
  
  ngOnInit(): void {
    this.isEditMode = this.router.url.includes('/edit');
    const id = this.route.snapshot.paramMap.get('id');
    
    if (id) {
      this.articleId = +id;
      this.loadArticle(this.articleId);
    }
  }
  
  loadArticle(id: number): void {
    this.loading = true;
    this.articlesService.getArticle(id).subscribe({
      next: (data) => {
        this.article = data;
        this.populateForm(data);
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Échec du chargement des détails de l\'article';
        this.loading = false;
        console.error(err);
      }
    });
  }
  
  populateForm(article: Article): void {
    this.articleForm.patchValue({
      name: article.name,
      type: article.type
    });
    
    if (!this.isEditMode) {
      this.articleForm.disable();
    }
  }
  
  onSubmit(): void {
    this.submitted = true;
    
    if (this.articleForm.invalid || !this.articleId || !this.article) {
      return;
    }
    
    this.saving = true;
    this.error = '';
    
    const payload = {
      name: this.articleForm.value.name,
      type: this.articleForm.value.type
    };
    
    this.articlesService.updateArticle(this.articleId, payload).subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/articles']);
      },
      error: (err) => {
        this.error = err.message || 'Échec de la mise à jour de l\'article';
        this.saving = false;
        console.error(err);
      }
    });
  }
  
  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    if (this.isEditMode) {
      this.articleForm.enable();
    } else {
      this.articleForm.disable();
      if (this.article) {
        this.populateForm(this.article);
      }
    }
  }
  
  deleteArticle(): void {
    if (!this.articleId || !confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return;
    
    this.deleting = true;
    this.error = '';
    
    this.articlesService.deleteArticle(this.articleId)
      .pipe(finalize(() => this.deleting = false))
      .subscribe({
        next: () => {
          this.router.navigate(['/articles']);
        },
        error: (err) => {
          this.error = err.message || 'Échec de la suppression de l\'article';
          console.error(err);
        }
      });
  }
}