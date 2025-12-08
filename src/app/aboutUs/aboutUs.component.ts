import { Component } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  templateUrl: "./aboutUs.component.html",
  styleUrls: ["./about.component.scss"],
})
export class AboutUsComponent {
  staffCollection: any[] = [];
  singleImage: any = {};
  articleCollection = [];
  quoteCollection = [];

  constructor(private meta: Meta, private title: Title) {
    title.setTitle("About the Firm | Workshop No. 5");
    meta.updateTag({
      name: "title",
      content: "About the Firm | Workshop No. 5",
    });
    meta.updateTag({
      property: "og:title",
      content: "About the Firm | Workshop No. 5",
    });

    meta.updateTag({
      name: "description",
      content:
        "We create beautiful and functional spaces that transcend expectations.",
    });
    meta.updateTag({
      property: "og:description",
      content:
        "We create beautiful and functional spaces that transcend expectations.",
    });

    meta.updateTag({ name: "robots", content: "INDEX, FOLLOW" });
    meta.updateTag({ name: "author", content: "Workshop No5" });
    meta.updateTag({
      name: "keywords",
      content:
        "About, Architecture Services, Residential, Commercial, Office Space, Austin Architect, Workshop No5",
    });

    meta.updateTag({ property: "og:type", content: "website" });
    meta.updateTag({
      property: "og:image",
      content: "/assets/featured/workshop-no-5.jpg",
    });

    this.staffCollection = [
      {
        url: "../assets/aboutUs/vani-1.jpg",
        overlay_url: "../assets/aboutUs/vani-2.jpg",
        title: "Founder + Principal Architect",
        orgs: "AIA, NOMA, and NCARB",
        name: "Vani",
        description: `<p>When it comes to leading Workshop No.5 in designing beautiful and functional spaces, Vani crafts inspiration from experiences, and is always seeking new places to explore. Her favorite way to make memories is by visiting new restaurants and community spaces, whether she’s keeping it local or traveling internationally! When she’s not designing community spaces to bring together people from all walks of life, Vani stays grounded by lovingly preparing delicious home-cooked meals with her family.</p>
          `,
        quote:
          "Try not to become a man of success. Rather become a man of value.",
        quoteBy: "Albert Einstein",
      },
      {
        url: "../assets/aboutUs/kat-1.jpg",
        overlay_url: "../assets/aboutUs/kat-2.jpg",
        title: "Architectural Designer",
        name: "Kat",
        description: `<p>Kat has a knack for visualizing spaces that sing with both style and functionality. A devoted enthusiast of space and sound, Kat has explored all the live music venues in Austin, and is always looking to discover new artists. She loves the way design can enrich people’s wellbeing and inner lives, and her favorite projects involve creating unique hobby spaces where people can dedicate time to their crafts or favorite activities.</p>`,
        quote: "It is in collectivities that we find reservoirs of hope and optimism.",
        quoteBy: "Angela Y Davis",
        quoteByTitle: "Freedom Is a Constant Struggle",
      },
      {
        url: "../assets/aboutUs/zuleydi-1.jpg",
        overlay_url: "../assets/aboutUs/zuleydi-2.jpg",
        title: "Interior Designer",
        name: "Zuleydi",
        description: `<p>Zuleydi brings her elegant touch to every project, turning ordinary spaces into extraordinary experiences. A certified scuba diver, she dives head-first into new challenges and can breathe life into anything found at a vintage store. She can effortlessly visualize beauty in any space, and her dream project is designing a unique and cozy restaurant where people can share meals and laughter with friends and family.</p>`,
        quote: "The environment is where we all meet, where we all have a mutual interest; it is the one thing all of us share. It is not only a mirror of ourselves, but a focusing lens on what we can become.",
        quoteBy: "Lady Bird Johnson",
        quoteByTitle: "Speech at Yale University, White House Diary, Oct. 9, 1967",
      },
      {
        url: "../assets/aboutUs/aurora-1.jpg",
        overlay_url: "../assets/aboutUs/aurora-2.jpg",
        title: "Chief Marketing Officer",
        name: "Aurora",
        description: `<p>Aurora brings a vibrant energy to our marketing team, drawing on her experience as a radio DJ for Austin’s own KHFI. Her passion for food and baking adds a delicious twist to her creative approach. Her past life on the airwaves and love for culinary arts make her a dynamic and innovative force in the world of marketing.</p>`,
        quote: "You move in the direction of your most current dominant thought.",
        quoteBy: "Tom Jordan",
        quoteByTitle: "You Move in the Direction of Your Most Current Dominant Thought",
      },
      {
        url: "../assets/aboutUs/chandler-1.jpg",
        overlay_url: "../assets/aboutUs/chandler-2.jpg",
        title: "Social Media Coordinator",
        name: "Chandler",
        description: `<p>Chandler's day starts with yoga and dance, infusing a sense of calm and energy into every project. As a social media maestro, Chandler knows how to get everyone’s eyes on Workshop No.5. Her favorite design projects involve envisioning versatile backyards and patios, perfect for play, hosting friends and family, or relaxing alone. With a keen eye for detail and a creative spirit, Chandler brings a refreshing perspective to our online presence.</p>`,
        quote: "Curiosity will conquer fear more than bravery will.",
        quoteBy: "James Stephens",
        quoteByTitle: "Curiosity Will Conquer Fear More Than Bravery Will",
      }
    ];

    this.singleImage = {
      url: "../assets/aboutUs/image5.jpg",
      show: false,
    };

    this.articleCollection = [
      {
        image: "../assets/services/articles/texas-architect-2017.jpg",
        alt: "Workshop No. 5 architects published in Texas Architect 2017",
        title: "Texas Architect 2017",
        description:
          "Project: John Gaines Park and Swim Center<br>Architect: Stanley Studio<br>Sarah Wigfield, Designer<br>Role: Team Member",
      },
      {
        image: "../assets/services/articles/texas-architect-2013.jpg",
        alt: "Workshop No. 5 architects published in Texas Architect 2013",
        title: "Texas Architect 2013",
        description:
          "Project: Ella Wooten Park<br>Architect: Studio 8 Architects<br>Personnel: Bhavani Singal, Principal/Owner<br>Role: Project Manager/Designer",
      },
      {
        image: "../assets/services/articles/texas-architect-2009.jpg",
        alt: "Workshop No. 5 architects published in Texas Architect 2009",
        title: "Texas Architect 2009",
        description:
          "Project: Ella Wooten Park<br>Architect: Studio 8 Architects",
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

  /*getContactInfo(i): any {
    let info = {};
    switch (i) {
      case 0 :
        info = {
         
        };
        break;
      case 1 :
        info = {
          title : 'Interior Designer',
          name: 'Sarah Wigfield',
          description : '<p>Sarah Wigfield graduated from Texas State University with a Bachelor of Family and Consumer Science in Interior Design and is an Associate Member of IIDA. Her passion for design stems from her love of inspiring others with functional yet thoughtfully crafted spaces.</p>',
          additionalDescription :  '<p>Sarah\'s favorite pastime activity is reading, she has a big collection of novels in all genres such as sci-fi, mystery, classics, you name it!</p>'
        };
        break;
      case 2 :
        info = {
          title : 'Social Media Coordinator',
          name: 'Veronica Alvarez Ferreira',
          description : '<p>Veronica Alvarez Ferreira holds a Bachelor of Science in Communications from The University of Texas at Austin. Her background in written and visual communication has taught her the importance of creative problem solving and collaboration. Veronica shares Workshop No.5’s passion for telling stories, and has enjoyed applying that passion to the architectural stories they tell.</p>',
          additionalDescription :  '<p>Besides working for Workshop No.5, Veronica is also a filmmaker. She has worked on several local productions and just finished directing a documentary in Portugal last year!</p>'
        };
        break;
      case 3 :
        info = {
          title : 'Intern',
          name: 'Emily Kahn',
          description : '<p>This is Emily, she started interning for us last year, and has brought a great energy to our office!</p><p>Emily Kahn is a current student at the University of Texas at Austin, who is currently striving towards a degree in Architecture. She has a background in music, working with several local artists such as the orchestral band, Mother Falcon. These musical experiences taught her the importance of creative collaboration which she found to be a core value within Workshop No. 5.</p>',
          additionalDescription :  '<p>Emily is also a local singer & songwriter, and released her first single on Spotify last year!</p>'
        };
        break;
    }
    return info;
  }*/
}
