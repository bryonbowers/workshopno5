import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceMock: any;
  let routerMock: any;

  beforeEach(async () => {
    authServiceMock = {
      user$: of(null),
      signInWithGoogle: jasmine.createSpy('signInWithGoogle').and.returnValue(Promise.resolve({} as any)),
      signOut: jasmine.createSpy('signOut').and.returnValue(Promise.resolve())
    };
    routerMock = {
      navigate: jasmine.createSpy('navigate')
    };

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show login button when no user is logged in', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.btn-google')).toBeTruthy();
  });

  it('should call authService.signInWithGoogle when signInWithGoogle is called', fakeAsync(() => {
    component.signInWithGoogle();
    tick();

    expect(authServiceMock.signInWithGoogle).toHaveBeenCalled();
  }));

  it('should navigate to home after successful login', fakeAsync(() => {
    component.signInWithGoogle();
    tick();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
  }));

  it('should set error message on login failure', fakeAsync(() => {
    const errorMessage = 'Login failed';
    authServiceMock.signInWithGoogle.and.returnValue(Promise.reject({ message: errorMessage }));

    component.signInWithGoogle();
    tick();

    expect(component.error).toBe(errorMessage);
  }));

  it('should set isLoading to true while signing in', () => {
    authServiceMock.signInWithGoogle.and.returnValue(new Promise(() => {}));

    component.signInWithGoogle();

    expect(component.isLoading).toBe(true);
  });

  it('should call authService.signOut when signOut is called', fakeAsync(() => {
    component.signOut();
    tick();

    expect(authServiceMock.signOut).toHaveBeenCalled();
  }));
});

describe('LoginComponent (logged in user)', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  const mockUser = {
    uid: 'test-uid',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: 'https://example.com/photo.jpg'
  };

  beforeEach(async () => {
    const authServiceMock = {
      user$: of(mockUser),
      signInWithGoogle: jasmine.createSpy('signInWithGoogle'),
      signOut: jasmine.createSpy('signOut')
    };

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should show user info when logged in', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.user-info')).toBeTruthy();
  });

  it('should display user name', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.user-name').textContent).toContain('Test User');
  });

  it('should display user email', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.user-email').textContent).toContain('test@example.com');
  });

  it('should show sign out button when logged in', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.btn-signout')).toBeTruthy();
  });
});
