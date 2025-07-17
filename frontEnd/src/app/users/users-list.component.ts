import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UsersService } from './users.service';
import { User } from './user.interface';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.css']
})
export class UsersListComponent implements OnInit, AfterViewInit {
  users: User[] = [];
  loading = false;
  error = '';

  constructor(private usersService: UsersService) {}

  ngOnInit() {
    console.log('UsersListComponent: Initializing');
    this.loadUsers();
  }

  ngAfterViewInit(): void {
    console.log('UsersListComponent: DOM rendered', {
      table: document.querySelector('.users-table'),
      tableStyles: getComputedStyle(document.querySelector('.users-table') || new Element()),
      containerStyles: getComputedStyle(document.querySelector('.users-list-container') || new Element())
    });
  }

  loadUsers() {
    this.loading = true;
    this.error = '';
    console.log('UsersListComponent: Loading users');
    this.usersService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
        console.log('UsersListComponent: Users loaded', this.users);
      },
      error: (err) => {
        console.error('UsersListComponent: Error loading users', err);
        this.error = 'Échec du chargement des utilisateurs';
        this.loading = false;
      }
    });
  }

  deleteUser(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      console.log('UsersListComponent: Deleting user with id', id);
      this.usersService.deleteUser(id).subscribe({
        next: () => {
          console.log('UsersListComponent: User deleted successfully');
          this.loadUsers();
        },
        error: (err) => {
          console.error('UsersListComponent: Error deleting user', err);
          this.error = 'Échec de la suppression de l’utilisateur';
        }
      });
    }
  }
}
