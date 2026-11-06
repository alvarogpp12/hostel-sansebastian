import { media } from "../media";
import type { Dict } from "./es";

const legalNote = "(en espagnol)";

export const fr: Dict = {
  site: {
    description: "Votre hébergement en plein centre de Saint-Sébastien. Chambres doubles, twin et familiales, avec salle de bain partagée ou privée.",
    slogan: "Central, confortable et calme.",
    seo: {
      title: "Enjoy Comfort Saint-Sébastien · Site officiel | Pension au centre de Donostia",
      description:
        "Site officiel d'Enjoy Comfort, pension au 5 Calle Nueva, quartier de Gros, au centre de Saint-Sébastien, à côté de la plage de Gros et à quelques minutes de la Vieille Ville. Réservation directe, sans frais.",
    },
    nav: [
      { label: "Chambres", href: "/fr/chambres" },
      { label: "Pourquoi nous choisir", href: "/fr#por-que-elegirnos" },
      { label: "Emplacement", href: "/fr/emplacement" },
      { label: "Questions fréquentes", href: "/fr#preguntas-frecuentes" },
    ],
    footerNav: [
      { label: "Accueil", href: "/fr" },
      { label: "Chambres", href: "/fr/chambres" },
      { label: "Emplacement et que voir", href: "/fr/emplacement" },
      { label: "Informations pratiques", href: "/fr/informations-pratiques" },
      { label: "Voir les disponibilités", href: "/fr/reserver" },
    ],
    legal: {
      list: [
        { label: `Mentions légales ${legalNote}`, href: "/aviso-legal" },
        { label: `Politique de confidentialité ${legalNote}`, href: "/privacidad" },
        { label: `Politique de cookies ${legalNote}`, href: "/cookies" },
        { label: `Conditions générales ${legalNote}`, href: "/terminos" },
      ],
      privacy: { label: "Politique de confidentialité", href: "/privacidad" },
      terms: { label: "Conditions générales", href: "/terminos" },
      rights: "© Enjoy Comfort. Tous droits réservés.",
      cookieSettings: "Paramètres des cookies",
    },
    cta: {
      title: "Votre prochaine escapade à Saint-Sébastien commence ici",
      text: "Indiquez vos dates et voyez tout de suite quelles chambres sont libres et à quel prix.",
    },
    ui: {
      menu: "Menu",
      skipToContent: "Aller au contenu",
      openGallery: "Voir les photos",
      close: "Fermer",
      book: "Réserver",
      perNight: "/nuit",
      footerIntro: "Votre hébergement en plein centre de Saint-Sébastien. Chambres doubles, twin et familiales, avec salle de bain partagée ou privée.",
      footerContactTitle: "Une question ?",
      footerContactText: "Écrivez-nous et nous vous aiderons à préparer votre séjour.",
      footerExplore: "Découvrir Enjoy Comfort",
      footerLegal: "Informations légales",
      bookThis: "Réserver cette chambre",
      directBooking: "Réservation directe",
      seeDetails: "Voir photos et détails",
      finalPrice: "Prix final selon vos dates",
      consultPrice: "Voir le prix",
      from: "à partir de",
      locationLink: "Emplacement et que voir",
      practicalLink: "Informations pratiques",
      onThisPage: "Sur cette page",
      mapOf: "Carte de",
      language: "Langue",
      main: "Principal",
      roomsAria: "Chambres",
    },
    whatsapp: { label: "Écrivez-nous sur WhatsApp", text: "Bonjour, je souhaiterais des informations sur un séjour à Enjoy Comfort." },
  },

  home: {
    hero: {
      h1: "Enjoy Comfort · Votre hébergement au centre de Saint-Sébastien",
      title: ["Central, confortable", "et calme."],
      lead: "Choisissez vos dates et voyez tout de suite les chambres libres. Réservez en une minute, directement auprès de nous.",
      image: media.city.bay,
      trust: ["Réservation directe, sans frais", "Disponibilités et prix réels", "Paiement sécurisé par carte"],
    },
    rooms: {
      eyebrow: "Chambres",
      title: "Trouvez votre chambre à Saint-Sébastien",
      text: "Chaque voyage est différent. Choisissez la chambre qui vous convient et vérifiez les disponibilités pour vos dates.",
    },
    features: {
      title: "Pourquoi choisir Enjoy Comfort ?",
      items: [
        {
          icon: "key",
          title: "Une chambre pour chaque voyage",
          text: "Double, twin ou familiale, avec salle de bain partagée ou privée. Choisissez selon vos compagnons de voyage : la chambre est réservée à vous seuls.",
        },
        {
          icon: "marker",
          title: "En plein centre",
          text: "La plage de Gros et le Kursaal sont à deux pas, et la Vieille Ville et le centre à une courte promenade.",
        },
        {
          icon: "globe",
          title: "Un contact direct avec nous",
          text: "Vérifiez les disponibilités, posez vos questions et préparez votre arrivée avec Enjoy Comfort. Nous vous aidons à choisir parmi les options disponibles.",
        },
      ],
    },
    city: {
      eyebrow: "Saint-Sébastien à votre rythme",
      title: "Des idées pour remplir votre escapade sans tout planifier",
      items: [
        { title: "Une balade sur La Concha", text: "Faites le tour de la baie, marchez le long de la plage et prenez le temps de vous asseoir face à la mer.", image: media.city.bay },
        { title: "Le Peigne du Vent", text: "Les sculptures d'Eduardo Chillida face à l'Atlantique, là où l'art rencontre la mer.", image: media.city.comb },
        { title: "La Vieille Ville et le centre", text: "Perdez-vous dans ses ruelles et flânez sur le Boulevard. Tout le charme est de la découvrir sans hâte.", image: media.city.aerial },
        { title: "Une tournée des pintxos", text: "Prenez le temps de goûter la cuisine locale. Choisissez vos bars et faites la tournée à votre façon.", image: media.city.pintxos },
      ],
    },
    faq: {
      title: "Questions fréquentes",
      items: [
        {
          q: "Quel type d'hébergement est Enjoy Comfort ?",
          a: "Enjoy Comfort est une pension une étoile au centre de Saint-Sébastien, à quelques minutes de la plage de Gros et de la Vieille Ville. Nous proposons des chambres doubles, twin et familiales, avec salle de bain partagée ou privée selon la chambre.",
        },
        { q: "Les chambres sont-elles privées ?", a: "Oui. Toutes les chambres sont privées : vous ne les partagez qu'avec les personnes qui voyagent avec vous." },
        {
          q: "Les salles de bain sont-elles privées ou partagées ?",
          a: "Cela dépend de la chambre. La double et la twin partagent une salle de bain avec d'autres clients. La double avec salle de bain privée dispose d'une salle de bain exclusive située hors de la chambre, et la familiale a sa salle de bain privée.",
        },
        {
          q: "Puis-je choisir entre un lit double et deux lits ?",
          a: "Oui. Nous avons une chambre double avec un lit double et une chambre twin avec deux lits simples. Les deux peuvent être réservées pour une ou deux personnes.",
        },
        { q: "Avez-vous des chambres pour les familles ?", a: "Oui. La chambre familiale dispose de deux lits doubles et d'une salle de bain privée, réservée aux personnes incluses dans la réservation." },
        {
          q: "Combien coûte un séjour à Enjoy Comfort ?",
          a: "Le prix dépend du type de chambre et de vos dates. Indiquez-nous quand vous souhaitez venir et combien vous êtes pour connaître les disponibilités et le prix exact.",
        },
        {
          q: "Comment réserver ?",
          a: "Choisissez vos dates dans le moteur de recherche, sélectionnez la chambre et le tarif, puis payez par carte sur notre page de paiement sécurisée : la réservation est confirmée immédiatement et vous la recevez par e-mail. Si vous préférez, vous pouvez aussi nous envoyer votre demande sur WhatsApp en un clic.",
        },
        {
          q: "Où trouver les informations pour mon arrivée ?",
          a: "La page d'informations pratiques réunit tout ce qu'il faut pour préparer votre séjour. Pour toute question avant de réserver ou d'arriver, contactez-nous directement.",
        },
      ],
    },
  },

  roomsPage: {
    eyebrow: "Chambres",
    title: "Chambres au centre de Saint-Sébastien",
    image: media.city.mariaCristina,
    intro: "Quatre types de chambres privées, avec salle de bain partagée ou privée. Choisissez celle qui convient à votre voyage, regardez les photos et réservez en une minute.",
    quickNav: [
      { label: "Chambres", href: "#habitaciones" },
      { label: "Salles de bain", href: "#banos" },
      { label: "Ce qui est inclus", href: "#que-incluye" },
    ],
    bathrooms: {
      title: "Salles de bain",
      subtitle: "Des salles de bain toujours impeccables",
      text: "La double et la twin partagent une salle de bain ; la double avec salle de bain privée et la familiale ont la leur. Partagées ou privées, elles sont toutes vérifiées et nettoyées chaque jour.",
      image: media.bathrooms[1],
    },
    included: {
      title: "Ce qui est inclus",
      text: "Tout le nécessaire pour bien vous reposer :",
      items: [
        { icon: "bed", title: "Linge de lit", text: "Draps propres à chaque séjour." },
        { icon: "shower", title: "Salle de bain partagée ou privée", text: "Selon la chambre, nettoyée chaque jour." },
        { icon: "wifi", title: "Wi-Fi", text: "Connexion dans tout l'établissement." },
        { icon: "key", title: "Chambre privée", text: "Rien que pour vous ou votre groupe." },
      ],
    },
  },

  locationPage: {
    eyebrow: "Gros, Saint-Sébastien",
    title: "Emplacement et que voir à Saint-Sébastien",
    image: media.city.aerial,
    quickNav: [
      { label: "Que voir à proximité", href: "#que-ver" },
      { label: "Comment venir", href: "#como-llegar" },
    ],
    intro: [
      "Depuis Enjoy Comfort, vous êtes en un rien de temps sur la plage de Gros pour une baignade près du Kursaal ou pour surfer quelques vagues. Ensuite, faites-vous plaisir dans les bars et tavernes d'un quartier qui va vous séduire.",
      "La Vieille Ville et le centre sont à quelques minutes à pied, et en arrivant vous regretterez que la promenade n'ait pas duré plus longtemps.",
    ],
    places: {
      title: "Que voir à proximité",
      text: "Des idées pour profiter de Saint-Sébastien à pied depuis la pension.",
      items: [
        { icon: "waves", title: "Plage de La Concha", text: "Le symbole de la ville. Promenade, baignade et coucher de soleil face à l'île.", image: media.city.bay },
        { icon: "eye", title: "Le Peigne du Vent", text: "Au bout de la plage d'Ondarreta, les sculptures d'Eduardo Chillida face à la mer.", image: media.city.comb },
        { icon: "mountain", title: "Vues sur la baie", text: "Montez à pied au mont Urgull pour voir la ville d'en haut.", image: media.city.aerial },
        { icon: "utensils", title: "Tournée des pintxos", text: "De comptoir en comptoir dans la Vieille Ville et les tavernes du quartier.", image: media.city.pintxos },
        { icon: "sun", title: "Les vagues sur la promenade", text: "Les jours de tempête, la mer se brise contre la promenade : un vrai spectacle.", image: media.city.waves },
      ],
    },
    mapTitle: "Comment venir",
    mapText: "Nous sommes au C/ Nueva 5 - 1ºB, 20001 Donostia. Avec la confirmation de votre réservation, nous vous envoyons l'itinéraire et comment entrer.",
    mapLink: "Voir sur Google Maps",
  },

  practical: {
    eyebrow: "Avant votre arrivée",
    title: "Informations pratiques",
    intro: "Ce qu'il faut savoir pour préparer votre séjour : chambres, horaires, paiement et comment venir.",
    image: media.detail,
    cards: [
      {
        icon: "shower",
        title: "Chambres et salles de bain",
        wide: true,
        body: [
          {
            type: "p",
            text: "Toutes les chambres sont privées. La double et la twin ont une salle de bain partagée ; la double avec salle de bain privée dispose d'une salle de bain exclusive hors de la chambre, et la familiale d'une salle de bain privée.",
          },
        ],
      },
      {
        icon: "clock",
        title: "Arrivée et départ",
        body: [
          { type: "p", text: "Arrivée (check-in) : de 16 h à 22 h." },
          { type: "p", text: "Départ (check-out) : avant 11 h." },
        ],
      },
      {
        icon: "creditCard",
        title: "Paiement et annulation",
        body: [
          {
            type: "ul",
            items: [
              "Tarif flexible : annulation gratuite jusqu'à 7 jours avant l'arrivée.",
              "Tarif non remboursable : pas d'annulation ; les dates peuvent être modifiées une fois, jusqu'à 7 jours avant.",
            ],
          },
          { type: "em", text: "Vous verrez les conditions exactes de chaque tarif avant de réserver." },
        ],
      },
      {
        icon: "train",
        title: "Comment venir",
        body: [
          { type: "ul", items: ["Train et bus : gare de Donostia", "Aéroport de Saint-Sébastien (Hondarribia)", "Aéroport de Bilbao, avec bus direct"] },
          { type: "em", text: "Nous vous envoyons un itinéraire détaillé avec la confirmation." },
        ],
      },
    ],
  },

  book: {
    eyebrow: "Réservation directe",
    title: "Réservez votre chambre",
    intro: "Choisissez vos dates et voyez en temps réel les disponibilités et le prix de chaque chambre. Réservation directe, sans intermédiaires ni frais.",
    notConfigured:
      "La réservation en ligne sera disponible dès l'activation du système de réservation. En attendant, écrivez-nous ou appelez-nous et nous vous confirmerons les disponibilités :",
  },

  meta: {
    rooms: {
      title: "Chambres au centre de Saint-Sébastien",
      description: "Chambres doubles, twin et familiales au centre de Saint-Sébastien, avec salle de bain partagée ou privée. Réservation directe sans frais.",
    },
    location: {
      title: "Emplacement et que voir à Saint-Sébastien",
      description:
        "Une pension centrale près de la plage de Gros, à quelques pas de la Vieille Ville. À proximité : La Concha, le Peigne du Vent, le mont Urgull et les bars à pintxos.",
    },
    practical: {
      title: "Informations pratiques",
      description:
        "Avant d'arriver à Enjoy Comfort : horaires d'arrivée (16 h–22 h) et de départ (11 h), chambres et salles de bain, paiement, annulation et accès au quartier de Gros, à Saint-Sébastien.",
    },
    book: {
      title: "Réserver une chambre à Saint-Sébastien",
      description:
        "Réservez en ligne dans notre pension au centre de Saint-Sébastien : choisissez chambre et dates, voyez les disponibilités et prix réels et payez en toute sécurité. Réservation directe sans frais.",
    },
  },

  rooms: {
    doble: {
      name: "Chambre double avec salle de bain partagée",
      short: "Double",
      meta: "1 ou 2 personnes · Lit double · Salle de bain partagée",
      cardText: "Un lit double et votre propre espace pour vous reposer, seul ou en couple.",
      text: "Une promenade autour de la baie, un après-midi à découvrir la ville et un endroit calme pour vous reposer en fin de journée. La chambre double d'Enjoy Comfort a un lit double et convient parfaitement à une ou deux personnes. La salle de bain est partagée avec d'autres clients.",
      specs: ["Lit double", "Pour une ou deux personnes", "Chambre privée", "Salle de bain partagée"],
    },
    "dos-camas": {
      name: "Chambre twin avec salle de bain partagée",
      short: "Twin",
      meta: "1 ou 2 personnes · Deux lits simples · Salle de bain partagée",
      cardText: "Deux lits séparés pour voyager avec un ami, un proche ou un collègue, chacun à son rythme.",
      text: "Si vous voyagez ensemble mais préférez dormir chacun dans votre lit, cette chambre est faite pour vous. Elle a deux lits simples et est privée pour une ou deux personnes. La salle de bain est partagée avec d'autres clients.",
      specs: ["Deux lits simples", "Pour une ou deux personnes", "Chambre privée", "Salle de bain partagée"],
    },
    "doble-privado": {
      name: "Chambre double avec salle de bain privée",
      short: "Double avec salle de bain privée",
      meta: "2 personnes · Lit double · Salle de bain privée hors de la chambre",
      cardText: "Le confort d'une salle de bain rien que pour vous deux, juste à côté de la chambre.",
      text: "Pour ceux qui préfèrent ne pas partager la salle de bain. Cette chambre double a un lit double et une salle de bain privée à usage exclusif, située juste hors de la chambre. Toute la tranquillité d'un espace à vous en plein Saint-Sébastien.",
      specs: ["Lit double", "Pour deux personnes", "Chambre privée", "Salle de bain privée, hors de la chambre"],
    },
    familiar: {
      name: "Chambre familiale avec salle de bain privée",
      short: "Familiale",
      meta: "Jusqu'à 4 personnes · Deux lits doubles · Salle de bain privée",
      cardText: "Deux lits doubles et une salle de bain privée pour venir en famille ou entre amis et rester ensemble.",
      text: "En famille ou en groupe, loger dans la même chambre simplifie tout. La chambre familiale a deux lits doubles et une salle de bain privée, pour avoir votre propre espace pendant que vous découvrez Saint-Sébastien.",
      specs: ["Deux lits doubles", "Jusqu'à quatre personnes", "Chambre privée", "Salle de bain privée"],
    },
  },

  search: {
    aria: "Vérifier les disponibilités",
    arrival: "Arrivée",
    departure: "Départ",
    people: "Personnes",
    pick: "Choisir",
    submit: "Voir les chambres libres",
    dialog: "Choisissez vos dates",
    close: "Fermer",
    done: "Valider",
    pickBoth: "Choisissez l'arrivée et le départ",
    adults: (n: number) => (n === 1 ? "1 adulte" : `${n} adultes`),
    nights: (n: number) => (n === 1 ? "1 nuit" : `${n} nuits`),
  },

  calendar: {
    prev: "Mois précédent",
    next: "Mois suivant",
    loading: "Chargement des disponibilités…",
    pickArrival: "Choisissez le jour d'arrivée.",
    pickDeparture: "Choisissez le jour de départ.",
    changeArrival: "Touchez un autre jour pour changer l'arrivée.",
    error: "Le calendrier n'a pas pu être chargé.",
  },

  steps: { labels: ["Dates", "Chambre", "Vos coordonnées et paiement"], whatsappLast: "Vos coordonnées et demande", aria: "Étapes de la réservation" },

  booking: {
    fields: {
      firstnames: "Prénom",
      middlenames: "Deuxième prénom",
      surname: "Nom",
      surname2: "Deuxième nom",
      address: "Adresse",
      postalcode: "Code postal",
      town: "Ville",
      state: "Région",
      country: "Pays",
      email: "E-mail",
      phone: "Téléphone",
      phone2: "Autre téléphone",
      arrival_time: "Heure d'arrivée prévue",
      departure_time: "Heure de départ prévue",
    },
    optional: "(facultatif)",
    children: (n: number) => (n === 1 ? "1 enfant" : `${n} enfants`),
    and: "et",
    freeCancel: "Annulation gratuite jusqu'à 7 jours avant l'arrivée",
    noCancel: "Non remboursable",
    youSave: "vous économisez",
    upTo: (n: number) => `Jusqu'à ${n} ${n === 1 ? "personne" : "personnes"}`,
    left: (n: number) => (n === 1 ? "plus qu'1" : `plus que ${n}`),
    total: (nights: number, perNight: string) => (nights === 1 ? "total · 1 nuit" : `total · ${nights} nuits (${perNight}/nuit)`),
    quantityOf: "Quantité de",
    choose: "Choisir",
    chosen: "Choisie",
    yourChoice: "Votre choix",
    change: "Modifier",
    searching: "Recherche des chambres libres…",
    autoUpdate: "Modifiez les dates ou le nombre de personnes : les prix se mettent à jour automatiquement.",
    adultsLabel: "Adultes",
    childrenLabel: "Enfants",
    promo: "Code promo",
    promoAsk: "Vous avez un code promo ?",
    apply: "Appliquer",
    promoRejected: "Nous affichons les prix sans réduction.",
    promoInvalid: "Le code promo n'est pas valide.",
    searchError: "Les disponibilités n'ont pas pu être vérifiées.",
    connError: "Impossible de se connecter au système de réservation.",
    noRooms: "Aucune chambre libre pour ces dates. Essayez d'autres dates ou écrivez-nous à",
    combine: "Aucune chambre ne suffit pour tout le groupe : combinez-en plusieurs.",
    roomsAria: "Chambres disponibles",
    features: "Caractéristiques",
    rate: "Tarif",
    yourBooking: "Votre réservation",
    discount: "Réduction",
    taxes: "Taxes",
    totalLabel: "Total",
    notFit: "Les chambres choisies n'ont pas assez de places pour tout le groupe.",
    conditionsOf: "Conditions du",
    yourData: "Vos coordonnées",
    comments: "Commentaires (facultatif)",
    addMore: "Ajouter d'autres informations ou un commentaire (facultatif)",
    payAndBook: "Réserver et payer",
    requestWhatsApp: "Demander la réservation sur WhatsApp",
    requestShort: "Demander",
    saving: "Enregistrement de votre réservation…",
    tpvNote:
      "Paiement sécurisé par carte sur la page de paiement Redsys. Nous vérifions d'abord à nouveau disponibilités et prix. Vous avez 30 minutes pour payer ; sinon, la réservation est annulée automatiquement.",
    whatsappNote:
      "WhatsApp s'ouvre avec votre demande déjà rédigée (chambre, dates et coordonnées) : il suffit de l'envoyer. Nous confirmons la disponibilité dans la même conversation et rien n'est débité pour l'instant. En demandant la réservation, vous acceptez les",
    accept: "En réservant, vous acceptez les",
    privacy: "Nous utilisons vos données uniquement pour gérer votre réservation et, si besoin, établir votre facture.",
    preferWhatsApp: "Vous préférez réserver sur WhatsApp ?",
    redirectTitle: "Direction le paiement sécurisé",
    redirectText: "Nous gardons votre chambre. La page de paiement par carte (Redsys) s'ouvre dans quelques secondes. Ne fermez pas cette fenêtre.",
  },

  cookies: {
    title: "Cookies",
    text: "Nous utilisons le strict nécessaire au fonctionnement du site et des statistiques anonymes sans cookies. Avec votre accord, nous mesurons aussi les visites et nos publicités avec Google et Meta, et chargeons la carte Google Maps. Tous déposent leurs propres cookies.",
    policy: "Politique de cookies (en espagnol)",
    technical: "Techniques",
    technicalText: "Nécessaires au fonctionnement du site. Toujours actifs.",
    active: "Actifs",
    measurement: "Mesure d'audience et publicité",
    measurementText: "Google Analytics, Google Ads et le pixel Meta : combien de visites et de réservations viennent de chaque annonce.",
    thirdParty: "Services tiers",
    thirdPartyText: "Carte Google Maps sur la page Emplacement.",
    save: "Enregistrer",
    reject: "Refuser",
    accept: "Accepter",
    configure: "Paramétrer",
  },

  map: {
    text: "La carte provient de Google Maps et, en la chargeant, Google peut déposer ses cookies. Nous ne l'affichons qu'avec votre accord.",
    button: "Accepter et voir la carte",
  },

  gallery: { close: "Fermer les photos", prev: "Photo précédente", next: "Photo suivante", thumbs: "Miniatures" },
};
