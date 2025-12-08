import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { AdminService } from '../services/admin.service';
import { AuthService, User } from '../services/auth.service';
import { ProjectService, ProjectListItem, Project } from '../services/project.service';
import { CacheService } from '../services/cache.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  user$: Observable<User | null>;
  isAdmin$: Observable<boolean>;
  residentialProjects: ProjectListItem[] = [];
  commercialProjects: ProjectListItem[] = [];

  isLoading = false;
  isMigrating = false;
  migrationMessage = '';
  activeTab: 'residential' | 'commercial' = 'residential';

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private projectService: ProjectService,
    private cacheService: CacheService,
    private router: Router
  ) {
    this.user$ = this.authService.user$;
    this.isAdmin$ = this.adminService.isAdmin$;
  }

  ngOnInit(): void {
    this.isAdmin$.subscribe(isAdmin => {
      if (!isAdmin) {
        // Redirect non-admins to login
        this.authService.user$.subscribe(user => {
          if (!user) {
            this.router.navigate(['/login']);
          }
        });
      } else {
        // Load projects using cached service
        this.loadProjects();
      }
    });
  }

  private loadProjects(): void {
    this.isLoading = true;

    // Load residential projects using cached service
    this.projectService.getResidentialProjects().pipe(take(1)).subscribe({
      next: (projects) => {
        this.residentialProjects = projects || [];
        this.isLoading = false;
      },
      error: () => {
        this.residentialProjects = [];
        this.isLoading = false;
      }
    });

    // Load commercial projects using cached service
    this.projectService.getCommercialProjects().pipe(take(1)).subscribe({
      next: (projects) => {
        this.commercialProjects = projects || [];
      },
      error: () => {
        this.commercialProjects = [];
      }
    });
  }

  refreshProjects(): void {
    // Invalidate cache and reload
    this.cacheService.invalidateAll();
    this.loadProjects();
  }

  setActiveTab(tab: 'residential' | 'commercial'): void {
    this.activeTab = tab;
  }

  editProject(type: string, id: number): void {
    this.router.navigate(['/admin/project', type, id]);
  }

  createProject(type: string): void {
    this.router.navigate(['/admin/project', type]);
  }

  async deleteProject(type: string, id: number): Promise<void> {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    this.isLoading = true;
    try {
      if (type === 'residential') {
        await this.projectService.deleteResidentialProject(id.toString());
        this.residentialProjects = this.residentialProjects.filter(p => p.id !== id);
      } else {
        await this.projectService.deleteCommercialProject(id.toString());
        this.commercialProjects = this.commercialProjects.filter(p => p.id !== id);
      }
    } catch (error) {
      alert('Error deleting project. Please try again.');
    }
    this.isLoading = false;
  }

  async migrateData(): Promise<void> {
    if (!confirm('This will migrate all existing project data from JSON files to Firestore. Continue?')) {
      return;
    }

    this.isMigrating = true;
    this.migrationMessage = 'Migrating residential projects...';

    try {
      await this.projectService.migrateResidentialDataToFirestore();
      this.migrationMessage = 'Migrating commercial projects...';
      await this.projectService.migrateCommercialDataToFirestore();
      this.migrationMessage = 'Migration complete! Refreshing...';

      // Invalidate cache and refresh
      this.cacheService.invalidateAll();
      this.loadProjects();
    } catch (error) {
      this.migrationMessage = 'Migration failed. Please try again.';
    }

    this.isMigrating = false;
  }

  signOut(): void {
    this.authService.signOut().then(() => {
      this.router.navigate(['/']);
    });
  }
}
