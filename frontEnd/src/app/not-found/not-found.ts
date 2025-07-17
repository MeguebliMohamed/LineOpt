import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css']
})
export class NotFoundComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    console.log('NotFoundComponent: DOM rendered', {
      container: document.querySelector('.not-found-container'),
      containerStyles: getComputedStyle(document.querySelector('.not-found-container') || new Element())
    });
  }
}
