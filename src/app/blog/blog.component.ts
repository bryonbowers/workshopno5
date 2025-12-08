import { Component } from '@angular/core';

@Component({
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent {
  imageCollection = [];
  constructor() {
    for (let i = 0; i < 3; i++) {
      const url = '../assets/blog/WorkshopNo5Branding-' + (i + 1) + '.png';

      this.imageCollection[i] = {
        url: url,
        title : this.getBlogInfo(i).title,
        date : this.getBlogInfo(i).date,
        description : this.getBlogInfo(i).description,
        show: false
      };
    }
  }

  getBlogInfo(i): any {
    let info = {};
    switch (i) {
      case 0 :
        info = {
          title : 'Post Title',
          date: 'August 1, 2018',
          description : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore ' +
            'et dolore magna aliqua.' +
            ' Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat'
        };
        break;
      case 1 :
        info = {
          title : 'Post Title',
          date: 'August 1, 2018',
          description : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore ' +
            'et dolore magna aliqua.' +
            ' Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat'
        };
        break;
      case 2 :
        info = {
          title : 'Post Title',
          date: 'August 1, 2018',
          description : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore ' +
            'et dolore magna aliqua.' +
            ' Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat'
        };
        break;
    }
    return info;
  }
}
