import {Component, OnInit} from '@angular/core';
import {NgxSpinnerService} from 'ngx-spinner';
import {HttpClient} from '@angular/common/http';
import {map, take} from 'rxjs/operators';
import {ActivatedRoute} from '@angular/router';
import { Router } from '@angular/router';
import { ProjectService, Project, ProjectListItem } from '../services/project.service';
import { CacheService } from '../services/cache.service';
import { forkJoin } from 'rxjs';
declare var lightbox: any;

export interface IProjectData {
  projectData: IProjectDetail[];
  nextProjectData: IProjectDetail[];
}

export interface IProjectDetail {
  id: string;
  projectName: string;
  projectdescription: string;
  projectPersons: any[];
  projectDetails: any;
  mainImageUrl: string;
  mainImageUrlFull: string;
  archive?: boolean;
  photos_soon?: boolean;
}

@Component({
  styleUrls: ['./productDetails.component.scss'],
  templateUrl: './productDetails.component.html'
})
export class ProductDetailsComponent implements OnInit {
  projectData = ({} as IProjectDetail);
  nextProjectData = ({} as IProjectDetail);
  nextProjectId;
  imageCollection = [];
  mainPage;
  mainPageTitle;
  archive;
  photos_soon;
  mainImageUrl;
  mainImageUrlFull;

  constructor(
    private http: HttpClient,
    private spinner: NgxSpinnerService,
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private cacheService: CacheService
  ) {}

  goToProject(id) {
    this.router.navigate(['productDetails', {'id': id, 'page': this.mainPage}]);
  }

  fetchProject() {
    this.spinner.show();
    const currentProjectId = this.route.snapshot.params['id'];
    const currentPage = this.route.snapshot.params['page'];

    // Try cache first for instant load
    const cached = currentPage === 'residential'
      ? this.cacheService.getResidentialProject(currentProjectId)
      : this.cacheService.getCommercialProject(currentProjectId);

    if (cached) {
      this.displayProject(cached as unknown as IProjectDetail, currentPage);
      // Still fetch in background to ensure freshness
      this.fetchFromService(currentProjectId, currentPage);
    } else {
      // No cache, fetch from service
      this.fetchFromService(currentProjectId, currentPage);
    }
  }

  private fetchFromService(projectId: string, page: string) {
    const projectObs = page === 'residential'
      ? this.projectService.getResidentialProjectDetails(projectId)
      : this.projectService.getCommercialProjectDetails(projectId);

    projectObs.pipe(take(1)).subscribe({
      next: (project) => {
        if (project) {
          this.displayProject(project as unknown as IProjectDetail, page);
        } else {
          // Fallback to JSON if not found
          this.fetchFromJson();
        }
      },
      error: () => {
        this.fetchFromJson();
      }
    });
  }

  private displayProject(data: IProjectDetail, page: string) {
    this.projectData = data;
    this.imageCollection = data.projectDetails || [];
    this.mainImageUrl = data.mainImageUrl;
    this.archive = data.archive;
    this.photos_soon = data.photos_soon;
    this.mainImageUrlFull = data.mainImageUrlFull ? data.mainImageUrlFull : null;

    // Get next project ID from list
    this.getNextProjectId(data.id, page);
    this.setupLightbox();
  }

  private getNextProjectId(currentId: string, page: string) {
    const listObs = page === 'residential'
      ? this.projectService.getResidentialProjects()
      : this.projectService.getCommercialProjects();

    listObs.pipe(take(1)).subscribe(projects => {
      const visibleProjects = projects.filter(p => p.show && !p.archive);
      const currentIndex = visibleProjects.findIndex(p => p.id?.toString() === currentId);
      if (currentIndex >= 0) {
        const nextIndex = currentIndex === visibleProjects.length - 1 ? 0 : currentIndex + 1;
        this.nextProjectId = visibleProjects[nextIndex]?.id;
      } else if (visibleProjects.length > 0) {
        this.nextProjectId = visibleProjects[0]?.id;
      }
    });
  }

  private fetchFromJson() {
    const currentProjectId = this.route.snapshot.params['id'];
    const currentPage = this.route.snapshot.params['page'];
    const currentUrl = `./assets/data/${currentPage}/projectDetails/projectDetailsData.json`;

    this.http.get<IProjectData>(currentUrl)
      .pipe(
        map(data => {
          const pr = data.projectData.filter(item => item.id === currentProjectId)[0];
          let next = null;

          for (let index = 0; index < data.projectData.length; index++) {
            const item = data.projectData[index];
            if (item.id === currentProjectId) {
              if (index === data.projectData.length - 1) {
                next = data.projectData[0];
              } else {
                next = data.projectData[index + 1];
              }
              break;
            }
          }
          return [pr, next];
        })
      )
      .subscribe({
        next: (arr) => {
          const data = arr[0];
          this.projectData = data;
          this.imageCollection = data.projectDetails;
          this.mainImageUrl = data.mainImageUrl;
          this.archive = data.archive;
          this.photos_soon = data.photos_soon;
          this.mainImageUrlFull = data.mainImageUrlFull ? data.mainImageUrlFull : null;
          this.nextProjectId = arr[1].id;

          this.setupLightbox();
        },
        error: () => {
          this.spinner.hide();
        }
      });
  }

  private setupLightbox() {
    if (this.archive) {
      this.mainPage += '-archive';
    }
    this.mainPageTitle = this.mainPage.replace('-', ' ').replace('archive', 'archives');

    lightbox.option({
      resizeDuration: 100,
      wrapAround: true,
      alwaysShowNavOnTouchDevices: true,
      imageFadeDuration: 200,
    });

    window.scroll(0, 0);
    this.spinner.hide();
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      const page = params['page'];
      this.mainPage = page;
      this.fetchProject();
    });
  }
}
