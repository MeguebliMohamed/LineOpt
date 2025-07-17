import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TrucksService } from './trucks.service';
import { Truck, TRUCK_STATUS_LABELS, TruckStatus } from './truck.interface';

@Component({
  selector: 'app-trucks-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './trucks-list.component.html',
  styleUrls: ['./trucks-list.component.css']
})
export class TrucksListComponent implements OnInit {
  trucks: Truck[] = [];
  loading = false;
  error = '';
  statusLabels = TRUCK_STATUS_LABELS;
  
  constructor(private trucksService: TrucksService) {}
  
  ngOnInit(): void {
    this.loadTrucks();
  }
  
  loadTrucks(): void {
    this.loading = true;
    this.trucksService.getTrucks().subscribe({
      next: (data) => {
        this.trucks = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Échec du chargement des camions';
        this.loading = false;
        console.error(err);
      }
    });
  }
  

}