export const SITE_URL = 'https://rocstartupweek.com';
export const EVENT_DATES = 'November 2-7, 2026';

export const sizes = {
  instagram: { label: 'Instagram / Facebook', width: 1080, height: 1080 },
  linkedin: { label: 'LinkedIn Square', width: 1200, height: 1200 },
  twitter: { label: 'X / Twitter', width: 1600, height: 900 },
  email: { label: 'Email Newsletter', width: 1200, height: 628 }
};

export const days = [
  {
    key: 'monday', day: 'Monday', date: 'Nov 2',
    events: [
      { time: '3:00 PM', title: 'Sales for Startups', detail: 'Pat Shreckengast · NextCorps' },
      { time: '4:00-5:00 PM', title: 'IP Protection for Startups', detail: 'Nicholas Gallo · NextCorps Auditorium' },
      { time: '5:30 PM', title: 'City Mark Documentary Screening', detail: 'Focus Theater, Sibley Building', headliner: true },
      { time: 'TBA', title: 'Reception at the Mercantile on Main', detail: 'Mercantile on Main', headliner: true }
    ]
  },
  {
    key: 'tuesday', day: 'Tuesday', date: 'Nov 3',
    events: [
      { time: '3:00-4:00 PM', title: 'Opportunities in Fusion Energy', detail: 'Dr. Matt Moynihan · NextCorps' },
      { time: '5:30-7:30 PM', title: 'Connected Ideas x Startup Grind Investor Panel', detail: 'The Inn on Broadway · $15', headliner: true }
    ]
  },
  {
    key: 'wednesday', day: 'Wednesday', date: 'Nov 4',
    events: [
      { time: '9:00 AM', title: 'Speaking from Experience: Marc Iacona + AI Session', detail: 'Golisano Institute' },
      { time: '1:00 PM', title: 'UVC Office Hours', detail: 'RIT · Registration required', headliner: true }
    ]
  },
  {
    key: 'thursday', day: 'Thursday', date: 'Nov 5',
    events: [
      { time: '5:30 PM', title: 'RocGrowth Creative Collisions', detail: 'Fattey Beer Co.' }
    ]
  },
  {
    key: 'friday', day: 'Friday', date: 'Nov 6',
    events: [
      { time: '3:30-5:00 PM', title: 'Fundraising for Your Startup', detail: 'NextCorps', headliner: true },
      { time: '5:00-6:00 PM', title: 'Happy Hour & Networking', detail: 'NextCorps' }
    ]
  },
  {
    key: 'saturday', day: 'Saturday', date: 'Nov 7',
    events: [
      { time: '2:00-4:00 PM', title: 'Mark Ain Business Model Competition', detail: 'Wegmans Hall Auditorium · Reception follows', headliner: true }
    ]
  }
];

// Change this once each day to regenerate the Daily Schedule and Happening Today graphics.
export const featuredDay = 'monday';

export const concepts = {
  'coming': {
    title: 'Rochester Startup Week, Coming Nov 2nd',
    deck: 'Six days of workshops, founder talks, investor access, networking, and connection.',
    mode: 'statement'
  },
  'intro-red': {
    title: 'Rochester Startup Week, Coming Nov 2nd',
    deck: 'Six days of workshops, founder talks, investor access, networking, and connection.',
    mode: 'thanks'
  },
  'one-week': {
    title: 'One Week Away.',
    deck: 'Roc Startup Week begins November 2. Six days of founder talks, investor access, workshops, and connection across Rochester.',
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
