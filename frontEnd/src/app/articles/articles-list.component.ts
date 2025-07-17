import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ArticlesService } from './articles.service';
import { Article } from './article.interface';

@Component({
  selector: 'app-articles-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './articles-list.component.html',
  styleUrls: ['./articles-list.component.css']
})
export class ArticlesListComponent implements OnInit {
  articles: Article[] = [];
  loading = false;
  error = '';
  
  constructor(private articlesService: ArticlesService) {}
  
  ngOnInit(): void {
    this.loadArticles();
  }
  
  loadArticles(): void {
    this.loading = true;
    this.error = '';
    
    this.articlesService.getArticles().subscribe({
      next: (data) => {
        this.articles = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Échec du chargement des articles';
        this.loading = false;
        console.error(err);
      }
    });
  }
}