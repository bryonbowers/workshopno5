import {Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NgxSpinnerService } from 'ngx-spinner';
@Component({
  templateUrl: './play.component.html'
})
export class PlayComponent implements OnInit {
  imageCollection = [];
  constructor(private router: Router, private http: HttpClient, private spinner: NgxSpinnerService) {}
  goToProject(id) {
    this.router.navigate(['productDetails', {'id': id, 'page': 'play'}]);
  }
  ngOnInit() {
    this.spinner.show();
    this.http.get('../assets/data/play/playData.json')
      .subscribe({
        next: (data: any) => {
          this.imageCollection = data.playComponent;
          window.scroll( 0, 0);
          this.spinner.hide();
        },
        error: () => {
          this.spinner.hide();
        }
      });
  }
}
