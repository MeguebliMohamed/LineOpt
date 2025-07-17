import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsersService } from './users.service';
import { User, Group, Permission, CreateUser, CreateGroup } from './user.interface';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="management-container">
      <h2>User & Group Management</h2>
      
      <div class="tabs">
        <button [class.active]="activeTab === 'users'" (click)="activeTab = 'users'">Users</button>
        <button [class.active]="activeTab === 'groups'" (click)="activeTab = 'groups'">Groups</button>
        <button [class.active]="activeTab === 'permissions'" (click)="activeTab = 'permissions'">Permissions</button>
      </div>

      <!-- Users Tab -->
      <div *ngIf="activeTab === 'users'" class="tab-content">
        <div class="section-header">
          <h3>Users</h3>
          <button (click)="showCreateUser = !showCreateUser" class="create-btn">
            {{ showCreateUser ? 'Cancel' : 'Create User' }}
          </button>
        </div>

        <div *ngIf="showCreateUser" class="create-form">
          <form [formGroup]="userForm" (ngSubmit)="createUser()">
            <input formControlName="username" placeholder="Username" required>
            <input formControlName="full_name" placeholder="Full Name" required>
            <input formControlName="email" placeholder="Email" type="email" required>
            <input formControlName="password" placeholder="Password" type="password" required>
            
            <div class="groups-selection">
              <label>Groups:</label>
              <div *ngFor="let group of groups">
                <label>
                  <input type="checkbox" [value]="group.id" (change)="onUserGroupChange($event, group.id)">
                  {{ group.name }}
                </label>
              </div>
            </div>
            
            <button type="submit" [disabled]="userForm.invalid">Create User</button>
          </form>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Groups</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of users">
              <td>{{ user.username }}</td>
              <td>{{ user.full_name }}</td>
              <td>{{ user.email }}</td>
              <td>
                <span *ngFor="let group of user.groups; let last = last">
                  {{ group.name }}<span *ngIf="!last">, </span>
                </span>
              </td>
              <td>
                <button (click)="deleteUser(user.id)" class="delete-btn">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Groups Tab -->
      <div *ngIf="activeTab === 'groups'" class="tab-content">
        <div class="section-header">
          <h3>Groups</h3>
          <button (click)="showCreateGroup = !showCreateGroup" class="create-btn">
            {{ showCreateGroup ? 'Cancel' : 'Create Group' }}
          </button>
        </div>

        <div *ngIf="showCreateGroup" class="create-form">
          <form [formGroup]="groupForm" (ngSubmit)="createGroup()">
            <input formControlName="name" placeholder="Group Name" required>
            
            <div class="permissions-selection">
              <label>Permissions:</label>
              <div class="permissions-grid">
                <div *ngFor="let permission of permissions">
                  <label>
                    <input type="checkbox" [value]="permission.id" (change)="onGroupPermissionChange($event, permission.id)">
                    {{ permission.name }}
                  </label>
                </div>
              </div>
            </div>
            
            <button type="submit" [disabled]="groupForm.invalid">Create Group</button>
          </form>
        </div>

        <table class="data-table">
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

      <!-- Permissions Tab -->
      <div *ngIf="activeTab === 'permissions'" class="tab-content">
        <h3>Available Permissions</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>Permission Name</th>
              <th>Code Name</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let permission of permissions">
              <td>{{ permission.name }}</td>
              <td>{{ permission.codename }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="message" [class]="messageType">{{ message }}</div>
    </div>
  `,
  styles: [`
    .management-container { padding: 20px; }
    .tabs { display: flex; margin-bottom: 20px; }
    .tabs button { padding: 10px 20px; margin-right: 5px; border: 1px solid #ddd; background: #f5f5f5; }
    .tabs button.active { background: #007bff; color: white; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .create-form { background: #f9f9f9; padding: 20px; margin-bottom: 20px; border-radius: 5px; }
    .create-form input { width: 100%; padding: 8px; margin: 5px 0; }
    .groups-selection, .permissions-selection { margin: 15px 0; }
    .permissions-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th, .data-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    .create-btn { background: #28a745; color: white; padding: 10px 15px; border: none; }
    .delete-btn { background: #dc3545; color: white; padding: 5px 10px; border: none; }
    .success { color: green; padding: 10px; }
    .error { color: red; padding: 10px; }
  `]
})
export class UserManagementComponent implements OnInit {
  activeTab = 'users';
  users: User[] = [];
  groups: Group[] = [];
  permissions: Permission[] = [];
  
  showCreateUser = false;
  showCreateGroup = false;
  
  userForm: FormGroup;
  groupForm: FormGroup;
  
  selectedUserGroups: number[] = [];
  selectedGroupPermissions: number[] = [];
  
  message = '';
  messageType = '';

  constructor(private fb: FormBuilder, private usersService: UsersService) {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      full_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.groupForm = this.fb.group({
      name: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.usersService.getUsers().subscribe(users => this.users = users);
    this.usersService.getGroups().subscribe(groups => this.groups = groups);
    this.usersService.getPermissions().subscribe(permissions => this.permissions = permissions);
  }

  onUserGroupChange(event: any, groupId: number) {
    if (event.target.checked) {
      this.selectedUserGroups.push(groupId);
    } else {
      const index = this.selectedUserGroups.indexOf(groupId);
      if (index > -1) this.selectedUserGroups.splice(index, 1);
    }
  }

  onGroupPermissionChange(event: any, permissionId: number) {
    if (event.target.checked) {
      this.selectedGroupPermissions.push(permissionId);
    } else {
      const index = this.selectedGroupPermissions.indexOf(permissionId);
      if (index > -1) this.selectedGroupPermissions.splice(index, 1);
    }
  }

  createUser() {
    if (this.userForm.valid) {
      const userData: CreateUser = {
        ...this.userForm.value,
        groups: this.selectedUserGroups
      };

      this.usersService.createUser(userData).subscribe({
        next: () => {
          this.showMessage('User created successfully!', 'success');
          this.userForm.reset();
          this.selectedUserGroups = [];
          this.showCreateUser = false;
          this.loadData();
        },
        error: () => this.showMessage('Failed to create user.', 'error')
      });
    }
  }

  createGroup() {
    if (this.groupForm.valid) {
      const groupData: CreateGroup = {
        name: this.groupForm.value.name,
        permissions: this.selectedGroupPermissions
      };

      this.usersService.createGroup(groupData).subscribe({
        next: () => {
          this.showMessage('Group created successfully!', 'success');
          this.groupForm.reset();
          this.selectedGroupPermissions = [];
          this.showCreateGroup = false;
          this.loadData();
        },
        error: () => this.showMessage('Failed to create group.', 'error')
      });
    }
  }

  deleteUser(id: number) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.usersService.deleteUser(id).subscribe(() => {
        this.showMessage('User deleted successfully!', 'success');
        this.loadData();
      });
    }
  }

  deleteGroup(id: number) {
    if (confirm('Are you sure you want to delete this group?')) {
      this.usersService.deleteGroup(id).subscribe(() => {
        this.showMessage('Group deleted successfully!', 'success');
        this.loadData();
      });
    }
  }

  showMessage(text: string, type: string) {
    this.message = text;
    this.messageType = type;
    setTimeout(() => this.message = '', 3000);
  }
}