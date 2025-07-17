import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TrucksService } from './trucks.service';
import { Truck, TRUCK_STATUS_LABELS, TruckStatus } from './truck.interface';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-truck-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './truck-detail.component.html',
  styleUrls: ['./truck-detail.component.css']
})
export class TruckDetailComponent implements OnInit {  
  deleting = false;
  truckId: number | null = null;
  truck: Truck | null = null;
  truckForm: FormGroup;
  loading = false;
  saving = false;
  error = '';
  isEditMode = false;
  statusOptions = TRUCK_STATUS_LABELS;
  statusList: [TruckStatus, string][] = [];
  
  constructor(
    private route: ActivatedRoute,
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
    this.isEditMode = this.router.url.includes('/edit');
    const id = this.route.snapshot.paramMap.get('id');
    
    // Initialize statusList once to avoid getter calls during change detection
    this.statusList = Object.entries(this.statusOptions) as [TruckStatus, string][];
    
    if (id) {
      this.truckId = +id;
      this.loadTruck(this.truckId);
    }
  }
  
  loadTruck(id: number): void {
    this.loading = true;
    this.trucksService.getTruck(id).subscribe({
      next: (data) => {
        this.truck = data;
        this.populateForm(data);
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Échec du chargement des détails du camion';
        this.loading = false;
        console.error(err);
      }
    });
  }
  
  populateForm(truck: Truck): void {
    this.truckForm.patchValue({
      matricule: truck.matricule,
      statut: truck.statut,
      client_par_defaut: truck.client_par_defaut,
      articles: truck.articles
    });
    
    if (!this.isEditMode) {
      this.truckForm.disable();
    }
  }
  
  onSubmit(): void {
    if (this.truckForm.invalid || !this.truckId || !this.truck) {
      return;
    }
    
    this.saving = true;
    this.error = '';
    
    // Create a clean payload with only the fields we need to update
    const formValue = this.truckForm.value;
    const payload = {
      matricule: formValue.matricule,
      statut: formValue.statut,
      client_par_defaut: formValue.client_par_defaut,
      articles: Array.isArray(formValue.articles) ? formValue.articles : []
    };
    
    this.trucksService.updateTruck(this.truckId, payload).subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/trucks']);
      },
      error: (err) => {
        this.error = err.message || 'Échec de la mise à jour du camion';
        this.saving = false;
        console.error(err);
      }
    });
  }
  
  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    if (this.isEditMode) {
      this.truckForm.enable();
    } else {
      this.truckForm.disable();
    }
  }
  
  changeStatus(status: TruckStatus): void {
    if (!this.truckId) return;
    
    this.saving = true;
    this.error = '';
    
    this.trucksService.changeStatus(this.truckId, status)
      .pipe(finalize(() => this.saving = false))
      .subscribe({
        next: (updatedTruck) => {
          this.truck = updatedTruck;
          this.populateForm(updatedTruck);
        },
        error: (err) => {
          this.error = err.message || 'Échec du changement de statut';
          console.error(err);
        }
      });
  }
  
  deleteTruck(): void {
    if (!this.truckId || !confirm('Êtes-vous sûr de vouloir supprimer ce camion ?')) return;
    
    this.deleting = true;
    this.error = '';
    
    this.trucksService.deleteTruck(this.truckId)
      .pipe(finalize(() => this.deleting = false))
      .subscribe({
        next: () => {
          this.router.navigate(['/trucks']);
        },
        error: (err) => {
          this.error = err.message || 'Échec de la suppression du camion';
          console.error(err);
        }
      });
  }
  
  // Removed getter in favor of property initialized in ngOnInit
}