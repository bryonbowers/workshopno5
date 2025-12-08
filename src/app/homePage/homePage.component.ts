import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';

interface HeroSlide {
  image: string;
  title: string;
}

@Component({
  templateUrl: "./homePage.component.html",
})
export class HomepageComponent implements OnInit, OnDestroy {
  articleCollection = [];
  quoteCollection = [];

  // Hero slideshow
  heroSlides: HeroSlide[] = [
    { image: './assets/residential/burney/1_Burney.jpg', title: 'Burney Residence' },
    { image: './assets/residential/venado-2/DSC03855.jpg', title: 'Venado Residence' },
    { image: './assets/commercial/WindingOaks/WindingOaks_Web_19.jpg', title: 'Winding Oaks' },
    { image: './assets/residential/lomalinda/Workshop_NO.5_Loma_Linda_Web_.jpg', title: 'Loma Linda' },
    { image: './assets/residential/alegria1800/1_1800ALEGRIA.jpg', title: '1800 Alegria' },
  ];
  currentSlide = 0;
  prevSlide = -1;
  slideProgress = 0;
  private slideInterval: any;
  private progressInterval: any;
  private readonly SLIDE_DURATION = 6000; // 6 seconds per slide
  private readonly PROGRESS_UPDATE = 50; // Update progress every 50ms

  constructor(
    private meta: Meta,
    private title: Title,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    title.setTitle("Workshop No. 5 | Austin Architecture and Interiors Firm");
    meta.updateTag({
      name: "title",
      content: "Workshop No. 5 | Austin Architecture and Interiors Firm",
    });

    meta.updateTag({
      name: "description",
      content:
        "Welcome to craft personal stories and experiences through inspired architecture and interiors",
    });
    meta.updateTag({
      property: "og:description",
      content:
        "Welcome to craft personal stories and experiences through inspired architecture and interiors",
    });

    meta.updateTag({ name: "robots", content: "INDEX, FOLLOW" });
    meta.updateTag({ name: "author", content: "Workshop No5" });
    meta.updateTag({
      name: "keywords",
      content: "Residential, Austin Architect",
    });
    meta.updateTag({ httpEquiv: "Content-Type", content: "text/html" });
    meta.updateTag({
      property: "og:title",
      content: "Workshop No. 5 | Austin Architecture and Interiors Firm",
    });
    meta.updateTag({ property: "og:type", content: "website" });
    meta.updateTag({
      property: "og:image",
      content: "/assets/featured/austin-architecture-firm.jpg",
    });

    this.articleCollection = [
      {
        image: "../assets/services/articles/courtyard-pres.png",
        title: "Austin Home",
        alt: "Workshop No. 5 profile in Austin Home Magazine",
        url: "https://www.austinhomemag.com/issues/austin-home-summer-2023/",
        description:
          "Workshop No. 5 profiled in <em>One Architect's Advice for a Changing Austin: Join the Dance</em> April 2024.",
      },
      {
        image: "../assets/services/articles/home-design-decor.jpg",
        title: "Home Design &amp; Decor",
        alt: "Workshop No. 5 featured in Home Design &amp; Decor Magazine",
        url: "https://issuu.com/louisdoucette/docs/hdd_summer2023_issuu",
        description:
          "Residential project that preserves natural beauty featured in <em>Around the Trees</em>.",
      },
      {
        image: "../assets/services/articles/WorkshopNo5_JewellSt_HR_21_H.jpg",
        title: "Austin Home",
        alt: "Workshop No. 5 featured in Austin Home Magazine",
        url: "https://www.austinhomemag.com/this-kitchen-was-defined-by-adjacent-heritage-oaks/",
        description:
          "Featured in <em>This Kitchen Was Defined by Adjacent Heritage Oaks</em>.",
      },
      {
        image: "../assets/services/articles/tribeza.jpg",
        title: "Tribeza Magazine",
        alt: "Workshop No. 5 featured in Tribeza Magazine",
        url: "https://tribeza.com/home-design/austin-women-leading-construction-design-industries/",
        description:
          "Founder, Bhavani Singal, featured in <em>Four Austin Women Leading Local Construction and Design Industries</em>.",
      },
      {
        image:
          "../assets/services/articles/workshopno5_woodrowkitchen_hr_07f.jpg",
        title: "Tribeza Magazine",
        alt: "Workshop No. 5 featured in Tribeza Magazine",
        url: "https://tribeza.com/home-design/workshop-no-5-kitchen-remodel/",
        description:
          "Featured in <em>Workshop No. 5 Designs Inviting and Innovative Kitchen in Brentwood</em>.",
      },
      {
        image: "../assets/services/articles/TA22_J-F_Cover.jpg",
        title: "Texas Architect 2022",
        alt: "Workshop No. 5 featured in Texas Architect 2022",
        url: "https://magazine.texasarchitects.org/2022/01/07/a-jewel-in-the-trees/",
        description:
          "Project: Jewell Residence featured in Texas Architect article, <em>A Jewel in the Trees</em>",
      },
      {
        image: "../assets/services/articles/austin-woman.jpg",
        title: "Austin Woman",
        alt: "Workshop No. 5 featured in Austin Woman Magazine",
        url: "https://atxwoman.com/guide-building-dream-home/",
        description:
          "Founder, Bhavani Singal, featured in <em>Austin Woman's Guide to Building Your Dream Home.</em>",
      },
      {
        image: "../assets/services/articles/voyage.jpg",
        alt: "Workshop No. 5 architects published in Voyage Austin",
        title: "Voyage Austin",
        url: "http://voyageaustin.com/interview/inspiring-conversations-with-vani-singal-of-workshop-no5/",
        description: "Inspiring Conversations with Vani Singal of Workshop No5",
      },
      {
        image: "../assets/services/articles/texas-architect-2013.jpg",
        alt: "Workshop No. 5 architects published in Texas Architect 2013",
        title: "Texas Architect",
        url: "https://magazine.texasarchitects.org/2013/03/23/march-april-2013/",
        description:
          "Bhavani Singal's Met Retail project featured in <em>Standing Up to the Strip Mall</em>",
      },
      {
        image: "../assets/services/articles/retailoring-retail.png",
        alt: "Workshop No. 5 architects published in Texas Architect 2013",
        title: "Texas Architect",
        url: "https://magazine.texasarchitects.org/2013/03/23/march-april-2013/",
        description:
          "Bhavani Singal's Rackspace project featured in <em>Re-Tailoring Retail</em>",
      },
      {
        image: "../assets/services/articles/texas-architect-fall-09.jpg",
        alt: "Workshop No. 5 architects published in Texas Architect Fall 2009",
        title: "Texas Architect",
        url: "https://magazine.texasarchitects.org/2009/03/26/march-april-2009/",
        description:
          "Bhavani Singal's project featured in <em>Ella Wooten Park Pool House</em>",
      },
      {
        image: "../assets/services/articles/texas-architect-summer-09.jpg",
        alt: "Workshop No. 5 architects published in Texas Architect Summer 2009",
        title: "Texas Architect",
        url: "https://magazine.texasarchitects.org/2009/07/26/july-august-2009/",
        description:
          "Bhavani Singal's project featured in <em>Archives of the Episcopal Church</em>",
      },
    ];

    this.quoteCollection = [
      {
        quote:
          "Workshop No.5 is design lead for our upcoming venture to transform the culture of health care, Karisha Community: Bridging Food, Medicine, and Health, for All. Bhavani Singal is kind, easy to work with, highly skilled, creative and competent in her field. But above all, we chose her because she puts her heart into her work. It was important for us to select an architect who can truly become a part of our team to bring our vision to fruition. I would highly recommend Workshop No.5 to anyone seeking great design and consultants they will love to work with.",
        name: "Amina Haji",
        byline: "Karisha Community",
      },
      {
        quote:
          "We are home builders in Austin, Texas and have collaborated with Vani  and Workshop No. 5 in both spec and custom homes. Her vast knowledge of city building codes and regulations combined with an incredible eye for spacial relationships, functionality, and thoughtful, creative design are invaluable. She is committed to the highest level of service and complete satisfaction, aiming to make the process as seamless and enjoyable as possible. We recommend Workshop No. 5 for any architectural design needs!",
        name: "Amy Mosier",
        byline: "Mosier Luxury Homes",
      },
      {
        quote:
          "When we set out to build a custom home on our lot, we had a lot of scattered likes and dislikes, but no solid plan for what we wanted. Vani from Workshop No5 spent time getting to know our our preferences and our building site and designed a home that suits both us and the lot perfectly. As we worked through options, Vani tweaked the plans until they were perfect for us. Our home is truly one of a kind - designed specifically for us and our lifestyle--we absolutely love it.",
        name: "Cindy Cameron",
        byline: "Homeowner",
      },
      {
        quote:
          "The architects at Workshop No. 5 have been amazing to work with. I work full-time and envisioned building a home from the ground up to be another stressful full-time job. We are in the process of building a modern home and are having a great time doing it! I have worked with Vani the most, and she has been receptive to my input, listening to my visions, and working to bring them to fruition. The ladies at Workshop No. 5 will make you feel like you are their only client and your home is just as much a priority to them as it is to you. Have fun building!",
        name: "Sarah Stiriss",
        byline: "Homeowner",
      },
    ];
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.startSlideshow();
    }
  }

  ngOnDestroy() {
    this.stopSlideshow();
  }

  private startSlideshow() {
    this.slideProgress = 0;

    // Progress bar animation
    this.progressInterval = setInterval(() => {
      this.slideProgress += (this.PROGRESS_UPDATE / this.SLIDE_DURATION) * 100;
      if (this.slideProgress >= 100) {
        this.slideProgress = 100;
      }
    }, this.PROGRESS_UPDATE);

    // Slide change
    this.slideInterval = setInterval(() => {
      this.nextHeroSlide();
    }, this.SLIDE_DURATION);
  }

  private stopSlideshow() {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
  }

  nextHeroSlide() {
    this.prevSlide = this.currentSlide;
    this.currentSlide = (this.currentSlide + 1) % this.heroSlides.length;
    this.resetProgress();
  }

  prevHeroSlide() {
    this.prevSlide = this.currentSlide;
    this.currentSlide = this.currentSlide === 0 ? this.heroSlides.length - 1 : this.currentSlide - 1;
    this.resetProgress();
  }

  private resetProgress() {
    this.slideProgress = 0;
    this.stopSlideshow();
    this.startSlideshow();
  }
}
