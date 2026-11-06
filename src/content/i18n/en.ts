import { media } from "../media";
import type { Dict } from "./es";

const legalNote = "(in Spanish)";

export const en: Dict = {
  site: {
    description: "Your central place to stay in San Sebastián. Double, twin and family rooms with shared or private bathroom.",
    slogan: "Central, comfortable and quiet.",
    seo: {
      title: "Enjoy Comfort San Sebastián · Official website | Central guesthouse in Donostia",
      description:
        "Official website of Enjoy Comfort, a guesthouse at Calle Nueva 5 in Gros, central San Sebastián, next to Gros beach and a short walk from the Old Town. Book direct, no booking fees.",
    },
    nav: [
      { label: "Rooms", href: "/en/rooms" },
      { label: "Why stay with us", href: "/en#por-que-elegirnos" },
      { label: "Location", href: "/en/location" },
      { label: "FAQ", href: "/en#preguntas-frecuentes" },
    ],
    footerNav: [
      { label: "Home", href: "/en" },
      { label: "Rooms", href: "/en/rooms" },
      { label: "Location and things to do", href: "/en/location" },
      { label: "Practical information", href: "/en/practical-information" },
      { label: "Check availability", href: "/en/book" },
    ],
    legal: {
      list: [
        { label: `Legal notice ${legalNote}`, href: "/aviso-legal" },
        { label: `Privacy policy ${legalNote}`, href: "/privacidad" },
        { label: `Cookie policy ${legalNote}`, href: "/cookies" },
        { label: `Terms and conditions ${legalNote}`, href: "/terminos" },
      ],
      privacy: { label: "Privacy policy", href: "/privacidad" },
      terms: { label: "Terms and conditions", href: "/terminos" },
      rights: "© Enjoy Comfort. All rights reserved.",
      cookieSettings: "Cookie settings",
    },
    cta: {
      title: "Your next San Sebastián getaway starts here",
      text: "Enter your dates and see straight away which rooms are free and how much they cost.",
    },
    ui: {
      menu: "Menu",
      skipToContent: "Skip to content",
      openGallery: "See photos",
      close: "Close",
      book: "Book",
      perNight: "/night",
      footerIntro: "Your central place to stay in San Sebastián. Double, twin and family rooms with shared or private bathroom.",
      footerContactTitle: "Any questions?",
      footerContactText: "Drop us a line and we'll help you plan your stay.",
      footerExplore: "Explore Enjoy Comfort",
      footerLegal: "Legal information",
      bookThis: "Book this room",
      directBooking: "Book direct",
      seeDetails: "See photos and details",
      finalPrice: "Final price once you choose dates",
      consultPrice: "Check price",
      from: "from",
      locationLink: "Location and things to do",
      practicalLink: "Practical information",
      onThisPage: "On this page",
      mapOf: "Map of",
      language: "Language",
      main: "Main",
      roomsAria: "Rooms",
    },
    whatsapp: { label: "Message us on WhatsApp", text: "Hello, I'd like some information about staying at Enjoy Comfort." },
  },

  home: {
    hero: {
      h1: "Enjoy Comfort · Your central place to stay in San Sebastián",
      title: ["Central, comfortable", "and quiet."],
      lead: "Pick your dates and see straight away which rooms are free. Book in a minute, directly with us.",
      image: media.city.bay,
      trust: ["Book direct, no fees", "Real availability and prices", "Secure card payment"],
    },
    rooms: {
      eyebrow: "Rooms",
      title: "Find your room in San Sebastián",
      text: "Every trip is different. Choose the room that suits yours and check availability for your dates.",
    },
    features: {
      title: "Why stay at Enjoy Comfort?",
      items: [
        {
          icon: "key",
          title: "A room for every trip",
          text: "Double, twin or family room, with shared or private bathroom. Choose depending on who you're travelling with: the room is just for your booking.",
        },
        {
          icon: "marker",
          title: "Right in the centre",
          text: "Gros beach and the Kursaal are just around the corner, and the Old Town and city centre are a short stroll away.",
        },
        {
          icon: "globe",
          title: "Talk to us directly",
          text: "Check availability, ask anything and plan your arrival with Enjoy Comfort. We'll help you choose between the options available.",
        },
      ],
    },
    city: {
      eyebrow: "Enjoy San Sebastián at your own pace",
      title: "Ideas to fill your getaway without planning every minute",
      items: [
        { title: "A walk along La Concha", text: "Stroll around the bay, walk by the beach and find a moment to sit and look out to sea.", image: media.city.bay },
        { title: "The Comb of the Wind", text: "Eduardo Chillida's sculptures on the Bay of Biscay, where art meets the sea.", image: media.city.comb },
        { title: "The Old Town and the centre", text: "Get lost in its streets and walk along the Boulevard. Part of the charm is discovering it slowly.", image: media.city.aerial },
        { title: "A pintxos crawl", text: "Make time for the local food. Pick your bars and enjoy a route at your own pace.", image: media.city.pintxos },
      ],
    },
    faq: {
      title: "Frequently asked questions",
      items: [
        {
          q: "What kind of accommodation is Enjoy Comfort?",
          a: "Enjoy Comfort is a one-star guesthouse (pensión) in central San Sebastián, a few minutes from Gros beach and the Old Town. We have double, twin and family rooms, with shared or private bathroom depending on the room.",
        },
        { q: "Are the rooms private?", a: "Yes. All rooms are private: you only share them with the people travelling with you." },
        {
          q: "Are the bathrooms private or shared?",
          a: "It depends on the room. The double and the twin share a bathroom with other guests. The double with private bathroom has its own bathroom just outside the room, and the family room has a private bathroom.",
        },
        { q: "Can I choose between a double bed and two beds?", a: "Yes. We have a double room with a double bed and a twin room with two single beds. Both can be booked for one or two people." },
        { q: "Do you have rooms for families?", a: "Yes. The family room has two double beds and a private bathroom, and it is just for the people included in the booking." },
        {
          q: "How much does it cost to stay at Enjoy Comfort?",
          a: "The price depends on the type of room and your dates. Tell us when you'd like to come and how many of you are travelling to see availability and the exact price.",
        },
        {
          q: "How do I book?",
          a: "Pick your dates in the search box, choose your room and rate, and pay by card on our secure payment page: your booking is confirmed straight away and you get it by email. If you prefer, you can also send us your request on WhatsApp in one click.",
        },
        {
          q: "Where can I find information for my arrival?",
          a: "The practical information page has everything you need to plan your stay. If you have any questions before booking or arriving, just get in touch with us.",
        },
      ],
    },
  },

  roomsPage: {
    eyebrow: "Rooms",
    title: "Rooms in the centre of San Sebastián",
    image: media.city.mariaCristina,
    intro: "Four types of private room, with shared or private bathroom. Choose the one that suits your trip, look at the photos and book in a minute.",
    quickNav: [
      { label: "Rooms", href: "#habitaciones" },
      { label: "Bathrooms", href: "#banos" },
      { label: "What's included", href: "#que-incluye" },
    ],
    bathrooms: {
      title: "Bathrooms",
      subtitle: "Bathrooms always spotless",
      text: "The double and the twin share a bathroom; the double with private bathroom and the family room have their own. Shared or private, they're all checked and cleaned every day.",
      image: media.bathrooms[1],
    },
    included: {
      title: "What's included",
      text: "Everything you need for a good night's sleep:",
      items: [
        { icon: "bed", title: "Bed linen", text: "Fresh sheets for every stay." },
        { icon: "shower", title: "Shared or private bathroom", text: "Depending on the room, cleaned daily." },
        { icon: "wifi", title: "Wi-Fi", text: "Connection throughout the guesthouse." },
        { icon: "key", title: "Private room", text: "Just for you or your group." },
      ],
    },
  },

  locationPage: {
    eyebrow: "Gros, San Sebastián",
    title: "Location and things to do in San Sebastián",
    image: media.city.aerial,
    quickNav: [
      { label: "Things to do nearby", href: "#que-ver" },
      { label: "Getting here", href: "#como-llegar" },
    ],
    intro: [
      "From Enjoy Comfort you're on Gros beach in no time, for a swim by the Kursaal or to catch a few waves. Afterwards, treat yourself in the bars and taverns of a neighbourhood that will win you over.",
      "The Old Town and the city centre are just a few minutes' walk away, and by the time you get there you'll wish the stroll had lasted longer.",
    ],
    places: {
      title: "Things to do nearby",
      text: "Ideas to enjoy San Sebastián on foot from the guesthouse.",
      items: [
        { icon: "waves", title: "La Concha beach", text: "The symbol of the city. A walk, a swim and a sunset facing the island.", image: media.city.bay },
        { icon: "eye", title: "The Comb of the Wind", text: "At the end of Ondarreta beach, Eduardo Chillida's sculptures facing the sea.", image: media.city.comb },
        { icon: "mountain", title: "Views over the bay", text: "Walk up Mount Urgull to see the city from above.", image: media.city.aerial },
        { icon: "utensils", title: "Pintxos crawl", text: "From bar to bar in the Old Town and the local taverns.", image: media.city.pintxos },
        { icon: "sun", title: "Waves on the promenade", text: "On stormy days the sea crashes against the promenade: quite a show.", image: media.city.waves },
      ],
    },
    mapTitle: "Getting here",
    mapText: "We're at C/ Nueva 5 - 1ºB, 20001 Donostia. With your booking confirmation we'll send you directions and how to get in.",
    mapLink: "View on Google Maps",
  },

  practical: {
    eyebrow: "Before you arrive",
    title: "Practical information",
    intro: "What you need to know to plan your stay: rooms, times, payment and how to get here.",
    image: media.detail,
    cards: [
      {
        icon: "shower",
        title: "Rooms and bathrooms",
        wide: true,
        body: [
          {
            type: "p",
            text: "All rooms are private. The double and the twin have a shared bathroom; the double with private bathroom has its own bathroom outside the room, and the family room has a private bathroom.",
          },
        ],
      },
      {
        icon: "clock",
        title: "Check-in and check-out",
        body: [
          { type: "p", text: "Check-in: from 16:00 to 22:00." },
          { type: "p", text: "Check-out: before 11:00." },
        ],
      },
      {
        icon: "creditCard",
        title: "Payment and cancellation",
        body: [
          {
            type: "ul",
            items: [
              "Flexible rate: free cancellation up to 7 days before arrival.",
              "Non-refundable rate: no cancellations; dates can be changed once, up to 7 days before.",
            ],
          },
          { type: "em", text: "You'll see the exact conditions of each rate before you book." },
        ],
      },
      {
        icon: "train",
        title: "Getting here",
        body: [
          { type: "ul", items: ["Train and bus: Donostia station", "San Sebastián airport (Hondarribia)", "Bilbao airport, with a direct bus"] },
          { type: "em", text: "We'll send you detailed directions with your confirmation." },
        ],
      },
    ],
  },

  book: {
    eyebrow: "Book direct",
    title: "Book your room",
    intro: "Pick your dates and check availability and prices for every room in real time. Book direct, no middlemen or fees.",
    notConfigured: "Online booking will be available as soon as we switch on the booking system. In the meantime, email or call us and we'll confirm availability:",
  },

  meta: {
    rooms: {
      title: "Rooms in central San Sebastián",
      description: "Double, twin and family rooms in the centre of San Sebastián, with shared or private bathroom. Book direct with no fees.",
    },
    location: {
      title: "Location and things to do in San Sebastián",
      description:
        "A central guesthouse by Gros beach, a short walk from the Old Town. Nearby: La Concha, the Comb of the Wind, Mount Urgull and pintxos bars.",
    },
    practical: {
      title: "Practical information",
      description:
        "Before you arrive at Enjoy Comfort: check-in (16:00–22:00) and check-out (11:00) times, rooms and bathrooms, payment, cancellation and how to get to Gros, San Sebastián.",
    },
    book: {
      title: "Book a room in San Sebastián",
      description:
        "Book online at our central guesthouse in San Sebastián: choose your room and dates, see real availability and prices and pay securely. Book direct with no fees.",
    },
  },

  rooms: {
    doble: {
      name: "Double room with shared bathroom",
      short: "Double",
      meta: "1 or 2 guests · Double bed · Shared bathroom",
      cardText: "A double bed and your own space to rest, whether you're travelling alone or as a couple.",
      text: "A walk around the bay, an afternoon exploring the city and a quiet place to rest at the end of the day. The double room at Enjoy Comfort has a double bed and is perfect for one or two people. The bathroom is shared with other guests.",
      specs: ["Double bed", "For one or two people", "Private room", "Shared bathroom"],
    },
    "dos-camas": {
      name: "Twin room with shared bathroom",
      short: "Twin",
      meta: "1 or 2 guests · Two single beds · Shared bathroom",
      cardText: "Two separate beds for travelling with a friend, a relative or a colleague, each at your own pace.",
      text: "If you're travelling together but would rather sleep in separate beds, this is your room. It has two single beds and is private for one or two people. The bathroom is shared with other guests.",
      specs: ["Two single beds", "For one or two people", "Private room", "Shared bathroom"],
    },
    "doble-privado": {
      name: "Double room with private bathroom",
      short: "Double with private bathroom",
      meta: "2 guests · Double bed · Private bathroom outside the room",
      cardText: "The comfort of a bathroom just for the two of you, right outside the room.",
      text: "For those who'd rather not share a bathroom. This double room has a double bed and a private bathroom for your exclusive use, just outside the room. All the peace of having your own space in the heart of San Sebastián.",
      specs: ["Double bed", "For two people", "Private room", "Private bathroom, outside the room"],
    },
    familiar: {
      name: "Family room with private bathroom",
      short: "Family",
      meta: "Up to 4 guests · Two double beds · Private bathroom",
      cardText: "Two double beds and a private bathroom, so the whole family or group can stay together.",
      text: "When you travel as a family or a group, staying in the same room makes everything easier. The family room has two double beds and a private bathroom, so you have your own space while you explore San Sebastián.",
      specs: ["Two double beds", "Up to four people", "Private room", "Private bathroom"],
    },
  },

  search: {
    aria: "Check availability",
    arrival: "Check-in",
    departure: "Check-out",
    people: "Guests",
    pick: "Choose",
    submit: "See available rooms",
    dialog: "Choose your dates",
    close: "Close",
    done: "Done",
    pickBoth: "Choose check-in and check-out",
    adults: (n: number) => (n === 1 ? "1 adult" : `${n} adults`),
    nights: (n: number) => (n === 1 ? "1 night" : `${n} nights`),
  },

  calendar: {
    prev: "Previous month",
    next: "Next month",
    loading: "Loading availability…",
    pickArrival: "Choose your check-in day.",
    pickDeparture: "Choose your check-out day.",
    changeArrival: "Tap another day to change check-in.",
    error: "The calendar could not be loaded.",
  },

  steps: { labels: ["Dates", "Room", "Your details and payment"], whatsappLast: "Your details and request", aria: "Booking steps" },

  booking: {
    fields: {
      firstnames: "First name",
      middlenames: "Middle name",
      surname: "Surname",
      surname2: "Second surname",
      address: "Address",
      postalcode: "Postcode",
      town: "Town",
      state: "Region",
      country: "Country",
      email: "Email",
      phone: "Phone",
      phone2: "Other phone",
      arrival_time: "Estimated arrival time",
      departure_time: "Estimated departure time",
    },
    optional: "(optional)",
    children: (n: number) => (n === 1 ? "1 child" : `${n} children`),
    and: "and",
    freeCancel: "Free cancellation up to 7 days before arrival",
    noCancel: "Non-refundable",
    youSave: "you save",
    upTo: (n: number) => `Up to ${n} ${n === 1 ? "guest" : "guests"}`,
    left: (n: number) => (n === 1 ? "1 left" : `${n} left`),
    total: (nights: number, perNight: string) => (nights === 1 ? "total · 1 night" : `total · ${nights} nights (${perNight}/night)`),
    quantityOf: "Quantity of",
    choose: "Choose",
    chosen: "Selected",
    yourChoice: "Your choice",
    change: "Change",
    searching: "Looking for available rooms…",
    autoUpdate: "Change the dates or guests and prices update automatically.",
    adultsLabel: "Adults",
    childrenLabel: "Children",
    promo: "Promo code",
    promoAsk: "Have a promo code?",
    apply: "Apply",
    promoRejected: "We're showing prices without the discount.",
    promoInvalid: "The promo code is not valid.",
    searchError: "Availability could not be checked.",
    connError: "Could not connect to the booking system.",
    noRooms: "There are no rooms available for those dates. Try other dates or email us at",
    combine: "No single room fits the whole group: combine several.",
    roomsAria: "Available rooms",
    features: "Features",
    rate: "Rate",
    yourBooking: "Your booking",
    discount: "Discount",
    taxes: "Taxes",
    totalLabel: "Total",
    notFit: "The rooms selected don't have enough space for the whole group.",
    conditionsOf: "Conditions of the",
    yourData: "Your details",
    comments: "Comments (optional)",
    addMore: "Add more details or a comment (optional)",
    payAndBook: "Book and pay",
    requestWhatsApp: "Request booking on WhatsApp",
    requestShort: "Request",
    saving: "Saving your booking…",
    tpvNote:
      "Secure card payment on the Redsys payment page. We check availability and price once more first. You have 30 minutes to pay; otherwise the booking is cancelled automatically.",
    whatsappNote:
      "WhatsApp opens with your request already written (room, dates and details): you just need to send it. We'll confirm availability in the same chat and nothing is charged yet. By requesting the booking you accept the",
    accept: "By booking you accept the",
    privacy: "We only use your details to manage your booking and, if needed, issue your invoice.",
    preferWhatsApp: "Prefer to book on WhatsApp?",
    redirectTitle: "Taking you to secure payment",
    redirectText: "We're holding your room. The card payment page (Redsys) will open in a few seconds. Please don't close this window.",
  },

  cookies: {
    title: "Cookies",
    text: "We use what's technically needed for the site to work and anonymous statistics without cookies. With your permission, we also measure visits and our ads with Google and Meta, and load the Google Maps map. They all set their own cookies.",
    policy: "Cookie policy (in Spanish)",
    technical: "Technical",
    technicalText: "Needed for the site to work. Always on.",
    active: "On",
    measurement: "Analytics and advertising",
    measurementText: "Google Analytics, Google Ads and the Meta pixel: how many visits and bookings come from each ad.",
    thirdParty: "Third-party services",
    thirdPartyText: "Google Maps on the Location page.",
    save: "Save",
    reject: "Reject",
    accept: "Accept",
    configure: "Settings",
  },

  map: {
    text: "The map is from Google Maps and, when it loads, Google may set its cookies. We only show it with your permission.",
    button: "Accept and show map",
  },

  gallery: { close: "Close photos", prev: "Previous photo", next: "Next photo", thumbs: "Thumbnails" },
};
