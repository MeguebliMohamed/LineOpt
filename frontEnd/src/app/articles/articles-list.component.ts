
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ArticlesService } from './articles.service';
import { Article } from './article.interface';

@Component({
  selector: 'app-articles-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './articles-list.component.html',
  styleUrls: ['./articles-list.component.css']
})
export class ArticlesListComponent implements OnInit {
  articles: Article[] = [];
  filteredArticles: Article[] = [];
  loading = false;
  deleting = false;
  error = '';
  nameFilter: string = '';
  itemsPerPage: number = 10;
  pageIndex: number = 0;
  filtersVisible: boolean = true;
  showDeleteDialog: boolean = false;
  deleteArticleId: number | null = null;
  deleteArticleName: string = '';

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
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Échec du chargement des articles';
        this.loading = false;
        console.error(err);
      }
    });
  }

  applyFilters(): void {
    this.filteredArticles = this.articles.filter(article => {
      const matchesName = this.nameFilter
        ? article.name.toLowerCase().includes(this.nameFilter.toLowerCase())
        : true;
      return matchesName;
    });
    this.pageIndex = 0;
  }

  clearFilters(): void {
    this.nameFilter = '';
    this.applyFilters();
  }

  onPageSizeChange(): void {
    this.pageIndex = 0;
  }

  openDeleteDialog(id: number, name: string): void {
    this.deleteArticleId = id;
    this.deleteArticleName = name;
    this.showDeleteDialog = true;
  }

  closeDeleteDialog(): void {
    this.showDeleteDialog = false;
    this.deleteArticleId = null;
    this.deleteArticleName = '';
  }

  confirmDelete(): void {
    if (this.deleteArticleId === null) return;

    this.deleting = true;
    this.error = '';

    this.articlesService.deleteArticle(this.deleteArticleId).subscribe({
      next: () => {
        this.articles = this.articles.filter(article => article.id !== this.deleteArticleId);
        this.applyFilters();
        this.deleting = false;
        this.closeDeleteDialog();
      },
      error: (err) => {
        this.error = err.message || 'Échec de la suppression de l\'article';
        this.deleting = false;
        this.closeDeleteDialog();
        console.error(err);
      }
    });
  }

  get paginatedArticles(): Article[] {
    const start = this.pageIndex * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredArticles.slice(start, end);
  }

  get pageCount(): number {
    return Math.ceil(this.filteredArticles.length / this.itemsPerPage);
  }

  hasNextPage(): boolean {
    return (this.pageIndex + 1) * this.itemsPerPage < this.filteredArticles.length;
  }

  previousPage(): void {
    if (this.pageIndex > 0) {
      this.pageIndex--;
    }
  }

  nextPage(): void {
    if (this.hasNextPage()) {
      this.pageIndex++;
    }
  }

  toggleFilters(): void {
    this.filtersVisible = !this.filtersVisible;
  }

  protected readonly Number = Number;
}
