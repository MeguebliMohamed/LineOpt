import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsersService } from './users.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Permission } from './user.interface';

@Component({
  selector: 'app-group-create',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  template: `
    <div class="group-create-container">
      <h2>Create New Group</h2>
      <form [formGroup]="groupForm" (ngSubmit)="onSubmit()">
        <div>
          <label for="name">Group Name</label>
          <input id="name" formControlName="name" type="text" />
        </div>
        
        <div class="permissions-section">
          <label>Permissions</label>
          <div class="permissions-grid">
            <div *ngFor="let permission of permissions" class="permission-item">
              <label>
                <input 
                  type="checkbox" 
                  [value]="permission.id" 
                  (change)="onPermissionChange($event, permission.id)"
                />
                {{ permission.name }}
              </label>
            </div>
          </div>
        </div>
        
        <div *ngIf="error" class="error">{{ error }}</div>
        <div *ngIf="success" class="success">{{ success }}</div>
        
        <button type="submit" [disabled]="groupForm.invalid">Create Group</button>
        <button type="button" routerLink="/users/groups">Cancel</button>
      </form>
    </div>
  `,
  styles: [`
    .group-create-container { padding: 20px; max-width: 600px; }
    .permissions-section { margin: 20px 0; }
    .permissions-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 10px; }
    .permission-item { padding: 5px; }
    input[type="text"] { width: 100%; padding: 8px; margin: 5px 0; }
    button { margin: 10px 5px; padding: 10px 15px; }
    .error { color: red; margin: 10px 0; }
    .success { color: green; margin: 10px 0; }
  `]
})
export class GroupCreateComponent implements OnInit {
  groupForm: FormGroup;
  permissions: Permission[] = [];
  selectedPermissions: number[] = [];
  error: string = '';
  success: string = '';

  constructor(
    private fb: FormBuilder, 
    private usersService: UsersService, 
    private router: Router
  ) {
    this.groupForm = this.fb.group({
      name: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadPermissions();
  }

  loadPermissions() {
    this.usersService.getPermissions().subscribe(permissions => {
      this.permissions = permissions;
    });
  }

  onPermissionChange(event: any, permissionId: number) {
    if (event.target.checked) {
      this.selectedPermissions.push(permissionId);
    } else {
      const index = this.selectedPermissions.indexOf(permissionId);
      if (index > -1) this.selectedPermissions.splice(index, 1);
    }
  }

  onSubmit() {
    if (this.groupForm.valid) {
      const formData = {
        name: this.groupForm.value.name,
        permissions: this.selectedPermissions
      };
      
      this.usersService.createGroup(formData).subscribe({
        next: () => {
          this.success = 'Group created successfully!';
          this.error = '';
          this.router.navigate(['/users/groups']);
        },
        error: () => {
          this.error = 'Failed to create group.';
          this.success = '';
        }
      });
    }
  }
}