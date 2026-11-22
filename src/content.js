// Every name, date, place and photo on the site lives here.
// Still placeholders: the groom's photo, some gallery photos and the Mehndi, Barat and Walima details.
const brideAvatar = 'celebration/bride-avatar.jpg'

export const content = {
  groom: {
    first: 'Fawwad',
    full: 'Raja Fawwad Ismail Saqib',
    parents: 'Son of Raja Muneeb Saqib',
    photo: 'ref/muslim-groom.webp', // swap for 'photos/groom.jpg' once the real photo is in public/photos
  },
  bride: {
    first: 'Amna',
    full: 'Amna Sohail',
    parents: 'Daughter of Qazi Sohail Ahmed',
    photo: brideAvatar,
    photoAlt: 'Illustrated bridal avatar for Amna Sohail',
  },
  hashtag: '#FawwadWedsAmna',
  mainEvent: 'nikah', // the scratch card and the countdown use this event

  // Up to 6 photos for the gallery (paths inside public/)
  gallery: ['ref/muslim-gellery-1.webp', 'ref/muslim-gellery-2.webp', 'ref/muslim-groom.webp', brideAvatar, 'ref/muslim-gellery-3.webp'],

  // The weekday is worked out from the date. An event without lat/lng shows no map pin or directions button.
  events: [
    {
      id: 'mehndi',
      name: 'Mehndi',
      line: 'An evening of henna, dholki and song',
      date: '2026-12-10', // placeholder
      start: '19:00',
      hours: 4,
      venue: 'Venue to be announced',
      address: 'Rawalpindi',
    },
    {
      id: 'nikah',
      name: 'Nikah',
      line: 'The Nikah ceremony',
      date: '2026-12-12', // the card says "Saturday 12th Dec, 2027", but 12 Dec 2027 is a Sunday; Saturday 12 Dec is 2026
      start: '16:00',
      hours: 2,
      venue: 'NE 659, Dhoke Farman Ali',
      address: 'Chaklala Road, Rawalpindi',
      lat: 33.6105, // Dhoke Farman Ali area; replace with the house's exact pin from Google Maps
      lng: 73.0763,
    },
    {
      id: 'barat',
      name: 'Barat',
      line: 'The baraat, dinner and the rukhsati',
      date: '2026-12-12', // placeholder
      start: '20:00',
      hours: 4,
      venue: 'Venue to be announced',
      address: 'Rawalpindi',
    },
    {
      id: 'walima',
      name: 'Walima',
      line: 'Dinner hosted by the groom’s family',
      date: '2026-12-13', // placeholder
      start: '20:00',
      hours: 3,
      venue: 'Venue to be announced',
      address: 'Rawalpindi',
    },
  ],

  music: { src: 'music/song.mp3', title: 'Ishq Hai' },
}
