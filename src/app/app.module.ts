import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { NavModule } from './navigation/nav.module';
import { LandingComponent } from './landingPage/landing.component';
import { ResidentialComponent } from './residential/residential.component';
import { ResidentialArchiveComponent } from './residential/residential-archive.component';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { HomepageComponent } from './homePage/homePage.component';
import { FooterComponent } from './footer/footer.component';
import { ServicesComponent } from './servicesPage/services.component';
import { ContactInfoComponent } from './common/contactInfo/contactinfo.component';
import { AwardsComponent } from './common/awards/awards.component';
import { AboutUsComponent } from './aboutUs/aboutUs.component';
import { BlogComponent } from './blog/blog.component';
import { ContactUsComponent } from './contactUs/contact.component';
import { PlayComponent } from './play/play.component';
import { CommercialComponent } from './commercial/commercial.component';
import { ProductDetailsComponent } from './productDetails/productDetails.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { HttpErrorInterceptor } from './common/components/http-error.interceptor';
import { ConsultationComponent } from './common/consultation/consultation.component';
import { PortfolioComponent } from './common/portfolio/portfolio.component';
import { SpeakingComponent } from './common/speaking/speaking.component';
import { LoginComponent } from './login/login.component';
import { environment } from '../environments/environment';
import { AdminDashboardComponent } from './admin/admin-dashboard.component';
import { DeferLoadDirective } from './common/directives/defer-load.directive';
import { ProjectEditorComponent } from './admin/project-editor.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Firebase imports
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';

@NgModule({
  declarations: [
    AppComponent,
    LandingComponent,
    ResidentialComponent,
    ResidentialArchiveComponent,
    HeaderComponent,
    SidebarComponent,
    HomepageComponent,
    FooterComponent,
    ServicesComponent,
    ContactInfoComponent,
    AwardsComponent,
    AboutUsComponent,
    BlogComponent,
    ContactUsComponent,
    PlayComponent,
    CommercialComponent,
    ProductDetailsComponent,
    ConsultationComponent,
    PortfolioComponent,
    SpeakingComponent,
    LoginComponent,
    AdminDashboardComponent,
    ProjectEditorComponent,
    DeferLoadDirective
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    NgxSpinnerModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot([
      { path: '', component: HomepageComponent },
      { path: 'residential', component: ResidentialComponent },
      { path: 'residential-archive', component: ResidentialArchiveComponent },
      { path: 'play', component: PlayComponent },
      { path: 'commercial', component: CommercialComponent },
      { path: 'services', component: ServicesComponent },
      { path: 'about', component: AboutUsComponent },
      { path: 'blog', component: BlogComponent },
      { path: 'contact', component: ContactUsComponent },
      { path: 'contact-us', component: ContactUsComponent },
      { path: 'login', component: LoginComponent },
      { path: 'admin', component: AdminDashboardComponent },
      { path: 'ADMIN', redirectTo: 'admin', pathMatch: 'full' },
      { path: 'Admin', redirectTo: 'admin', pathMatch: 'full' },
      { path: 'admin/project/:type/:id', component: ProjectEditorComponent },
      { path: 'admin/project/:type', component: ProjectEditorComponent },
      { path: 'productDetails/:page/:id', component: ProductDetailsComponent },
      { path: 'productDetails', component: ProductDetailsComponent }
    ]),
    NavModule
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true
    },
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage())
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
