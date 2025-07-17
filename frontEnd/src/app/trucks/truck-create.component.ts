import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TrucksService } from './trucks.service';
import { TRUCK_STATUS_LABELS, TruckStatus, Truck } from './truck.interface';

@Component({
  selector: 'app-truck-create',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
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
  }

  ngOnInit(): void {
    this.statusList = Object.entries(this.statusOptions) as [TruckStatus, string][];
  }

  onSubmit(): void {
    if (this.truckForm.invalid) {
      this.truckForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.error = '';
    const truck: Partial<Truck> = {
      ...this.truckForm.value,
      client_par_defaut: this.truckForm.value.client_par_defaut || null
    };

    this.trucksService.createTruck(<Truck>truck).subscribe({
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

  cancel(): void {
    this.router.navigate(['/trucks']);
  }
}
