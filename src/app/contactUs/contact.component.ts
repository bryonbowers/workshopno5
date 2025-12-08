import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { NgForm } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { environment } from '../../environments/environment';

declare var grecaptcha: any;

@Component({
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class ContactUsComponent implements AfterViewInit {
  @ViewChild('contactForm') contactForm: NgForm;

  formLoadTime: number = Date.now();
  honeypot: string = '';
  recaptchaToken: string = '';
  showRecaptchaError: boolean = false;
  isSubmitting: boolean = false;
  formSubmitted: boolean = false;
  formError: string = '';

  formData = {
    name: '',
    phone: '',
    email: '',
    requestType: '',
    howdYouHear: '',
    description: '',
    whenToBegin: '',
    workedWithArchitect: ''
  };

  constructor(
    private http: HttpClient,
    private spinner: NgxSpinnerService,
    public router: Router,
    public meta: Meta,
    public title: Title
  ) {
    title.setTitle('Contact or Schedule Consultation | Workshop No. 5');
    meta.updateTag({ name: 'title', content: 'Contact or Schedule Consultation | Workshop No. 5' });
    meta.updateTag({ property: 'og:title', content: 'Contact or Schedule Consultation | Workshop No. 5' });

    meta.updateTag({ name: 'description', content: 'Talk to us about your residential or commercial project. Schedule a free consultation with our team.' });
    meta.updateTag({ property: 'og:description', content: 'Talk to us about your residential or commercial project. Schedule a free consultation with our team.' });

    meta.updateTag({ name: 'robots', content: 'INDEX, FOLLOW' });
    meta.updateTag({ name: 'author', content: 'Workshop No5' });
    meta.updateTag({ name: 'keywords', content: 'Contact, Architecture Services, Residential, Commercial, Office Space, Austin Architect, Workshop No5' });

    meta.updateTag({ property: 'og:type', content: 'website' });
    meta.updateTag({ property: 'og:image', content: '/assets/featured/contact-workshop-no-5.jpg' });

    // Set up global reCAPTCHA callbacks
    (window as any).onRecaptchaSuccess = (token: string) => {
      this.onRecaptchaSuccess(token);
    };

    (window as any).onRecaptchaExpired = () => {
      this.onRecaptchaExpired();
    };
  }

  ngAfterViewInit() {
    this.formLoadTime = Date.now();
  }

  onRecaptchaSuccess(token: string) {
    this.recaptchaToken = token;
    this.showRecaptchaError = false;
  }

  onRecaptchaExpired() {
    this.recaptchaToken = '';
  }

  resetForm() {
    this.formSubmitted = false;
    this.formError = '';
    this.formData = {
      name: '',
      phone: '',
      email: '',
      requestType: '',
      howdYouHear: '',
      description: '',
      whenToBegin: '',
      workedWithArchitect: ''
    };
    this.recaptchaToken = '';
    this.formLoadTime = Date.now();

    // Reset reCAPTCHA
    if (typeof grecaptcha !== 'undefined') {
      grecaptcha.reset();
    }
  }

  onSubmit(e: Event) {
    e.preventDefault();
    this.formError = '';
    this.showRecaptchaError = false;

    // Mark all fields as touched to show validation
    Object.keys(this.contactForm.controls).forEach(key => {
      this.contactForm.controls[key].markAsTouched();
    });

    // Bot detection checks
    const currentTime = Date.now();
    const timeOnPage = currentTime - this.formLoadTime;

    // Check 1: Honeypot field must be empty
    if (this.honeypot && this.honeypot.length > 0) {
      this.formError = 'There was an error submitting your request. Please try again.';
      return;
    }

    // Check 2: Form must be on screen for at least 3 seconds
    if (timeOnPage < 3000) {
      this.formError = 'Please take a moment to review your submission before sending.';
      return;
    }

    // Check 3: User must complete reCAPTCHA
    if (!this.recaptchaToken || this.recaptchaToken.length === 0) {
      this.showRecaptchaError = true;
      return;
    }

    // Check form validity
    if (this.contactForm.invalid) {
      this.formError = 'Please fill in all required fields.';
      return;
    }

    // Submit form
    this.isSubmitting = true;

    const model = {
      yourName: this.formData.name,
      phone: this.formData.phone,
      email: this.formData.email,
      requestType: this.formData.requestType,
      howdYouHear: this.formData.howdYouHear,
      description: this.formData.description,
      whenToBegin: this.formData.whenToBegin,
      workedWithArchitect: this.formData.workedWithArchitect,
      recaptchaToken: this.recaptchaToken,
      timeOnPage: timeOnPage
    };

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${environment.functionSecretKey}`
      })
    };

    // Firebase Cloud Function URL
    const url = 'https://us-central1-workshopno5.cloudfunctions.net/sendEmail';

    this.http.post(url, model, httpOptions)
      .subscribe({
        next: (data: any) => {
          this.isSubmitting = false;

          if (data && (data.statusCode === 200 || data.success)) {
            this.formSubmitted = true;
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            this.formError = 'There was an error submitting your request. Please try again.';
          }
        },
        error: () => {
          this.isSubmitting = false;
          this.formError = 'There was an error submitting your request. Please try again.';
        }
      });
  }
}
