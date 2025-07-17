import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UsersService } from './users.service';
import { Group } from './user.interface';

@Component({
  selector: 'app-groups-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="groups-container">
      <h2>Groups Management</h2>
      <button routerLink="/users/groups/create" class="create-btn">Create New Group</button>
      <button routerLink="/users" class="back-btn">Back to Users</button>
      
      <div *ngIf="loading" class="loading">Loading...</div>
      
      <div *ngIf="!loading" class="groups-table">
        <table>
          <thead>
            <tr>
              <th>Group Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let group of groups">
              <td>{{ group.name }}</td>
              <td>
                <button (click)="deleteGroup(group.id)" class="delete-btn">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .groups-container { padding: 20px; }
    .create-btn, .back-btn { margin: 10px; padding: 10px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    .delete-btn { background: red; color: white; border: none; padding: 5px 10px; }
  `]
})
export class GroupsListComponent implements OnInit {
  groups: Group[] = [];
  loading = false;

  constructor(private usersService: UsersService) {}

  ngOnInit() {
    this.loadGroups();
  }

  loadGroups() {
    this.loading = true;
    this.usersService.getGroups().subscribe({
      next: (groups) => {
        this.groups = groups;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  deleteGroup(id: number) {
    if (confirm('Are you sure you want to delete this group?')) {
      this.usersService.deleteGroup(id).subscribe(() => {
        this.loadGroups();
      });
    }
  }
}