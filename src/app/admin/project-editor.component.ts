import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { AdminService } from '../services/admin.service';
import { ProjectService, Project, ProjectListItem } from '../services/project.service';
import { CacheService } from '../services/cache.service';
import { Storage, ref, uploadBytesResumable, getDownloadURL } from '@angular/fire/storage';

// Image optimization settings
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1080;
const THUMBNAIL_WIDTH = 800;
const QUALITY = 0.85;

@Component({
  selector: 'app-project-editor',
  templateUrl: './project-editor.component.html',
  styleUrls: ['./project-editor.component.scss']
})
export class ProjectEditorComponent implements OnInit {
  private storage = inject(Storage);

  isAdmin$: Observable<boolean>;
  projectType: 'residential' | 'commercial' = 'residential';
  projectId: string | null = null;
  isNewProject = false;
  isLoading = false;
  isSaving = false;
  uploadProgress: number | null = null;
  uploadStatus: string = '';

  projectForm: FormGroup;
  listForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private adminService: AdminService,
    private projectService: ProjectService,
    private cacheService: CacheService
  ) {
    this.isAdmin$ = this.adminService.isAdmin$;

    this.projectForm = this.fb.group({
      id: [''],
      projectName: [''],
      mainImageUrl: [''],
      mainImageUrlFull: [''],
      photos_soon: [false],
      archive: [false],
      projectdescription: this.fb.array([]),
      projectPersons: this.fb.array([]),
      projectDetails: this.fb.array([])
    });

    this.listForm = this.fb.group({
      id: [0],
      name: [''],
      url: [''],
      summary: [''],
      subtitle: [''],
      show: [true],
      photos_soon: [false],
      archive: [false]
    });
  }

  ngOnInit(): void {
    this.isAdmin$.pipe(take(1)).subscribe(isAdmin => {
      if (!isAdmin) {
        this.router.navigate(['/admin']);
        return;
      }

      this.route.params.subscribe(params => {
        this.projectType = params['type'] || 'residential';
        this.projectId = params['id'] || null;
        this.isNewProject = !this.projectId;

        if (this.isNewProject) {
          this.initNewProject();
        } else {
          this.loadProject();
        }
      });
    });
  }

  get descriptionArray(): FormArray {
    return this.projectForm.get('projectdescription') as FormArray;
  }

  get personsArray(): FormArray {
    return this.projectForm.get('projectPersons') as FormArray;
  }

  get detailsArray(): FormArray {
    return this.projectForm.get('projectDetails') as FormArray;
  }

  async initNewProject(): Promise<void> {
    this.isLoading = true;

    // Get next ID from cached service
    const nextId = this.projectType === 'residential'
      ? await this.projectService.getNextResidentialId()
      : await this.projectService.getNextCommercialId();

    this.projectForm.patchValue({ id: nextId.toString() });
    this.listForm.patchValue({ id: nextId });
    this.addDescription();
    this.addPerson();
    this.isLoading = false;
  }

  loadProject(): void {
    if (!this.projectId) return;

    this.isLoading = true;

    // Try cache first for instant load
    const cachedProject = this.projectType === 'residential'
      ? this.cacheService.getResidentialProject(this.projectId)
      : this.cacheService.getCommercialProject(this.projectId);

    if (cachedProject) {
      this.populateProjectForm(cachedProject);
    }

    // Load project details from service (will use cache or fetch from Firestore/JSON)
    const projectObs = this.projectType === 'residential'
      ? this.projectService.getResidentialProjectDetails(this.projectId)
      : this.projectService.getCommercialProjectDetails(this.projectId);

    projectObs.pipe(take(1)).subscribe(project => {
      if (project) {
        this.populateProjectForm(project);
      }
      this.isLoading = false;
    });

    // Load list data
    const listObs = this.projectType === 'residential'
      ? this.projectService.getResidentialProjects()
      : this.projectService.getCommercialProjects();

    listObs.pipe(take(1)).subscribe(projects => {
      const listItem = projects.find(p => p.id?.toString() === this.projectId);
      if (listItem) {
        this.listForm.patchValue({
          id: listItem.id,
          name: listItem.name,
          url: listItem.url,
          summary: listItem.summary,
          subtitle: listItem.subtitle || '',
          show: listItem.show,
          photos_soon: listItem.photos_soon || false,
          archive: listItem.archive || false
        });
      }
    });
  }

  private populateProjectForm(project: Project): void {
    this.projectForm.patchValue({
      id: project.id,
      projectName: project.projectName,
      mainImageUrl: project.mainImageUrl,
      mainImageUrlFull: project.mainImageUrlFull || '',
      photos_soon: project.photos_soon || false,
      archive: project.archive || false
    });

    // Clear and populate arrays
    this.descriptionArray.clear();
    (project.projectdescription || []).forEach(desc => {
      this.descriptionArray.push(this.fb.control(desc));
    });

    this.personsArray.clear();
    (project.projectPersons || []).forEach(person => {
      this.personsArray.push(this.fb.group({
        name: [person.name],
        position: [person.position]
      }));
    });

    this.detailsArray.clear();
    (project.projectDetails || []).forEach(detail => {
      this.detailsArray.push(this.fb.group({
        url: [detail.url],
        name: [detail.name],
        show: [detail.show],
        full: [detail.full || '']
      }));
    });
  }

  addDescription(): void {
    this.descriptionArray.push(this.fb.control(''));
  }

  removeDescription(index: number): void {
    this.descriptionArray.removeAt(index);
  }

  addPerson(): void {
    this.personsArray.push(this.fb.group({
      name: [''],
      position: ['']
    }));
  }

  removePerson(index: number): void {
    this.personsArray.removeAt(index);
  }

  addDetail(): void {
    this.detailsArray.push(this.fb.group({
      url: [''],
      name: [''],
      show: [false],
      full: ['']
    }));
  }

  removeDetail(index: number): void {
    this.detailsArray.removeAt(index);
  }

  async onMainImageSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;

    const file = input.files[0];
    await this.uploadImage(file, 'main');
  }

  async onDetailImageSelected(event: Event, index: number): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;

    const file = input.files[0];
    await this.uploadImage(file, 'detail', index);
  }

  async onListImageSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;

    const file = input.files[0];
    await this.uploadImage(file, 'list');
  }

  private async uploadImage(file: File, type: 'main' | 'detail' | 'list', detailIndex?: number): Promise<void> {
    const projectId = this.projectForm.get('id')?.value || 'new';
    const timestamp = Date.now();

    this.uploadStatus = 'Optimizing image...';
    this.uploadProgress = 0;

    try {
      // Optimize the image before upload
      const optimizedBlob = await this.optimizeImage(file, type === 'list' ? THUMBNAIL_WIDTH : MAX_WIDTH);
      const optimizedFile = new File([optimizedBlob], file.name, { type: 'image/jpeg' });

      // Also create a full-resolution version for lightbox
      let fullResBlob: Blob | null = null;
      if (type === 'main' || type === 'detail') {
        fullResBlob = await this.optimizeImage(file, 2400, 0.9);
      }

      this.uploadStatus = 'Uploading...';

      // Upload optimized version
      const filePath = `${this.projectType}/${projectId}/${type}-${timestamp}.jpg`;
      const storageRef = ref(this.storage, filePath);
      const uploadTask = uploadBytesResumable(storageRef, optimizedFile);

      uploadTask.on('state_changed',
        (snapshot) => {
          this.uploadProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        },
        (error) => {
          console.error('Upload error:', error);
          this.uploadProgress = null;
          this.uploadStatus = '';
        },
        async () => {
          const downloadUrl = await getDownloadURL(storageRef);

          // Upload full resolution version if applicable
          let fullResUrl = '';
          if (fullResBlob && (type === 'main' || type === 'detail')) {
            this.uploadStatus = 'Uploading full resolution...';
            const fullResPath = `${this.projectType}/${projectId}/${type}-full-${timestamp}.jpg`;
            const fullResRef = ref(this.storage, fullResPath);
            await uploadBytesResumable(fullResRef, fullResBlob);
            fullResUrl = await getDownloadURL(fullResRef);
          }

          this.uploadProgress = null;
          this.uploadStatus = '';

          if (type === 'main') {
            this.projectForm.patchValue({
              mainImageUrl: downloadUrl,
              mainImageUrlFull: fullResUrl || downloadUrl
            });
          } else if (type === 'list') {
            this.listForm.patchValue({ url: downloadUrl });
          } else if (type === 'detail' && detailIndex !== undefined) {
            const details = this.detailsArray.at(detailIndex);
            details.patchValue({
              url: downloadUrl,
              full: fullResUrl || downloadUrl
            });
          }
        }
      );
    } catch (error) {
      console.error('Image optimization error:', error);
      this.uploadProgress = null;
      this.uploadStatus = '';
      alert('Error processing image. Please try again.');
    }
  }

  // Optimize image by resizing and compressing
  private optimizeImage(file: File, maxWidth: number, quality: number = QUALITY): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        let { width, height } = img;

        // Calculate new dimensions maintaining aspect ratio
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        // Ensure height doesn't exceed max
        if (height > MAX_HEIGHT) {
          width = (width * MAX_HEIGHT) / height;
          height = MAX_HEIGHT;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw with smoothing for better quality
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to create blob'));
              }
            },
            'image/jpeg',
            quality
          );
        } else {
          reject(new Error('Failed to get canvas context'));
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  async save(): Promise<void> {
    this.isSaving = true;

    const projectData: Project = {
      id: this.projectForm.get('id')?.value,
      projectName: this.projectForm.get('projectName')?.value,
      mainImageUrl: this.projectForm.get('mainImageUrl')?.value,
      mainImageUrlFull: this.projectForm.get('mainImageUrlFull')?.value,
      photos_soon: this.projectForm.get('photos_soon')?.value,
      archive: this.projectForm.get('archive')?.value,
      projectdescription: this.descriptionArray.value,
      projectPersons: this.personsArray.value,
      projectDetails: this.detailsArray.value
    };

    const listData: ProjectListItem = {
      id: this.listForm.get('id')?.value,
      name: this.listForm.get('name')?.value || this.projectForm.get('projectName')?.value,
      url: this.listForm.get('url')?.value || this.projectForm.get('mainImageUrl')?.value,
      summary: this.listForm.get('summary')?.value,
      show: this.listForm.get('show')?.value,
      subtitle: this.listForm.get('subtitle')?.value,
      photos_soon: this.listForm.get('photos_soon')?.value,
      archive: this.listForm.get('archive')?.value
    };

    try {
      if (this.projectType === 'residential') {
        await this.projectService.saveResidentialProject(projectData);
        await this.projectService.saveResidentialListItem(listData);
      } else {
        await this.projectService.saveCommercialProject(projectData);
        await this.projectService.saveCommercialListItem(listData);
      }
      this.router.navigate(['/admin']);
    } catch (error) {
      alert('Error saving project. Please try again.');
    }

    this.isSaving = false;
  }

  cancel(): void {
    this.router.navigate(['/admin']);
  }
}
