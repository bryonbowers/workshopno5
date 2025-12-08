import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, setDoc, deleteDoc, collectionData, docData, getDocs, query, orderBy } from '@angular/fire/firestore';
import { Storage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { Observable, from, of, BehaviorSubject } from 'rxjs';
import { map, tap, catchError, shareReplay, switchMap } from 'rxjs/operators';
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

export interface ProjectWithListData extends Project {
  listData: ProjectListItem;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private firestore = inject(Firestore);
  private storage = inject(Storage);
  private http = inject(HttpClient);
  private cacheService = inject(CacheService);

  // In-memory observables for reactive updates
  private residentialList$ = new BehaviorSubject<ProjectListItem[] | null>(null);
  private commercialList$ = new BehaviorSubject<ProjectListItem[] | null>(null);
  private allResidentialProjects$ = new BehaviorSubject<Project[] | null>(null);
  private allCommercialProjects$ = new BehaviorSubject<Project[] | null>(null);

  private residentialListLoading = false;
  private commercialListLoading = false;
  private residentialDetailsLoading = false;
  private commercialDetailsLoading = false;

  constructor() {
    // Initialize from cache
    const cachedResList = this.cacheService.getResidentialList();
    if (cachedResList) {
      this.residentialList$.next(cachedResList);
    }
    const cachedComList = this.cacheService.getCommercialList();
    if (cachedComList) {
      this.commercialList$.next(cachedComList);
    }
  }

  // ============ PUBLIC API - Fast cached reads ============

  getResidentialProjects(): Observable<ProjectListItem[]> {
    // Return cached data immediately if available
    const cached = this.cacheService.getResidentialList();
    if (cached) {
      // Still fetch in background to update cache
      this.fetchResidentialListFromFirestore();
      return of(cached);
    }

    // No cache, fetch from Firestore
    return this.fetchResidentialListFromFirestore();
  }

  getCommercialProjects(): Observable<ProjectListItem[]> {
    const cached = this.cacheService.getCommercialList();
    if (cached) {
      this.fetchCommercialListFromFirestore();
      return of(cached);
    }
    return this.fetchCommercialListFromFirestore();
  }

  getResidentialProjectDetails(id: string): Observable<Project | null> {
    // Check memory cache first
    const cached = this.cacheService.getResidentialProject(id);
    if (cached) {
      // Fetch in background to keep fresh
      this.fetchResidentialProjectFromFirestore(id).subscribe();
      return of(cached);
    }

    return this.fetchResidentialProjectFromFirestore(id);
  }

  getCommercialProjectDetails(id: string): Observable<Project | null> {
    const cached = this.cacheService.getCommercialProject(id);
    if (cached) {
      this.fetchCommercialProjectFromFirestore(id).subscribe();
      return of(cached);
    }

    return this.fetchCommercialProjectFromFirestore(id);
  }

  // ============ Preload all projects for instant navigation ============

  preloadAllResidentialProjects(): Observable<Project[]> {
    if (this.allResidentialProjects$.value) {
      return of(this.allResidentialProjects$.value);
    }

    if (this.residentialDetailsLoading) {
      return this.allResidentialProjects$.asObservable().pipe(
        switchMap(v => v ? of(v) : of([]))
      );
    }

    this.residentialDetailsLoading = true;

    const residentialRef = collection(this.firestore, 'residential-projects');
    return collectionData(residentialRef).pipe(
      map(data => data as Project[]),
      tap(projects => {
        this.allResidentialProjects$.next(projects);
        this.cacheService.preloadResidentialProjects(projects);
        this.residentialDetailsLoading = false;
      }),
      catchError(err => {
        console.error('Error preloading residential projects:', err);
        this.residentialDetailsLoading = false;
        // Fallback to JSON
        return this.loadResidentialProjectsFromJson();
      }),
      shareReplay(1)
    );
  }

  preloadAllCommercialProjects(): Observable<Project[]> {
    if (this.allCommercialProjects$.value) {
      return of(this.allCommercialProjects$.value);
    }

    if (this.commercialDetailsLoading) {
      return this.allCommercialProjects$.asObservable().pipe(
        switchMap(v => v ? of(v) : of([]))
      );
    }

    this.commercialDetailsLoading = true;

    const commercialRef = collection(this.firestore, 'commercial-projects');
    return collectionData(commercialRef).pipe(
      map(data => data as Project[]),
      tap(projects => {
        this.allCommercialProjects$.next(projects);
        this.cacheService.preloadCommercialProjects(projects);
        this.commercialDetailsLoading = false;
      }),
      catchError(err => {
        console.error('Error preloading commercial projects:', err);
        this.commercialDetailsLoading = false;
        return this.loadCommercialProjectsFromJson();
      }),
      shareReplay(1)
    );
  }

  // ============ Private Firestore fetchers ============

  private fetchResidentialListFromFirestore(): Observable<ProjectListItem[]> {
    if (this.residentialListLoading) {
      return this.residentialList$.asObservable().pipe(
        switchMap(v => v ? of(v) : of([]))
      );
    }

    this.residentialListLoading = true;

    const residentialListRef = collection(this.firestore, 'residential-list');
    return collectionData(residentialListRef).pipe(
      map(data => data as ProjectListItem[]),
      tap(projects => {
        this.residentialList$.next(projects);
        this.cacheService.setResidentialList(projects);
        this.residentialListLoading = false;
      }),
      catchError(err => {
        console.error('Firestore error, falling back to JSON:', err);
        this.residentialListLoading = false;
        return this.loadResidentialListFromJson();
      }),
      shareReplay(1)
    );
  }

  private fetchCommercialListFromFirestore(): Observable<ProjectListItem[]> {
    if (this.commercialListLoading) {
      return this.commercialList$.asObservable().pipe(
        switchMap(v => v ? of(v) : of([]))
      );
    }

    this.commercialListLoading = true;

    const commercialListRef = collection(this.firestore, 'commercial-list');
    return collectionData(commercialListRef).pipe(
      map(data => data as ProjectListItem[]),
      tap(projects => {
        this.commercialList$.next(projects);
        this.cacheService.setCommercialList(projects);
        this.commercialListLoading = false;
      }),
      catchError(err => {
        console.error('Firestore error, falling back to JSON:', err);
        this.commercialListLoading = false;
        return this.loadCommercialListFromJson();
      }),
      shareReplay(1)
    );
  }

  private fetchResidentialProjectFromFirestore(id: string): Observable<Project | null> {
    const projectRef = doc(this.firestore, 'residential-projects', id);
    return docData(projectRef).pipe(
      map(data => data as Project | null),
      tap(project => {
        if (project) {
          this.cacheService.setResidentialProject(id, project);
        }
      }),
      catchError(err => {
        console.error('Error fetching residential project:', err);
        return this.loadResidentialProjectFromJson(id);
      })
    );
  }

  private fetchCommercialProjectFromFirestore(id: string): Observable<Project | null> {
    const projectRef = doc(this.firestore, 'commercial-projects', id);
    return docData(projectRef).pipe(
      map(data => data as Project | null),
      tap(project => {
        if (project) {
          this.cacheService.setCommercialProject(id, project);
        }
      }),
      catchError(err => {
        console.error('Error fetching commercial project:', err);
        return this.loadCommercialProjectFromJson(id);
      })
    );
  }

  // ============ JSON Fallbacks ============

  private loadResidentialListFromJson(): Observable<ProjectListItem[]> {
    return this.http.get<{residentialComponent: ProjectListItem[]}>('./assets/data/residential/residentialListData.json').pipe(
      map(data => data.residentialComponent || []),
      tap(projects => {
        this.residentialList$.next(projects);
        this.cacheService.setResidentialList(projects);
      }),
      catchError(() => of([]))
    );
  }

  private loadCommercialListFromJson(): Observable<ProjectListItem[]> {
    return this.http.get<{commercialComponent: ProjectListItem[]}>('./assets/data/commercial/commercialListData.json').pipe(
      map(data => data.commercialComponent || []),
      tap(projects => {
        this.commercialList$.next(projects);
        this.cacheService.setCommercialList(projects);
      }),
      catchError(() => of([]))
    );
  }

  private loadResidentialProjectFromJson(id: string): Observable<Project | null> {
    return this.http.get<{projectData: Project[]}>('./assets/data/residential/projectDetails/projectDetailsData.json').pipe(
      map(data => data.projectData?.find(p => p.id?.toString() === id) || null),
      tap(project => {
        if (project) {
          this.cacheService.setResidentialProject(id, project);
        }
      }),
      catchError(() => of(null))
    );
  }

  private loadCommercialProjectFromJson(id: string): Observable<Project | null> {
    return this.http.get<{projectData: Project[]}>('./assets/data/commercial/projectDetails/projectDetailsData.json').pipe(
      map(data => data.projectData?.find(p => p.id?.toString() === id) || null),
      tap(project => {
        if (project) {
          this.cacheService.setCommercialProject(id, project);
        }
      }),
      catchError(() => of(null))
    );
  }

  private loadResidentialProjectsFromJson(): Observable<Project[]> {
    return this.http.get<{projectData: Project[]}>('./assets/data/residential/projectDetails/projectDetailsData.json').pipe(
      map(data => data.projectData || []),
      tap(projects => {
        this.allResidentialProjects$.next(projects);
        this.cacheService.preloadResidentialProjects(projects);
      }),
      catchError(() => of([]))
    );
  }

  private loadCommercialProjectsFromJson(): Observable<Project[]> {
    return this.http.get<{projectData: Project[]}>('./assets/data/commercial/projectDetails/projectDetailsData.json').pipe(
      map(data => data.projectData || []),
      tap(projects => {
        this.allCommercialProjects$.next(projects);
        this.cacheService.preloadCommercialProjects(projects);
      }),
      catchError(() => of([]))
    );
  }

  // ============ Admin CRUD Operations ============

  async saveResidentialProject(project: Project): Promise<void> {
    const projectRef = doc(this.firestore, 'residential-projects', project.id);
    await setDoc(projectRef, project, { merge: true });
    // Invalidate cache
    this.cacheService.invalidateResidentialProject(project.id);
    this.allResidentialProjects$.next(null);
  }

  async saveCommercialProject(project: Project): Promise<void> {
    const projectRef = doc(this.firestore, 'commercial-projects', project.id);
    await setDoc(projectRef, project, { merge: true });
    this.cacheService.invalidateCommercialProject(project.id);
    this.allCommercialProjects$.next(null);
  }

  async saveResidentialListItem(item: ProjectListItem): Promise<void> {
    const itemRef = doc(this.firestore, 'residential-list', item.id.toString());
    await setDoc(itemRef, item, { merge: true });
    this.cacheService.invalidateResidentialList();
    this.residentialList$.next(null);
  }

  async saveCommercialListItem(item: ProjectListItem): Promise<void> {
    const itemRef = doc(this.firestore, 'commercial-list', item.id.toString());
    await setDoc(itemRef, item, { merge: true });
    this.cacheService.invalidateCommercialList();
    this.commercialList$.next(null);
  }

  async deleteResidentialProject(id: string): Promise<void> {
    const projectRef = doc(this.firestore, 'residential-projects', id);
    const listRef = doc(this.firestore, 'residential-list', id);
    await Promise.all([
      deleteDoc(projectRef),
      deleteDoc(listRef)
    ]);
    this.cacheService.invalidateResidentialProject(id);
    this.residentialList$.next(null);
    this.allResidentialProjects$.next(null);
  }

  async deleteCommercialProject(id: string): Promise<void> {
    const projectRef = doc(this.firestore, 'commercial-projects', id);
    const listRef = doc(this.firestore, 'commercial-list', id);
    await Promise.all([
      deleteDoc(projectRef),
      deleteDoc(listRef)
    ]);
    this.cacheService.invalidateCommercialProject(id);
    this.commercialList$.next(null);
    this.allCommercialProjects$.next(null);
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

  // ============ Migration helpers ============

  async migrateResidentialDataToFirestore(): Promise<void> {
    const listData = await firstValueFrom(this.http.get<{residentialComponent: ProjectListItem[]}>('./assets/data/residential/residentialListData.json'));
    const detailsData = await firstValueFrom(this.http.get<{projectData: Project[]}>('./assets/data/residential/projectDetails/projectDetailsData.json'));

    if (listData) {
      for (const item of listData.residentialComponent) {
        await this.saveResidentialListItem(item);
      }
    }

    if (detailsData) {
      for (const project of detailsData.projectData) {
        await this.saveResidentialProject(project);
      }
    }

    // Clear cache after migration
    this.cacheService.invalidateAll();
  }

  async migrateCommercialDataToFirestore(): Promise<void> {
    const listData = await firstValueFrom(this.http.get<{commercialComponent: ProjectListItem[]}>('./assets/data/commercial/commercialListData.json'));
    const detailsData = await firstValueFrom(this.http.get<{projectData: Project[]}>('./assets/data/commercial/projectDetails/projectDetailsData.json'));

    if (listData) {
      for (const item of listData.commercialComponent) {
        await this.saveCommercialListItem(item);
      }
    }

    if (detailsData) {
      for (const project of detailsData.projectData) {
        await this.saveCommercialProject(project);
      }
    }

    this.cacheService.invalidateAll();
  }

  // ============ ID Generation ============

  async getNextResidentialId(): Promise<number> {
    // Try from cache first
    const cached = this.cacheService.getResidentialList();
    if (cached && cached.length > 0) {
      const maxId = Math.max(...cached.map(item =>
        typeof item.id === 'number' ? item.id : parseInt(item.id as unknown as string, 10) || 0
      ));
      return maxId + 1;
    }

    // Fall back to Firestore query
    const residentialListRef = collection(this.firestore, 'residential-list');
    const querySnapshot = await getDocs(residentialListRef);
    if (querySnapshot.empty) {
      return 1;
    }
    const maxId = Math.max(...querySnapshot.docs.map(doc => {
      const data = doc.data() as ProjectListItem;
      return typeof data.id === 'number' ? data.id : parseInt(data.id as unknown as string, 10) || 0;
    }));
    return maxId + 1;
  }

  async getNextCommercialId(): Promise<number> {
    const cached = this.cacheService.getCommercialList();
    if (cached && cached.length > 0) {
      const maxId = Math.max(...cached.map(item =>
        typeof item.id === 'number' ? item.id : parseInt(item.id as unknown as string, 10) || 0
      ));
      return maxId + 1;
    }

    const commercialListRef = collection(this.firestore, 'commercial-list');
    const querySnapshot = await getDocs(commercialListRef);
    if (querySnapshot.empty) {
      return 1;
    }
    const maxId = Math.max(...querySnapshot.docs.map(doc => {
      const data = doc.data() as ProjectListItem;
      return typeof data.id === 'number' ? data.id : parseInt(data.id as unknown as string, 10) || 0;
    }));
    return maxId + 1;
  }
}
