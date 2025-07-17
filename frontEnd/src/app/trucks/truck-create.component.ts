
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TrucksService } from './trucks.service';
import { TRUCK_STATUS_LABELS, TruckStatus, Truck } from './truck.interface';

@Component({
  selector: 'app-truck-create',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule
  ],
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
      matricule: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(20),
          Validators.pattern(/^[a-zA-Z0-9-]+$/), // Alphanumeric and hyphens
        ]
      ],
      statut: ['disponible', [Validators.required]],
      client_par_defaut: [
        null,
        [
          Validators.maxLength(100),
          Validators.pattern(/^[a-zA-Z\s'-]*$/) // Letters, spaces, apostrophes, hyphens
        ]
      ],
      articles: [[]]
    });

    // Log form initialization
    console.log('TruckCreateComponent: Form initialized', this.truckForm.value);
  }

  ngOnInit(): void {
    this.statusList = Object.entries(this.statusOptions) as [TruckStatus, string][];
    // Log statusList to verify population
    console.log('TruckCreateComponent: statusList populated', this.statusList);

    // Subscribe to form status changes for debugging
    this.truckForm.statusChanges.subscribe(status => {
      console.log('TruckCreateComponent: Form status changed', {
        status,
        formValues: this.truckForm.value,
        errors: this.truckForm.errors
      });
    });
  }

  onSubmit(): void {
    console.log('TruckCreateComponent: onSubmit called', {
      formValid: this.truckForm.valid,
      formValues: this.truckForm.value,
      errors: this.truckForm.errors
    });

    if (this.truckForm.invalid) {
      this.truckForm.markAllAsTouched();
      console.log('TruckCreateComponent: Form invalid, errors:', this.truckForm.errors);
      return;
    }

    this.saving = true;
    this.error = '';
    const truck: Partial<Truck> = {
      ...this.truckForm.value,
      client_par_defaut: this.truckForm.value.client_par_defaut || null
    };

    console.log('TruckCreateComponent: Submitting truck data', truck);

    this.trucksService.createTruck(truck).subscribe({
      next: (result) => {
        console.log('TruckCreateComponent: Truck created successfully', result);
        this.saving = false;
        this.router.navigate(['/trucks']);
      },
      error: (err) => {
        this.error = err.message || 'Échec de la création du camion';
        this.saving = false;
        console.error('TruckCreateComponent: Error creating truck', err);
      }
    });
  }

  cancel(): void {
    console.log('TruckCreateComponent: Cancel clicked');
    this.router.navigate(['/trucks']);
  }
}
