import { Component } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  templateUrl: './services.component.html'
})
export class ServicesComponent {
  quoteCollection = [];
  articleCollection = [];
  constructor(private meta: Meta, private title: Title) 
  {
      title.setTitle('Architecture and Interiors Services | Workshop No. 5');
      meta.updateTag({name: 'title', content: 'Architecture and Interiors Services | Workshop No. 5'});
      meta.updateTag({property: 'og:title', content: "Architecture and Interiors Services | Workshop No. 5"});

      meta.updateTag({name: 'description', content: 'Our responsive, flexible, collaborative architecture and design firm adapts our proven process to best meet your needs.'});
      meta.updateTag({property: 'og:description', content: "Our responsive, flexible, collaborative architecture and design firm adapts our proven process to best meet your needs."});

      meta.updateTag({name: 'robots', content: 'INDEX, FOLLOW'});
      meta.updateTag({name: 'author', content: 'Workshop No5'});
      meta.updateTag({name: 'keywords', content: 'Architecture Services, Residential, Commercial, Office Space, Austin Architect'});
      meta.updateTag({httpEquiv: 'Content-Type', content: 'text/html'});
      meta.updateTag({property: 'og:type', content: "website"});
      meta.updateTag({property: 'og:image', content: "/assets/featured/austin-architecture-services.jpg"});
      meta.updateTag({charset: 'UTF-8'});


  }
}
