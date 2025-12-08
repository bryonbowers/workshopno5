import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { HeaderComponent } from './header.component';
import { AuthService } from '../services/auth.service';
import { AdminService } from '../services/admin.service';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let authServiceMock: any;
  let adminServiceMock: any;

  beforeEach(async () => {
    authServiceMock = {
      user$: of(null),
      signOut: jasmine.createSpy('signOut').and.returnValue(Promise.resolve())
    };

    adminServiceMock = {
      isAdmin$: of(false)
    };

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [HeaderComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: AdminService, useValue: adminServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have user$ observable from AuthService', () => {
    expect(component.user$).toBeDefined();
  });

  it('should call authService.signOut when signOut is called', () => {
    component.signOut();
    expect(authServiceMock.signOut).toHaveBeenCalled();
  });
});

describe('HeaderComponent (with logged in user)', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  const mockUser = {
    uid: 'test-uid',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: 'https://example.com/photo.jpg'
  };

  beforeEach(async () => {
    const authServiceMock = {
      user$: of(mockUser),
      signOut: jasmine.createSpy('signOut').and.returnValue(Promise.resolve())
    };

    const adminServiceMock = {
      isAdmin$: of(false)
    };

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [HeaderComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: AdminService, useValue: adminServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display user info in template when logged in', (done) => {
    component.user$.subscribe(user => {
      expect(user).toEqual(mockUser);
      done();
    });
  });
});
