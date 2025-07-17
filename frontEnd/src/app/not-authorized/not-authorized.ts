import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-authorized',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './not-authorized.component.html',
  styleUrls: ['./not-authorized.component.css']
})
export class NotAuthorizedComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    console.log('NotAuthorizedComponent: DOM rendered', {
      container: document.querySelector('.not-authorized-container'),
      containerStyles: getComputedStyle(document.querySelector('.not-authorized-container') || new Element())
    });
  }
}
