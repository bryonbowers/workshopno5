import { Injectable } from '@angular/core';
import { Firestore, collection, doc, setDoc, deleteDoc } from '@angular/fire/firestore';
import { Storage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { Observable, from, of } from 'rxjs';
import { map, tap, catchError, shareReplay } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { CacheService } from './cache.service';

export interface ProjectPerson {
  name: string;
  position: string;
}

export interface ProjectDetail {
  url: string;
  name: string;
  show: boolean;
  full?: string;
}

export interface ProjectListItem {
  id: number;
  url: string;
  name: string;
  summary: string;
  show: boolean;
  subtitle?: string;
  archive?: boolean;
  photos_soon?: boolean;
}

export interface Project {
  id: string;
  projectName: string;
  projectdescription: string[];
  mainImageUrl: string;
  mainImageUrlFull?: string;
  projectPersons: ProjectPerson[];
  projectDetails: ProjectDetail[];
  photos_soon?: boolean;
  archive?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  // In-memory cache for instant access
  private residentialList: ProjectListItem[] | null = null;
  private commercialList: ProjectListItem[] | null = null;
  private residentialProjects: Map<string, Project> = new Map();
  private commercialProjects: Map<string, Project> = new Map();
  private residentialDetailsLoaded = false;
  private commercialDetailsLoaded = false;

  // Shared observables to prevent duplicate requests
  private residentialList$: Observable<ProjectListItem[]> | null = null;
  private commercialList$: Observable<ProjectListItem[]> | null = null;

  constructor(
    private http: HttpClient,
    private cacheService: CacheService,
    private firestore: Firestore,
    private storage: Storage
  ) {
    // Load from localStorage cache on init (only if data is valid and non-empty)
    const cachedResList = this.cacheService.getResidentialList();
    if (cachedResList && cachedResList.length > 0) {
      this.residentialList = cachedResList;
    }
    const cachedComList = this.cacheService.getCommercialList();
    if (cachedComList && cachedComList.length > 0) {
      this.commercialList = cachedComList;
    }
  }

  // ============ PUBLIC API - Instant cached reads ============

  getResidentialProjects(): Observable<ProjectListItem[]> {
    // Return from memory immediately (only if we have actual data)
    if (this.residentialList && this.residentialList.length > 0) {
      return of(this.residentialList);
    }

    // Return shared observable if already loading
    if (this.residentialList$) {
      return this.residentialList$;
    }

    // Load from JSON (fast)
    this.residentialList$ = this.http.get<{residentialComponent: ProjectListItem[]}>('./assets/data/residential/residentialListData.json').pipe(
      map(data => data.residentialComponent || []),
      tap(projects => {
        this.residentialList = projects;
        this.cacheService.setResidentialList(projects);
        this.residentialList$ = null;
      }),
      shareReplay(1),
      catchError(() => of([]))
    );

    return this.residentialList$;
  }

  getCommercialProjects(): Observable<ProjectListItem[]> {
    // Return from memory immediately (only if we have actual data)
    if (this.commercialList && this.commercialList.length > 0) {
      return of(this.commercialList);
    }

    if (this.commercialList$) {
      return this.commercialList$;
    }

    this.commercialList$ = this.http.get<{commercialComponent: ProjectListItem[]}>('./assets/data/commercial/commercialListData.json').pipe(
      map(data => data.commercialComponent || []),
      tap(projects => {
        this.commercialList = projects;
        this.cacheService.setCommercialList(projects);
        this.commercialList$ = null;
      }),
      shareReplay(1),
      catchError(() => of([]))
    );

    return this.commercialList$;
  }

  getResidentialProjectDetails(id: string): Observable<Project | null> {
    // Check memory cache
    const cached = this.residentialProjects.get(id);
    if (cached) {
      return of(cached);
    }

    // Check localStorage cache
    const localCached = this.cacheService.getResidentialProject(id);
    if (localCached) {
      this.residentialProjects.set(id, localCached);
      return of(localCached);
    }

    // Load from JSON
    return this.http.get<{projectData: Project[]}>('./assets/data/residential/projectDetails/projectDetailsData.json').pipe(
      map(data => {
        const project = data.projectData?.find(p => p.id?.toString() === id) || null;
        if (project) {
          this.residentialProjects.set(id, project);
          this.cacheService.setResidentialProject(id, project);
        }
        return project;
      }),
      catchError(() => of(null))
    );
  }

  getCommercialProjectDetails(id: string): Observable<Project | null> {
    const cached = this.commercialProjects.get(id);
    if (cached) {
      return of(cached);
    }

    const localCached = this.cacheService.getCommercialProject(id);
    if (localCached) {
      this.commercialProjects.set(id, localCached);
      return of(localCached);
    }

    return this.http.get<{projectData: Project[]}>('./assets/data/commercial/projectDetails/projectDetailsData.json').pipe(
      map(data => {
        const project = data.projectData?.find(p => p.id?.toString() === id) || null;
        if (project) {
          this.commercialProjects.set(id, project);
          this.cacheService.setCommercialProject(id, project);
        }
        return project;
      }),
      catchError(() => of(null))
    );
  }

  // ============ Preload all project details ============

  preloadAllResidentialProjects(): Observable<Project[]> {
    if (this.residentialDetailsLoaded) {
      return of(Array.from(this.residentialProjects.values()));
    }

    return this.http.get<{projectData: Project[]}>('./assets/data/residential/projectDetails/projectDetailsData.json').pipe(
      map(data => data.projectData || []),
      tap(projects => {
        projects.forEach(p => {
          if (p.id) {
            this.residentialProjects.set(p.id.toString(), p);
            this.cacheService.setResidentialProject(p.id.toString(), p);
          }
        });
        this.residentialDetailsLoaded = true;
      }),
      shareReplay(1),
      catchError(() => of([]))
    );
  }

  preloadAllCommercialProjects(): Observable<Project[]> {
    if (this.commercialDetailsLoaded) {
      return of(Array.from(this.commercialProjects.values()));
    }

    return this.http.get<{projectData: Project[]}>('./assets/data/commercial/projectDetails/projectDetailsData.json').pipe(
      map(data => data.projectData || []),
      tap(projects => {
        projects.forEach(p => {
          if (p.id) {
            this.commercialProjects.set(p.id.toString(), p);
            this.cacheService.setCommercialProject(p.id.toString(), p);
          }
        });
        this.commercialDetailsLoaded = true;
      }),
      shareReplay(1),
      catchError(() => of([]))
    );
  }

  // ============ Admin CRUD (Firestore) ============

  async saveResidentialProject(project: Project): Promise<void> {
    const projectRef = doc(this.firestore, 'residential-projects', project.id);
    await setDoc(projectRef, project, { merge: true });
    this.residentialProjects.set(project.id, project);
    this.cacheService.setResidentialProject(project.id, project);
  }

  async saveCommercialProject(project: Project): Promise<void> {
    const projectRef = doc(this.firestore, 'commercial-projects', project.id);
    await setDoc(projectRef, project, { merge: true });
    this.commercialProjects.set(project.id, project);
    this.cacheService.setCommercialProject(project.id, project);
  }

  async saveResidentialListItem(item: ProjectListItem): Promise<void> {
    const itemRef = doc(this.firestore, 'residential-list', item.id.toString());
    await setDoc(itemRef, item, { merge: true });
    this.cacheService.invalidateResidentialList();
    this.residentialList = null;
  }

  async saveCommercialListItem(item: ProjectListItem): Promise<void> {
    const itemRef = doc(this.firestore, 'commercial-list', item.id.toString());
    await setDoc(itemRef, item, { merge: true });
    this.cacheService.invalidateCommercialList();
    this.commercialList = null;
  }

  async deleteResidentialProject(id: string): Promise<void> {
    const projectRef = doc(this.firestore, 'residential-projects', id);
    const listRef = doc(this.firestore, 'residential-list', id);
    await Promise.all([deleteDoc(projectRef), deleteDoc(listRef)]);
    this.residentialProjects.delete(id);
    this.cacheService.invalidateResidentialProject(id);
    this.residentialList = null;
  }

  async deleteCommercialProject(id: string): Promise<void> {
    const projectRef = doc(this.firestore, 'commercial-projects', id);
    const listRef = doc(this.firestore, 'commercial-list', id);
    await Promise.all([deleteDoc(projectRef), deleteDoc(listRef)]);
    this.commercialProjects.delete(id);
    this.cacheService.invalidateCommercialProject(id);
    this.commercialList = null;
  }

  // ============ Image Upload ============

  uploadImage(file: File, projectType: string, projectId: string, imageName: string): Observable<string> {
    const filePath = `${projectType}/${projectId}/${imageName}`;
    const storageRef = ref(this.storage, filePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Observable(observer => {
      uploadTask.on('state_changed',
        () => {},
        (error) => observer.error(error),
        async () => {
          const downloadUrl = await getDownloadURL(storageRef);
          observer.next(downloadUrl);
          observer.complete();
        }
      );
    });
  }

  deleteImage(imageUrl: string): Observable<void> {
    const storageRef = ref(this.storage, imageUrl);
    return from(deleteObject(storageRef));
  }

  // ============ Migration ============

  async migrateResidentialDataToFirestore(): Promise<void> {
    const listData = await firstValueFrom(this.http.get<{residentialComponent: ProjectListItem[]}>('./assets/data/residential/residentialListData.json'));
    const detailsData = await firstValueFrom(this.http.get<{projectData: Project[]}>('./assets/data/residential/projectDetails/projectDetailsData.json'));

    if (listData?.residentialComponent) {
      for (const item of listData.residentialComponent) {
        await this.saveResidentialListItem(item);
      }
    }

    if (detailsData?.projectData) {
      for (const project of detailsData.projectData) {
        await this.saveResidentialProject(project);
      }
    }
  }

  async migrateCommercialDataToFirestore(): Promise<void> {
    const listData = await firstValueFrom(this.http.get<{commercialComponent: ProjectListItem[]}>('./assets/data/commercial/commercialListData.json'));
    const detailsData = await firstValueFrom(this.http.get<{projectData: Project[]}>('./assets/data/commercial/projectDetails/projectDetailsData.json'));

    if (listData?.commercialComponent) {
      for (const item of listData.commercialComponent) {
        await this.saveCommercialListItem(item);
      }
    }

    if (detailsData?.projectData) {
      for (const project of detailsData.projectData) {
        await this.saveCommercialProject(project);
      }
    }
  }

  // ============ ID Generation ============

  async getNextResidentialId(): Promise<number> {
    if (this.residentialList && this.residentialList.length > 0) {
      return Math.max(...this.residentialList.map(item => Number(item.id) || 0)) + 1;
    }

    const data = await firstValueFrom(this.getResidentialProjects());
    if (data.length > 0) {
      return Math.max(...data.map(item => Number(item.id) || 0)) + 1;
    }
    return 1;
  }

  async getNextCommercialId(): Promise<number> {
    if (this.commercialList && this.commercialList.length > 0) {
      return Math.max(...this.commercialList.map(item => Number(item.id) || 0)) + 1;
    }

    const data = await firstValueFrom(this.getCommercialProjects());
    if (data.length > 0) {
      return Math.max(...data.map(item => Number(item.id) || 0)) + 1;
    }
    return 1;
  }
}
