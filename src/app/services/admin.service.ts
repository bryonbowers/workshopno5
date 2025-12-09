import { Injectable } from '@angular/core';
import { Firestore, collection, doc, setDoc, deleteDoc, onSnapshot, query, where, Timestamp, getDoc } from '@angular/fire/firestore';
import { AuthService, User } from './auth.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

export interface UserRole {
  uid: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  displayName?: string;
  createdAt?: Date;
}

export interface ActiveSession {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: 'admin' | 'editor' | 'viewer';
  lastActive: Date;
  loginTime: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  // Fallback admin emails (used if Firestore roles not set up)
  private adminEmails = [
    'vani@workshopno5.com',
    'bryon.bowers@gmail.com'
  ];

  isAdmin$: Observable<boolean>;

  private activeUsersSubject = new BehaviorSubject<ActiveSession[]>([]);
  activeUsers$ = this.activeUsersSubject.asObservable();

  private currentUserRole: 'admin' | 'editor' | 'viewer' | null = null;
  private sessionUnsubscribe: (() => void) | null = null;

  constructor(
    private authService: AuthService,
    private firestore: Firestore
  ) {
    this.isAdmin$ = this.authService.user$.pipe(
      map(user => {
        if (!user || !user.email) {
          return false;
        }
        // Check hardcoded admin emails as fallback
        return this.adminEmails.includes(user.email.toLowerCase());
      })
    );

    // Subscribe to auth changes to manage sessions
    this.authService.user$.subscribe(user => {
      if (user) {
        this.registerUserSession(user);
        this.loadUserRole(user.uid);
      } else {
        this.clearUserSession();
      }
    });

    // Listen for active sessions
    this.listenToActiveSessions();
  }

  private async loadUserRole(uid: string): Promise<void> {
    try {
      const roleDoc = await getDoc(doc(this.firestore, 'user-roles', uid));
      if (roleDoc.exists()) {
        const data = roleDoc.data() as UserRole;
        this.currentUserRole = data.role;
      } else {
        // Check if user is in admin emails list
        const user = this.authService.getCurrentUser();
        if (user?.email && this.adminEmails.includes(user.email.toLowerCase())) {
          this.currentUserRole = 'admin';
          // Auto-create admin role in Firestore
          await this.setUserRole(uid, user.email, 'admin', user.displayName || undefined);
        } else {
          this.currentUserRole = 'viewer';
        }
      }
    } catch (error) {
      console.error('Error loading user role:', error);
      // Fallback to email check
      const user = this.authService.getCurrentUser();
      if (user?.email && this.adminEmails.includes(user.email.toLowerCase())) {
        this.currentUserRole = 'admin';
      }
    }
  }

  async setUserRole(uid: string, email: string, role: 'admin' | 'editor' | 'viewer', displayName?: string): Promise<void> {
    const roleRef = doc(this.firestore, 'user-roles', uid);
    await setDoc(roleRef, {
      uid,
      email: email.toLowerCase(),
      role,
      displayName: displayName || null,
      createdAt: Timestamp.now()
    }, { merge: true });
  }

  private async registerUserSession(user: User): Promise<void> {
    if (!user.uid) return;

    try {
      const sessionRef = doc(this.firestore, 'active-sessions', user.uid);

      // Determine role
      let role: 'admin' | 'editor' | 'viewer' = 'viewer';
      if (user.email && this.adminEmails.includes(user.email.toLowerCase())) {
        role = 'admin';
      }

      await setDoc(sessionRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role,
        lastActive: Timestamp.now(),
        loginTime: Timestamp.now()
      });

      // Update lastActive every 30 seconds
      this.startHeartbeat(user);
    } catch (error) {
      console.error('Error registering session:', error);
    }
  }

  private heartbeatInterval: any = null;

  private startHeartbeat(user: User): void {
    // Clear any existing heartbeat
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(async () => {
      try {
        const sessionRef = doc(this.firestore, 'active-sessions', user.uid);
        await setDoc(sessionRef, {
          lastActive: Timestamp.now()
        }, { merge: true });
      } catch (error) {
        console.error('Heartbeat error:', error);
      }
    }, 30000); // Every 30 seconds
  }

  private async clearUserSession(): Promise<void> {
    const user = this.authService.getCurrentUser();
    if (user?.uid) {
      try {
        const sessionRef = doc(this.firestore, 'active-sessions', user.uid);
        await deleteDoc(sessionRef);
      } catch (error) {
        console.error('Error clearing session:', error);
      }
    }

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    this.currentUserRole = null;
  }

  private listenToActiveSessions(): void {
    try {
      const sessionsRef = collection(this.firestore, 'active-sessions');

      this.sessionUnsubscribe = onSnapshot(sessionsRef, (snapshot) => {
        const sessions: ActiveSession[] = [];
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

        snapshot.forEach((doc) => {
          const data = doc.data();
          const lastActive = data['lastActive']?.toDate() || new Date();

          // Only include sessions active in the last 5 minutes
          if (lastActive > fiveMinutesAgo) {
            sessions.push({
              uid: data['uid'],
              email: data['email'],
              displayName: data['displayName'],
              photoURL: data['photoURL'],
              role: data['role'] || 'viewer',
              lastActive,
              loginTime: data['loginTime']?.toDate() || lastActive
            });
          }
        });

        // Sort by login time (most recent first)
        sessions.sort((a, b) => b.loginTime.getTime() - a.loginTime.getTime());
        this.activeUsersSubject.next(sessions);
      }, (error) => {
        console.error('Error listening to active sessions:', error);
      });
    } catch (error) {
      console.error('Error setting up session listener:', error);
    }
  }

  isAdminEmail(email: string): boolean {
    return this.adminEmails.includes(email.toLowerCase());
  }

  getCurrentUserRole(): 'admin' | 'editor' | 'viewer' | null {
    return this.currentUserRole;
  }

  ngOnDestroy(): void {
    if (this.sessionUnsubscribe) {
      this.sessionUnsubscribe();
    }
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
  }
}
