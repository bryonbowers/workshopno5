import { Injectable } from '@angular/core';
import { ProjectListItem, Project } from './project.service';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version: number;
}

interface ProjectCache {
  residentialList: CacheEntry<ProjectListItem[]> | null;
  commercialList: CacheEntry<ProjectListItem[]> | null;
  residentialDetails: Map<string, CacheEntry<Project>>;
  commercialDetails: Map<string, CacheEntry<Project>>;
}

const CACHE_KEY = 'ws5_project_cache';
const CACHE_VERSION_KEY = 'ws5_cache_version';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const CURRENT_VERSION = 1;

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private memoryCache: ProjectCache = {
    residentialList: null,
    commercialList: null,
    residentialDetails: new Map(),
    commercialDetails: new Map()
  };

  constructor() {
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage(): void {
    try {
      const version = localStorage.getItem(CACHE_VERSION_KEY);
      if (version !== CURRENT_VERSION.toString()) {
        this.clearAll();
        return;
      }

      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        this.memoryCache.residentialList = parsed.residentialList || null;
        this.memoryCache.commercialList = parsed.commercialList || null;

        // Restore Maps from arrays
        if (parsed.residentialDetails) {
          this.memoryCache.residentialDetails = new Map(parsed.residentialDetails);
        }
        if (parsed.commercialDetails) {
          this.memoryCache.commercialDetails = new Map(parsed.commercialDetails);
        }
      }
    } catch (e) {
      console.warn('Failed to load cache from localStorage:', e);
      this.clearAll();
    }
  }

  private saveToLocalStorage(): void {
    try {
      const toSave = {
        residentialList: this.memoryCache.residentialList,
        commercialList: this.memoryCache.commercialList,
        residentialDetails: Array.from(this.memoryCache.residentialDetails.entries()),
        commercialDetails: Array.from(this.memoryCache.commercialDetails.entries())
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(toSave));
      localStorage.setItem(CACHE_VERSION_KEY, CURRENT_VERSION.toString());
    } catch (e) {
      console.warn('Failed to save cache to localStorage:', e);
    }
  }

  private isValid<T>(entry: CacheEntry<T> | null | undefined): boolean {
    if (!entry) return false;
    return (Date.now() - entry.timestamp) < CACHE_TTL;
  }

  // Residential List
  getResidentialList(): ProjectListItem[] | null {
    if (this.isValid(this.memoryCache.residentialList)) {
      return this.memoryCache.residentialList!.data;
    }
    return null;
  }

  setResidentialList(data: ProjectListItem[]): void {
    this.memoryCache.residentialList = {
      data,
      timestamp: Date.now(),
      version: CURRENT_VERSION
    };
    this.saveToLocalStorage();
  }

  // Commercial List
  getCommercialList(): ProjectListItem[] | null {
    if (this.isValid(this.memoryCache.commercialList)) {
      return this.memoryCache.commercialList!.data;
    }
    return null;
  }

  setCommercialList(data: ProjectListItem[]): void {
    this.memoryCache.commercialList = {
      data,
      timestamp: Date.now(),
      version: CURRENT_VERSION
    };
    this.saveToLocalStorage();
  }

  // Residential Project Details
  getResidentialProject(id: string): Project | null {
    const entry = this.memoryCache.residentialDetails.get(id);
    if (this.isValid(entry)) {
      return entry!.data;
    }
    return null;
  }

  setResidentialProject(id: string, data: Project): void {
    this.memoryCache.residentialDetails.set(id, {
      data,
      timestamp: Date.now(),
      version: CURRENT_VERSION
    });
    this.saveToLocalStorage();
  }

  // Commercial Project Details
  getCommercialProject(id: string): Project | null {
    const entry = this.memoryCache.commercialDetails.get(id);
    if (this.isValid(entry)) {
      return entry!.data;
    }
    return null;
  }

  setCommercialProject(id: string, data: Project): void {
    this.memoryCache.commercialDetails.set(id, {
      data,
      timestamp: Date.now(),
      version: CURRENT_VERSION
    });
    this.saveToLocalStorage();
  }

  // Invalidation methods for admin updates
  invalidateResidentialList(): void {
    this.memoryCache.residentialList = null;
    this.saveToLocalStorage();
  }

  invalidateCommercialList(): void {
    this.memoryCache.commercialList = null;
    this.saveToLocalStorage();
  }

  invalidateResidentialProject(id: string): void {
    this.memoryCache.residentialDetails.delete(id);
    this.memoryCache.residentialList = null; // Also invalidate list
    this.saveToLocalStorage();
  }

  invalidateCommercialProject(id: string): void {
    this.memoryCache.commercialDetails.delete(id);
    this.memoryCache.commercialList = null; // Also invalidate list
    this.saveToLocalStorage();
  }

  invalidateAll(): void {
    this.clearAll();
  }

  private clearAll(): void {
    this.memoryCache = {
      residentialList: null,
      commercialList: null,
      residentialDetails: new Map(),
      commercialDetails: new Map()
    };
    try {
      localStorage.removeItem(CACHE_KEY);
      localStorage.setItem(CACHE_VERSION_KEY, CURRENT_VERSION.toString());
    } catch (e) {
      // Ignore localStorage errors
    }
  }

  // Preload all project details for faster navigation
  preloadResidentialProjects(projects: Project[]): void {
    projects.forEach(project => {
      if (project.id) {
        this.setResidentialProject(project.id.toString(), project);
      }
    });
  }

  preloadCommercialProjects(projects: Project[]): void {
    projects.forEach(project => {
      if (project.id) {
        this.setCommercialProject(project.id.toString(), project);
      }
    });
  }
}
