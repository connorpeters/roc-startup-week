export const SITE_URL = 'https://rocstartupweek.com';
export const EVENT_DATES = 'November 2-7, 2026';

export const linkedInHeaderSizes = {
  company: { width: 1128, height: 191 },
  personal: { width: 1584, height: 396 }
};

export const sizes = {
  instagram: { label: 'Instagram / Facebook', width: 1080, height: 1080 },
  linkedin: { label: 'LinkedIn Square', width: 1200, height: 1200 },
  twitter: { label: 'X / Twitter', width: 1600, height: 900 },
  email: { label: 'Email Newsletter', width: 1200, height: 628 }
};

export const days = [
  {
    "key": "monday",
    "day": "Monday",
    "date": "Nov 2",
    "events": [
      {
        "time": "10:00-11:30 AM",
        "title": "Rochester Founder Risk Lab",
        "detail": "CoPivot · Virtual",
        "id": "rochester-founder-risk-lab",
        "organizers": ["CoPivot"],
        "location": "Virtual",
        "meta": {
          "Organizer": "CoPivot"
        },
        "description": "A live founder experiment exploring the risks entrepreneurs face and the risks they may not see coming.",
        "url": "https://www.eventbrite.com/e/rochester-founder-risk-lab-tickets-2002241792099",
        "tvSummary": "Explore the risks of starting a company through a live founder experiment.",
        "tvAudience": "For founders and people considering starting a business.",
        "speaker": { "name": "Carolyn Spencer", "profileUrl": "https://www.linkedin.com/in/carolynnspencer/", "headshot": "images/speakers/carolynnspencer.jpg" }
      },
      {
        "time": "3:00-4:00 PM",
        "title": "Sales for Startups",
        "detail": "Pat Shreckengast · NextCorps",
        "id": "sales-for-startups",
        "organizers": ["NextCorps"],
        "organizationLogos": [{ "name": "NextCorps", "src": "images/logos/nextcorps.png" }],
        "location": "NextCorps",
        "meta": {
          "Speaker": "Pat Shreckengast, GrowthX member",
          "Host": "NextCorps"
        },
        "url": "https://www.linkedin.com/in/patshreck/",
        "tvSummary": "A sales session led by Pat Shreckengast, a member of GrowthX, hosted at NextCorps.",
        "tvAudience": "For founders and startup teams working on sales.",
        "description": "A sales session for startup founders led by Pat Shreckengast, a member of GrowthX, hosted at NextCorps.",
        "speaker": { "name": "Pat Shreckengast", "profileUrl": "https://www.linkedin.com/in/patshreck/", "headshot": "images/speakers/patshreck.jpg" }
      },
      {
        "time": "4:00-5:00 PM",
        "title": "Protecting Your Startup: Intellectual Property Basics",
        "detail": "Nicholas Gallo · NextCorps Auditorium",
        "id": "ip-protection-for-early-stage-companies",
        "organizers": ["NextCorps", "Troutman Pepper Locke"],
        "organizationLogos": [{ "name": "NextCorps", "src": "images/logos/nextcorps.png" }],
        "location": "NextCorps Auditorium",
        "meta": {
          "Speaker": "Nicholas Gallo, Troutman Pepper Locke"
        },
        "url": "https://www.troutman.com/",
        "tvSummary": "Explore intellectual property protection for early-stage companies with Nicholas Gallo.",
        "tvAudience": "For founders thinking about protecting their company’s work.",
        "description": "Explore intellectual property protection for early-stage companies with Nicholas Gallo of Troutman Pepper Locke.",
        "speaker": { "name": "Nicholas Gallo", "profileUrl": "https://www.linkedin.com/in/nicholasgallo/", "headshot": "images/speakers/nicholasgallo.jpg" }
      },
      {
        "time": "5:30-7:00 PM",
        "title": "RocGrowth presents: City Mark - Rochester Logo Documentary",
        "detail": "Focus Theater, Sibley Building",
        "headliner": true,
        "id": "rocgrowth-presents-city-mark-rochester-logo-documentary",
        "organizers": ["RocGrowth"],
        "organizationLogos": [{ "name": "RocGrowth", "src": "images/logos/rocgrowth-transparent.png" }],
        "location": "Focus Theater, Sibley Building",
        "shortLocation": "Focus Theater",
        "meta": {
          "Audience": "Open to all"
        },
        "tvSummary": "Watch City Mark, a documentary about Rochester’s logo, presented by RocGrowth.",
        "tvAudience": "For people interested in Rochester, design, and the city’s story.",
        "description": "Watch City Mark, a documentary about Rochester’s logo, presented by RocGrowth."
      },
      {
        "time": "7:00 PM-late",
        "title": "Reception at the Mercantile on Main",
        "detail": "Mercantile on Main",
        "headliner": true,
        "id": "reception-at-the-mercantile-on-main",
        "organizers": ["RocGrowth"],
        "organizationLogos": [{ "name": "RocGrowth", "src": "images/logos/rocgrowth-transparent.png" }],
        "location": "Mercantile on Main",
        "meta": {
          "Audience": "Open to all"
        },
        "tvSummary": "Gather at the Mercantile on Main for a reception after the City Mark documentary.",
        "tvAudience": "For people looking to connect with Rochester’s startup community.",
        "description": "Gather at the Mercantile on Main for a reception after the City Mark documentary."
      }
    ]
  },
  {
    "key": "tuesday",
    "day": "Tuesday",
    "date": "Nov 3",
    "events": [
      {
        "time": "10:00-11:00 AM",
        "title": "Collaborative Entrepreneurship Lab",
        "detail": "Cofactor · Virtual · RSVP for access",
        "id": "collaborative-entrepreneurship-lab",
        "organizers": ["Cofactor"],
        "location": "Virtual (RSVP for access)",
        "shortLocation": "Virtual",
        "meta": {
          "Organizer": "Cofactor"
        },
        "description": "An interactive virtual lab with guided exercises and small-group exchange to help founders connect people, knowledge, resources, and opportunities across Rochester.",
        "url": "https://app.heartbeat.chat/humanityincincubator/events/C5600A",
        "tvSummary": "A virtual lab with exercises and small-group exchange to connect people, knowledge, and opportunities.",
        "tvAudience": "For founders looking for collaborators and connections.",
        "registration": "RSVP required",
        "speaker": { "name": "Melissa Davis", "profileUrl": "https://www.linkedin.com/in/melissa-heisley-davis/", "headshot": "images/speakers/melissa-heisley-davis.jpg" }
      },
      {
        "time": "3:00-4:00 PM",
        "title": "Opportunities in Fusion Energy",
        "detail": "Dr. Matt Moynihan · NextCorps",
        "id": "opportunities-in-fusion-energy",
        "organizers": ["NextCorps"],
        "organizationLogos": [{ "name": "NextCorps", "src": "images/logos/nextcorps.png" }],
        "location": "NextCorps",
        "meta": {
          "Speaker": "Dr. Matt Moynihan"
        },
        "description": "Fusion startups are already buying. Learn how Western New York businesses can connect the products and services they make to the emerging needs of the fusion energy sector.",
        "speaker": { "name": "Dr. Matt Moynihan", "profileUrl": "https://www.linkedin.com/in/dr-matthew-moynihan-147ab170/", "headshot": "images/speakers/dr-matthew-moynihan.jpg" },
        "url": "https://www.eventbrite.com/e/opportunities-in-fusion-energy-part-of-roc-startup-week-tickets-1997459967533",
        "tvSummary": "Learn how Western New York businesses can supply products and services to fusion energy startups.",
        "tvAudience": "For business owners and teams exploring the fusion energy market."
      },
      {
        "time": "5:30-7:30 PM",
        "title": "Founder Panel: What It Takes to Build a Successful Company",
        "detail": "The Inn on Broadway · $15",
        "headliner": true,
        "id": "a-founder-panel-for-rochester-s-startup-community",
        "organizers": ["Connected Know", "Startup Grind Rochester"],
        "organizationLogos": [{ "name": "Startup Grind Rochester", "src": "images/logos/startup-grind.svg" }],
        "location": "The Inn on Broadway, Vanni’s Speakeasy, 26 Broadway, Rochester, NY 14607",
        "shortLocation": "Inn on Broadway",
        "meta": {
          "Cost": "$15 per person",
          "Audience": "Open to all"
        },
        "description": "A founder panel hosted by Connected Know in partnership with Startup Grind Rochester, with candid conversation, connections, and a showcase of regional startups.",
        "url": "https://luma.com/h9ly5tfm",
        "tvSummary": "Hear candid founder conversations, meet local builders, and see a showcase of regional startups.",
        "tvAudience": "For founders and people interested in Rochester’s startup community.",
        "cost": "$15 per person",
        "note": "Limited complimentary student tickets are available through the registration page, subject to approval. A university-issued email address is required."
      }
    ]
  },
  {
    "key": "wednesday",
    "day": "Wednesday",
    "date": "Nov 4",
    "events": [
      {
        "time": "9:00-11:00 AM",
        "title": "Speaking from Experience: Marc Iacona + AI Session",
        "detail": "Golisano Institute · Registration required · Limited seats",
        "id": "speaking-from-experience-marc-iacona-ai-session",
        "organizers": ["Golisano Institute"],
        "organizationLogos": [{ "name": "Golisano Institute", "src": "images/logos/golisano-institute-dark.svg" }],
        "location": "Golisano Institute",
        "meta": {},
        "speaker": { "name": "Marc Iacona", "profileUrl": "https://www.linkedin.com/in/marc-iacona-08a258160/", "headshot": "images/speakers/marc-iacona.jpg" },
        "url": "https://golisanoinstitute.org/sfe-registration/",
        "tvSummary": "Hear from Marc Iacona at Golisano Institute, with an AI session on the program.",
        "tvAudience": "For people interested in entrepreneurship and AI.",
        "note": "Registration required. Limited seats. Business attire required.",
        "registration": "Registration required · Limited seats"
      },
      {
        "time": "11:00 AM-12:00 PM",
        "title": "Can People Find Your Startup Online? Practical SEO & Website Strategies for Founders",
        "detail": "Rebecca Fien · Zoom · Passcode: rocstartup",
        "id": "can-people-find-your-startup-online-practical-seo-website-strategies-for-founders",
        "organizers": ["Bec Digital Studio"],
        "location": "Zoom",
        "meta": {
          "Speaker": "Rebecca Fien, Bec Digital Studio"
        },
        "description": "Learn practical ways to improve your startup’s online visibility through SEO, website structure, content, and local search.",
        "speaker": { "name": "Rebecca Fien", "profileUrl": "https://becdigitalstudio.com", "headshot": "images/speakers/rebecca-fien.jpg" },
        "note": "Meeting ID: 732 0079 0176 · Passcode: rocstartup",
        "url": "https://us04web.zoom.us/j/73200790176?pwd=4P86vfisKgmWu6VHAWyUnoG4JExYob.1",
        "tvSummary": "Learn practical SEO, website, content, and local search strategies to help people find your startup.",
        "tvAudience": "For founders and teams improving their online visibility."
      },
      {
        "time": "1:00-4:00 PM",
        "title": "UVC Office Hours",
        "detail": "RIT · Registration required · Limited seats",
        "headliner": true,
        "id": "uvc-office-hours",
        "organizers": ["Upstate Venture Connect"],
        "organizationLogos": [{ "name": "Upstate Venture Connect", "src": "images/logos/uvc-dark.svg" }, { "name": "RIT", "src": "images/logos/new_RIT_logo1_RGB_0.png" }],
        "location": "RIT",
        "meta": {
          "Organizer": "Upstate Venture Connect",
          "Audience": "Open to all"
        },
        "description": "Start with a fireside keynote with Sean Colombo, followed by curated one-on-one meetings with Upstate Venture Connect mentors, typically investors or entrepreneurs who have exited their companies. Registration required. Limited seats.",
        "speaker": { "name": "Sean Colombo", "profileUrl": "https://www.linkedin.com/in/seancolombo/", "headshot": "images/speakers/seancolombo.jpg" },
        "url": "https://luma.com/v4040czz",
        "tvSummary": "A fireside keynote with Sean Colombo, followed by curated one-on-one meetings with mentors, typically investors or entrepreneurs who have exited their companies.",
        "tvAudience": "For founders seeking investor and mentor conversations.",
        "registration": "Registration required · Limited seats"
      },
      {
        "time": "5:00-6:30 PM",
        "title": "Marketing: From Startup to Standout",
        "detail": "Simone Center @ RIT · Student Innovation Hall, Room 1600",
        "id": "marketing-from-startup-to-standout",
        "organizers": ["RIT Simone Center"],
        "organizationLogos": [{ "name": "RIT", "src": "images/logos/new_RIT_logo1_RGB_0.png" }],
        "location": "Simone Center @ RIT, Student Innovation Hall, Room 1600",
        "shortLocation": "RIT · Room 1600",
        "meta": {
          "Audience": "Open to all"
        },
        "url": "https://form.jotform.com/262595045694165",
        "tvSummary": "A marketing session focused on moving a startup from launch to greater visibility.",
        "tvAudience": "For founders, startup teams, and anyone interested in marketing. Open to all."
      }
    ]
  },
  {
    "key": "thursday",
    "day": "Thursday",
    "date": "Nov 5",
    "events": [
      {
        "time": "5:30-7:30 PM",
        "title": "RocGrowth Creative Collisions: Meet Founders & Creatives",
        "detail": "Fattey Beer Co.",
        "headliner": true,
        "id": "rocgrowth-creative-collisions",
        "organizers": ["RocGrowth"],
        "organizationLogos": [{ "name": "RocGrowth", "src": "images/logos/rocgrowth-transparent.png" }],
        "location": "Fattey Beer Co., 60 Adventure Place, Rochester, NY",
        "shortLocation": "Fattey Beer Co.",
        "meta": {
          "Audience": "Open to all"
        },
        "tvSummary": "Gather with RocGrowth at Fattey Beer Co. to make connections across Rochester’s startup community.",
        "tvAudience": "For founders, creatives, mentors, and supporters. Open to all, including students under 21.",
        "description": "Meet startup founders, creatives, mentors, advisors, and supporters at RocGrowth’s informal First Thursday meetup. Connect with people building businesses and creative projects across Rochester. Open to all.",
        "url": "https://rocgrowth.com/2023/12/12/rocgrowth-monthly-1st-thursday-meetup-for-creatives-startups-at-fattey-beer-530-to-730-p-m/"
      }
    ]
  },
  {
    "key": "friday",
    "day": "Friday",
    "date": "Nov 6",
    "events": [
      {
        "time": "2:00-3:00 PM",
        "title": "Scaling Your Startup: Stages of Platform Engineering",
        "detail": "Grant Wrazen, ACV Auctions infrastructure lead · NextCorps",
        "id": "stages-of-platform-engineering",
        "location": "NextCorps",
        "shortLocation": "NextCorps",
        "meta": {
          "Speaker": "Grant Wrazen"
        },
        "description": "Grant Wrazen led infrastructure at ACV Auctions through an estimated $200 million in scaling costs. Hear what it takes to build platform engineering and infrastructure that can support rapid growth, where those efforts break down, and when the return justifies investing in a platform.",
        "speaker": { "name": "Grant Wrazen", "profileUrl": "https://www.linkedin.com/in/grant-wrazen-5413147a/", "headshot": "images/speakers/grant-wrazen.jpg" },
        "url": "https://www.linkedin.com/in/grant-wrazen-5413147a/",
        "tvSummary": "Explore platform engineering goals, common failure points, and when platform investment earns its return.",
        "tvAudience": "For engineering leaders and teams evaluating platform and infrastructure investments."
      },
      {
        "time": "3:30-5:00 PM",
        "title": "Fundraising for Your Startup",
        "detail": "NextCorps",
        "headliner": true,
        "id": "fundraising-for-your-startup",
        "organizers": ["NextCorps"],
        "organizationLogos": [{ "name": "NextCorps", "src": "images/logos/nextcorps.png" }],
        "location": "NextCorps",
        "meta": {},
        "description": "Learn about funding options and fundraising strategies for operating and growing your startup. NextCorps staff and expert panelists will cover venture capital, angel investing, grants, bootstrapping, and crowdfunding, with practical tips, success stories, and time for questions.",
        "url": "https://www.eventbrite.com/e/five-ways-to-raise-capital-for-your-startup-tickets-2002158475898",
        "tvSummary": "Explore venture capital, angel investment, grants, bootstrapping, and crowdfunding with expert panelists.",
        "tvAudience": "For founders considering how to fund and grow a company."
      },
      {
        "time": "5:00-6:00 PM",
        "title": "Happy Hour & Networking",
        "detail": "NextCorps",
        "id": "happy-hour-networking",
        "organizers": ["NextCorps"],
        "organizationLogos": [{ "name": "NextCorps", "src": "images/logos/nextcorps.png" }],
        "location": "NextCorps",
        "meta": {
          "Audience": "Open to all"
        },
        "tvSummary": "Meet people from Rochester’s startup community at a happy hour at NextCorps.",
        "tvAudience": "For founders, startup teams, and people looking to make connections.",
        "url": "https://nextcorps.org/event/roc-startup-week-fundraising-for-your-startup/",
        "description": "Meet people from Rochester’s startup community at a happy hour at NextCorps."
      }
    ]
  },
  {
    "key": "saturday",
    "day": "Saturday",
    "date": "Nov 7",
    "events": [
      {
        "time": "2:00-4:00 PM",
        "title": "Mark Ain Business Model Competition",
        "detail": "Wegmans Hall Auditorium · Reception follows",
        "headliner": true,
        "id": "mark-ain-business-model-competition",
        "organizers": ["Ain Center for Entrepreneurship & Innovation"],
        "organizationLogos": [{ "name": "Ain Center for Entrepreneurship & Innovation", "src": "images/logos/uofr-ain-center.png" }],
        "location": "Wegmans Building, Wegmans Hall Auditorium, University of Rochester (River Campus)",
        "shortLocation": "Wegmans Hall Auditorium",
        "meta": {
          "Audience": "Finals and reception open to all"
        },
        "description": "Watch University of Rochester student founders present their business models and compete for funding. The finals and following reception are open to everyone, including RIT students and the wider Rochester community.",
        "note": "Reception follows. Competition entry is limited to current University of Rochester students enrolled in the Ain Foundry Program. Applications are due October 27 at 11:59 PM; see the competition page for entry requirements.",
        "tvSummary": "Watch University of Rochester student entrepreneurs present business ideas and compete for funding. Reception follows.",
        "tvAudience": "Finals and reception open to all. Competition entry is limited to eligible University of Rochester students.",
        "url": "https://www.rochester.edu/aincenter/mark-ain-business-model-competition/"
      }
    ]
  }
];

// Related events after November 2–7; excluded from the six-day calendar exports.
export const additionalDays = [
  {
    "key": "after-week-monday",
    "day": "Monday",
    "date": "Nov 9",
    "events": [
      {
        "id": "the-good-business-tour-rochester-premiere",
        "organizers": ["The Good Business Tour"],
        "title": "The Good Business Tour: Rochester Premiere",
        "time": "5:00 PM (end time TBD)",
        "detail": "George Eastman House · $25",
        "location": "George Eastman House, Rochester, NY",
        "shortLocation": "George Eastman House",
        "description": "Join host David Mammano for the premiere screening of The Good Business Tour’s Rochester episode, celebrating local entrepreneurs. Networking and refreshments are included.",
        "speaker": { "name": "David Mammano", "profileUrl": "https://www.linkedin.com/in/davemammano/", "headshot": "images/speakers/davemammano.jpg" },
        "url": "https://thegoodbusinesstour.com/",
        "cost": "$25 per person",
        "meta": {
          "Host": "David Mammano",
          "Cost": "$25 per person"
        }
      }
    ]
  },
  {
    "key": "after-week-wednesday",
    "day": "Wednesday",
    "date": "Dec 2",
    "events": [
      {
        "id": "flower-city-ai-2026",
        "title": "Flower City AI",
        "time": "Time TBD",
        "detail": "The Little Theatre · Full-day conference",
        "location": "The Little Theatre, 240 East Ave, Rochester, NY 14604",
        "shortLocation": "The Little Theatre",
        "organizers": ["Flower City AI"],
        "description": "A full-day conference exploring AI innovation, education, healthcare, art, business, and research in Rochester. Tickets include coffee and lunch.",
        "url": "https://flowercityai.eventbrite.com/",
        "cost": "$40 general admission · $10 student tickets",
        "meta": {
          "Cost": "$40 general admission · $10 student tickets"
        },
        "registration": "Tickets available"
      }
    ]
  }
];

// Change this once each day to regenerate the Daily Schedule and Happening Today graphics.
export const featuredDay = 'monday';

export const concepts = {
  'coming': {
    title: 'Rochester Startup Week, Coming Nov 2nd',
    deck: 'Six days of workshops, founder talks, networking, and connection.',
    mode: 'statement'
  },
  'intro-red': {
    title: 'Rochester Startup Week, Coming Nov 2nd',
    deck: 'Six days of workshops, founder talks, networking, and connection.',
    mode: 'thanks'
  },
  'one-week': {
    title: 'One Week Away.',
    deck: 'Roc Startup Week begins November 2. Six days of founder talks, workshops, and connection across Rochester.',
    mode: 'statement-dark'
  },
  'full-week-calendar': {
    title: 'The Full Week',
    deck: 'November 2-7 across Rochester.',
    mode: 'calendar'
  },
  'daily-schedule': {
    title: 'Daily Event Schedule',
    deck: 'Today’s lineup for Roc Startup Week.',
    mode: 'daily'
  },
  'happening-today': {
    title: 'Happening Today',
    deck: 'Show up. Meet someone building what comes next.',
    mode: 'today'
  },
  'dont-miss': {
    title: 'Don’t Miss\nRoc Startup Week',
    deck: 'Rochester has always built the future. This week, meet the people doing it now.',
    mode: 'statement-photo'
  },
  'thank-you': {
    title: 'Thank You, Rochester.',
    deck: 'To every founder, speaker, organizer, sponsor, student, investor, and neighbor who made the week possible: thank you.',
    mode: 'thanks'
  },
  'see-you-next-year': {
    title: 'See You Next Year.',
    deck: 'The week ends, but keep building Rochester.',
    mode: 'next-year'
  }
};

// Shared orientation copy for people encountering the TV slides for the first time.
export const tvIntro = { description: "Six days of workshops, founder talks, and networking across Rochester.", audience: "For founders, students, investors, and anyone curious about starting or building a business." };
