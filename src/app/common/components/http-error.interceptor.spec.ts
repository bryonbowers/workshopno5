import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { HttpErrorInterceptor } from './http-error.interceptor';

describe('HttpErrorInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: HttpErrorInterceptor,
          multi: true
        }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should retry failed requests once', () => {
    let errorOccurred = false;

    httpClient.get('/api/test').subscribe({
      next: () => fail('should have failed'),
      error: () => {
        errorOccurred = true;
      }
    });

    // First request fails
    const req1 = httpTestingController.expectOne('/api/test');
    req1.flush('Error', { status: 500, statusText: 'Server Error' });

    // Retry request also fails - this verifies retry happened
    const req2 = httpTestingController.expectOne('/api/test');
    req2.flush('Error', { status: 500, statusText: 'Server Error' });

    expect(errorOccurred).toBe(true);
  });

  it('should pass through successful requests', () => {
    const testData = { message: 'success' };
    let responseData: any;

    httpClient.get('/api/test').subscribe({
      next: (data) => {
        responseData = data;
      }
    });

    const req = httpTestingController.expectOne('/api/test');
    req.flush(testData);

    expect(responseData).toEqual(testData);
  });

  it('should succeed on retry if second request succeeds', () => {
    const testData = { message: 'success' };
    let responseData: any;

    httpClient.get('/api/test').subscribe({
      next: (data) => {
        responseData = data;
      }
    });

    // First request fails
    const req1 = httpTestingController.expectOne('/api/test');
    req1.flush('Error', { status: 500, statusText: 'Server Error' });

    // Retry succeeds
    const req2 = httpTestingController.expectOne('/api/test');
    req2.flush(testData);

    expect(responseData).toEqual(testData);
  });
});
