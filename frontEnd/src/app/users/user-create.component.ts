import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsersService } from './users.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Group } from './user.interface';

@Component({
  selector: 'app-user-create',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './user-create.component.html',
  styleUrls: ['./user-create.component.css']
})
export class UserCreateComponent implements OnInit {
  userForm: FormGroup;
  groups: Group[] = [];
  error: string = '';
  success: string = '';

  constructor(private fb: FormBuilder, private usersService: UsersService, private router: Router) {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      full_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      groups: [[], Validators.required]
    });
  }

  ngOnInit() {
    this.loadGroups();
  }

  loadGroups() {
    this.usersService.getGroups().subscribe(groups => {
      this.groups = groups;
    });
  }

  onGroupChange(event: any, groupId: number) {
    const groups = this.userForm.get('groups')?.value || [];
    if (event.target.checked) {
      groups.push(groupId);
    } else {
      const index = groups.indexOf(groupId);
      if (index > -1) groups.splice(index, 1);
    }
    this.userForm.patchValue({ groups });
  }

  onSubmit() {
    if (this.userForm.valid) {
      this.usersService.createUser(this.userForm.value).subscribe({
        next: () => {
          this.success = 'User created successfully!';
          this.error = '';
          this.router.navigate(['/users']);
        },
        error: () => {
          this.error = 'Failed to create user.';
          this.success = '';
        }
      });
    }
  }
}
