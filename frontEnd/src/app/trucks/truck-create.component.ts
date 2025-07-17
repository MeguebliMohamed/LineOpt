import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TrucksService } from './trucks.service';
import { TRUCK_STATUS_LABELS, TruckStatus } from './truck.interface';

@Component({
  selector: 'app-truck-create',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './truck-create.component.html',
  styleUrls: ['./truck-create.component.css']
})
export class TruckCreateComponent implements OnInit {
  truckForm: FormGroup;
  saving = false;
  error = '';
  statusOptions = TRUCK_STATUS_LABELS;
  statusList: [TruckStatus, string][] = [];
  
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private trucksService: TrucksService
  ) {
    this.truckForm = this.fb.group({
      matricule: ['', [Validators.required]],
      statut: ['disponible', [Validators.required]],
      client_par_defaut: [null],
      articles: [[]]
    });
  }
  
  ngOnInit(): void {
    this.statusList = Object.entries(this.statusOptions) as [TruckStatus, string][];
  }
  
  onSubmit(): void {
    if (this.truckForm.invalid) {
      return;
    }
    
    this.saving = true;
    this.trucksService.createTruck(this.truckForm.value).subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/trucks']);
      },
      error: (err) => {
        this.error = err.message || 'Échec de la création du camion';
        this.saving = false;
        console.error(err);
      }
    });
  }
  
  // Removed getter in favor of property initialized in ngOnInit
}