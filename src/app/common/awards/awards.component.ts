import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-awards-component',
  templateUrl: './awards.component.html'
})
export class AwardsComponent {
  @Input() awardCollection: any[] = [];

  constructor() {
    // Default awards data if none is provided
    if (this.awardCollection.length === 0) {
      this.awardCollection = [
        {
          image: "../assets/services/aia.jpg",
          title: "AIA President's Award",
          alt: "Workshop No. 5 awarded AIA President's Award",
          url: "https://www.linkedin.com/posts/workshop-no-5-llc_congratulations-to-our-principal-architect-activity-7292647578830049280-FiEM/",
          description: "2024",
        },
        {
          image: "../assets/services/houzz-green.jpg",
          title: "Best of Houzz",
          alt: "Workshop No. 5 featured in Best of Houzz 2023",
          url: "https://www.houzz.com/professionals/architects-and-building-designers/workshop-no-5-pfvwus-pf~1512097426",
          description: "7x Award Winner",
        },
        {
          image: "../assets/services/austin-home-logo.jpg",
          title: "Austin Home Awards Finalist/Winner",
          alt: "Workshop No. 5 wins Austin Home Awards 2023",
          url: "https://www.houzz.com/professionals/architects-and-building-designers/workshop-no-5-pfvwus-pf~1512097426",
          description: "2021, 2023",
        },
        {
          image: "../assets/services/austin-home-logo.jpg",
          title: "Best Architects List",
          alt: "Workshop No. 5 included in Best Architects List",
          url: "https://www.austinhomemag.com/best-architects/page/3/",
          description: "2022, 2023, 2024",
        },
        {
          image: "../assets/services/ma-ds-logo.jpg",
          title: "Austin Modern Home Tour",
          alt: "Workshop No. 5 featured in Austin Modern Home Tour",
          url: "https://mads.media/2022-austin-modern-home-tour/",
          description: "2022, 2023, 2024, 2025",
        },
        {
          image: "../assets/services/aia.jpg",
          title: "AIA Austin Design Awards",
          alt: "Workshop No. 5 awarded AIA Austin Design Awards",
          url: "https://www.aiaaustin.org/design-awards/2009",
          description: "2009",
        },
      ];
    }
  }
}
