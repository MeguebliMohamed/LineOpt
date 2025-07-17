import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ArticlesService } from './articles.service';

@Component({
  selector: 'app-article-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './article-create.component.html',
  styleUrls: ['./article-create.component.css']
})
export class ArticleCreateComponent implements OnInit, AfterViewInit {
  articleForm: FormGroup;
  submitted = false;
  saving = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    protected router: Router,
    private articlesService: ArticlesService
  ) {
    this.articleForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255)]],
      type: ['', [Validators.required, Validators.maxLength(100)]]
    });
    console.log('ArticleCreateComponent: Form initialized', this.articleForm.value);
  }

  ngOnInit(): void {
    this.articleForm.statusChanges.subscribe(status => {
      console.log('ArticleCreateComponent: Form status changed', {
        status,
        formValues: this.articleForm.value,
        errors: this.articleForm.errors
      });
    });
  }

  ngAfterViewInit(): void {
    console.log('ArticleCreateComponent: DOM rendered', {
      nameInput: document.querySelector('input[name="name"]'),
      nameInputStyles: getComputedStyle(document.querySelector('input[name="name"]') || new Element())
    });
  }

  get f() { return this.articleForm.controls; }

  onSubmit(): void {
    this.submitted = true;
    console.log('ArticleCreateComponent: onSubmit called', {
      formValid: this.articleForm.valid,
      formValues: this.articleForm.value,
      errors: this.articleForm.errors
    });

    if (this.articleForm.invalid) {
      this.articleForm.markAllAsTouched();
      console.log('ArticleCreateComponent: Form invalid, errors:', this.articleForm.errors);
      return;
    }

    this.saving = true;
    this.error = '';

    this.articlesService.createArticle(this.articleForm.value).subscribe({
      next: () => {
        console.log('ArticleCreateComponent: Article created successfully');
        this.saving = false;
        this.router.navigate(['/articles']);
      },
      error: (err) => {
        this.error = err.message || 'Échec de la création de l\'article';
        this.saving = false;
        console.error('ArticleCreateComponent: Error creating article', err);
      }
    });
  }
}
