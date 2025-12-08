import { Component, Input } from "@angular/core";

@Component({
  selector: "app-speaking-component",
  templateUrl: "./speaking.component.html",
})
export class SpeakingComponent {
  @Input() speakingCollection: any[] = [];

  constructor() {
    // Default speaking engagements data if none is provided
    if (this.speakingCollection.length === 0) {
      this.speakingCollection = [
        {
          image: "../assets/speaking/dinner-series.jpg",
          title: "Women in Architecture Dinner Series",
          alt: "Bhavani Singal speaking at Women in Architecture Dinner Series",
          url: "https://www.instagram.com/p/C4lLv8SO2Ng/?ref=marketsplash.com&img_index=1",
          description: "2024",
        },
        {
          image: "../assets/speaking/motherhood-panel.jpg",
          title: "Motherhood Panel",
          alt: "Bhavani Singal speaking at Motherhood in Architecture Panel",
          url: "https://www.youtube.com/watch?v=qDR_w-Y0k0s",
          description: "2024",
        },
        {
          image: "../assets/speaking/vani-profile.jpg",
          title: "Women in Architecture Profiles",
          alt: "Bhavani Singal speaking at Women in Architecture Profiles",
          url: "https://www.youtube.com/watch?v=nG-Q9XXq9qQ",
          description: "2022",
        },
        {
          image: "../assets/speaking/vani-spotlight.jpg",
          title: "Spotlight Series",
          alt: "Bhavani Singal speaking at Women in Architecture Spotlight",
          url: "https://www.instagram.com/p/CO05lb1lpZv/?ref=marketsplash.com&img_index=5",
          description: "2022",
        },
        {
          image: "../assets/speaking/vani-advocacy.jpg",
          title: "Residential Advocacy",
          alt: "Bhavani Singal speaking at Residential Advocacy",
          url: "https://www.youtube.com/watch?v=ikAkr0oW3nw",
          description: "2020",
        },
      ];
    }
  }
}