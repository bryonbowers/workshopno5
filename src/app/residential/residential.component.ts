import {Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { ProjectService, ProjectListItem } from '../services/project.service';

@Component({
  templateUrl: './residential.component.html',
  styleUrls: ['./residential.component.scss']
})
export class ResidentialComponent implements OnInit {
  imageCollection: ProjectListItem[] = [];
  isLoading = true;

  constructor(
    private router: Router,
    private meta: Meta,
    private title: Title,
    private projectService: ProjectService
  ) {
      title.setTitle('Residential Architecture Portfolio | Workshop No. 5');
      meta.updateTag({name: 'title', content: 'Residential Architecture Portfolio | Workshop No. 5'});
      meta.updateTag({property: 'og:title', content: "Residential Architecture Portfolio | Workshop No. 5"});

      meta.updateTag({name: 'description', content: "We've designed beautiful and diverse homes for families across Austin."});
      meta.updateTag({property: 'og:description', content: "We've designed beautiful and diverse homes for families across Austin."});

      meta.updateTag({name: 'robots', content: 'INDEX, FOLLOW'});
      meta.updateTag({name: 'author', content: 'Workshop No5'});
      meta.updateTag({name: 'keywords', content: 'Residential, Austin Architect'});
      meta.updateTag({httpEquiv: 'Content-Type', content: 'text/html'});
      meta.updateTag({property: 'og:type', content: "website"});
      meta.updateTag({property: 'og:image', content: "/assets/featured/austin-residential-architecture.jpg"});

      meta.updateTag({charset: 'UTF-8'});
  }

  goToProject(id) {
    this.router.navigate(['productDetails', {'id': id, 'page': 'residential'}]);
  }

  ngOnInit() {
    this.isLoading = true;
    // Use cached project service - returns immediately from cache, updates in background
    this.projectService.getResidentialProjects().subscribe({
      next: (projects) => {
        this.imageCollection = projects;
        window.scroll(0, 0);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load projects:', err);
        this.isLoading = false;
      }
    });

    // Preload all project details for instant navigation
    this.projectService.preloadAllResidentialProjects().subscribe();
  }
}
