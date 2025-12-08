import {Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NgxSpinnerService } from 'ngx-spinner';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  templateUrl: './residential-archive.component.html',
})
export class ResidentialArchiveComponent implements OnInit {
  imageCollection = [];
  constructor(private router: Router, private http: HttpClient, private spinner: NgxSpinnerService, private meta: Meta, private title: Title) 
  {
      title.setTitle('Archived Residential Architecture Projects | Workshop No. 5');
      meta.updateTag({name: 'title', content: 'Archived Residential Architecture Projects | Workshop No. 5'});
      meta.updateTag({property: 'og:title', content: "Archived Residential Architecture Portfolio | Workshop No. 5"});

      meta.updateTag({name: 'description', content: 'Collection of archived residential architecture projects from Workshop No. 5.'});
      meta.updateTag({property: 'og:description', content: "Collection of archived residential architecture projects from Workshop No. 5."});
      
      meta.updateTag({name: 'robots', content: 'INDEX, FOLLOW'});
      meta.updateTag({name: 'author', content: 'Workshop No5'});
      meta.updateTag({name: 'keywords', content: 'Archived Residential, Austin Architect'});
      meta.updateTag({httpEquiv: 'Content-Type', content: 'text/html'});
      meta.updateTag({property: 'og:type', content: "website"});
      meta.updateTag({property: 'og:image', content: "/assets/featured/austin-residential-architecture.jpg"});
      
      meta.updateTag({charset: 'UTF-8'});
      
  }

  goToProject(id) {
    this.router.navigate(['productDetails', {'id': id, 'page': 'residential'}]);
  }
  ngOnInit() {
    this.spinner.show();
    this.http.get('../assets/data/residential/residentialListData.json')
      .subscribe((data: any) => { setTimeout( () => {
        this.imageCollection = data.residentialComponent;
        window.scroll( 0, 0);
        this.spinner.hide();
      }, 500);
      });
  }
}
