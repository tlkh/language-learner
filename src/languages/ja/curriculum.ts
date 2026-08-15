import type { LearningCollection } from "../types";

export const ESSENTIAL_PHRASE_SET_ID = "essential-phrase-kit";

export interface SceneSpec {
  id: string;
  title: string;
  description: string;
}

export interface TopicCurriculumSpec {
  collectionId: string;
  scenes: readonly [SceneSpec, SceneSpec, SceneSpec];
  relatedTopicIds: string[];
}

export const collections: LearningCollection[] = [
  {
    id: "start-connect",
    title: "Start & Connect",
    description: "The phrases, numbers, and social language that make every later interaction easier.",
    phraseSetIds: [ESSENTIAL_PHRASE_SET_ID],
    topicIds: ["greetings-small-talk", "numbers-dates-time"],
    presentation: "path"
  },
  {
    id: "arrive-get-around",
    title: "Arrive & Get Around",
    description: "Land, orient yourself, and move confidently by train or bus.",
    topicIds: ["airports-flights", "directions-navigation", "trains-stations", "buses-terminals"],
    presentation: "path"
  },
  {
    id: "stay-daily-needs",
    title: "Stay & Daily Needs",
    description: "Handle accommodation, meals, shopping, laundry, and everyday errands.",
    topicIds: ["hotels", "restaurants-food", "shopping-payments", "cleaning-laundry-hygiene"],
    presentation: "path"
  },
  {
    id: "safety-conditions",
    title: "Safety & Conditions",
    description: "Keep urgent food, weather, medical, police, and disaster language close at hand.",
    topicIds: ["food-allergies", "weather", "emergencies-help"],
    presentation: "featured"
  },
  {
    id: "explore-interests",
    title: "Explore & Interests",
    description: "Optional specialist language for photography, aircraft recognition, and public aviation events.",
    topicIds: ["photography-cameras", "aircraft-jsdf", "air-bases-shows-jsdf"],
    presentation: "optional"
  }
];

const spec = (
  collectionId: string,
  relatedTopicIds: string[],
  scenes: readonly [readonly [string, string, string], readonly [string, string, string], readonly [string, string, string]]
): TopicCurriculumSpec => ({
  collectionId,
  relatedTopicIds,
  scenes: [
    { id: scenes[0][0], title: scenes[0][1], description: scenes[0][2] },
    { id: scenes[1][0], title: scenes[1][1], description: scenes[1][2] },
    { id: scenes[2][0], title: scenes[2][1], description: scenes[2][2] }
  ]
});

export const topicCurriculum: Record<string, TopicCurriculumSpec> = {
  "greetings-small-talk": spec("start-connect", [], [
    ["meet-introduce", "Meet and introduce yourself", "Names, origins, work, study, and first meetings."],
    ["small-talk", "Small talk and invitations", "Interests, plans, friendly reactions, and invitations."],
    ["contact-partings", "Contact, occasions and partings", "Stay in touch, mark occasions, and end conversations warmly."]
  ]),
  "numbers-dates-time": spec("start-connect", [], [
    ["numbers-money", "Numbers, money and quantities", "Count, understand prices, and confirm amounts."],
    ["dates-counters", "Dates and counters", "Calendar language and the counters used in daily life."],
    ["times-schedules", "Times, schedules and duration", "Arrange times and understand how long something takes."]
  ]),
  "airports-flights": spec("arrive-get-around", [], [
    ["checkin-border", "Check-in, baggage and border control", "Documents, baggage, immigration, customs, and arrival formalities."],
    ["security-boarding", "Security, gates and boarding", "Screening, airport facilities, seats, and boarding announcements."],
    ["connections-delays", "Connections, delays and arrival", "Transfers, service changes, baggage problems, and connectivity." ]
  ]),
  "directions-navigation": spec("arrive-get-around", ["airports-flights", "trains-stations", "buses-terminals"], [
    ["places-landmarks", "Places and landmarks", "Recognize positions, streets, buildings, and common destinations."],
    ["follow-route", "Ask and follow a route", "Understand turns, crossings, distance, and walking directions."],
    ["maps-accessibility", "Maps, accessibility and getting unlost", "Use addresses, taxis, map apps, and step-free routes." ]
  ]),
  "trains-stations": spec("arrive-get-around", ["directions-navigation"], [
    ["tickets-gates", "Tickets, passes and gates", "Buy the right fare and move through station gates."],
    ["platforms-transfers", "Platforms, routes and transfers", "Find the right service and change trains confidently."],
    ["seats-disruptions", "Seats, luggage and disruptions", "Reserve space, request access, and handle service changes." ]
  ]),
  "buses-terminals": spec("arrive-get-around", ["directions-navigation"], [
    ["routes-terminals", "Routes, stops and terminals", "Find the correct stop, bay, route, and destination."],
    ["boarding-payment", "Boarding, payment and requesting a stop", "Understand local bus doors, fares, cards, and stop buttons."],
    ["express-disruptions", "Express buses, luggage and disruptions", "Manage reservations, accessibility, luggage, and delays." ]
  ]),
  hotels: spec("stay-daily-needs", ["cleaning-laundry-hygiene"], [
    ["reservation-checkin", "Reservations and check-in", "Choose a room, confirm the booking, and check in."],
    ["room-services", "Rooms, amenities and problem resolution", "Request supplies, connectivity, access, and help with room problems."],
    ["ryokan-checkout", "Ryokan, baths and check-out", "Understand Japanese-style stays, bathing etiquette, luggage, and departure." ]
  ]),
  "restaurants-food": spec("stay-daily-needs", ["food-allergies"], [
    ["enter-menu", "Entering, seating and menus", "Get a table and understand common ordering systems."],
    ["order-adjust", "Ordering and adjustments", "Choose food and drinks and request practical changes."],
    ["payment-rules", "Payment, takeaway and dining rules", "Finish the meal, split or pay the bill, and understand venue rules." ]
  ]),
  "shopping-payments": spec("stay-daily-needs", [], [
    ["products-stock", "Finding products, sizes and stock", "Locate items, compare options, and ask what is available."],
    ["prices-payment", "Prices and payment", "Understand totals, discounts, cash, cards, and cashless methods."],
    ["returns-delivery", "Tax-free, returns and delivery", "Handle tax-free purchases, declined cards, exchanges, and delivery." ]
  ]),
  "cleaning-laundry-hygiene": spec("stay-daily-needs", ["hotels"], [
    ["laundry-controls", "Laundry and machine controls", "Wash, dry, and care for clothes without guessing at the controls."],
    ["bathing-hygiene", "Bathing and hygiene", "Find toiletries and manage daily personal care."],
    ["cleaning-waste", "Cleaning and waste sorting", "Use cleaning supplies and follow local disposal rules." ]
  ]),
  "food-allergies": spec("safety-conditions", ["restaurants-food", "emergencies-help"], [
    ["allergies-restrictions", "Allergies and restrictions", "Name allergens, dietary restrictions, and severity clearly."],
    ["ingredients-cross-contact", "Ingredients, additives and cross-contact", "Read labels for additives, preservatives, and colorings, then ask about stock, utensils, and preparation."],
    ["reaction-help", "Reactions and urgent help", "Describe symptoms, show an allergy card, and request emergency help." ]
  ]),
  weather: spec("safety-conditions", ["emergencies-help"], [
    ["everyday-forecast", "Everyday forecasts", "Understand temperature, rain, wind, and ordinary forecasts."],
    ["seasonal-planning", "Seasonal planning and equipment", "Prepare for heat, cold, rain, snow, and visibility."],
    ["severe-warnings", "Severe weather and warnings", "Recognize official warnings and know when to change plans or evacuate." ]
  ]),
  "emergencies-help": spec("safety-conditions", ["food-allergies", "weather"], [
    ["medical-help", "Medical help", "Call an ambulance and describe symptoms, conditions, and medication."],
    ["police-loss", "Police, theft and lost property", "Find a police box and report theft, accidents, or missing documents."],
    ["disaster-evacuation", "Disasters and evacuation", "Follow alerts, reach shelter, and confirm safety after a disaster." ]
  ]),
  "photography-cameras": spec("explore-interests", ["aircraft-jsdf", "air-bases-shows-jsdf"], [
    ["equipment-types", "Equipment and camera types", "Discuss bodies, lenses, power, storage, and support equipment."],
    ["exposure-focus", "Exposure, focus and settings", "Describe the controls that shape a photograph or video."],
    ["permission-troubleshooting", "Permission, locations and troubleshooting", "Ask before shooting and solve common access or equipment problems." ]
  ]),
  "aircraft-jsdf": spec("explore-interests", ["air-bases-shows-jsdf", "photography-cameras"], [
    ["types-roles", "Aircraft types and roles", "Distinguish fighters, transports, support aircraft, helicopters, and service branches."],
    ["parts-systems", "Airframe parts and systems", "Name the visible structures, controls, propulsion, and sensors on an aircraft."],
    ["jsdf-recognition", "Japanese aircraft recognition", "Recognize prominent JASDF, JMSDF, and JGSDF aircraft and their markings." ]
  ]),
  "air-bases-shows-jsdf": spec("explore-interests", ["aircraft-jsdf", "photography-cameras"], [
    ["entry-logistics", "Entry and visitor logistics", "Navigate public entry, screening, transport, and event facilities."],
    ["aircraft-viewing", "Displays, schedules and viewing", "Understand static displays, flying programs, viewing areas, and announcements."],
    ["photography-safety", "Photography, safety and program changes", "Follow equipment rules and respond to weather, crowds, or schedule changes." ]
  ])
};

export const priorityOverrides: Record<string, "must-know" | "useful" | "reference"> = {
  taxi: "must-know",
  "taxi driver": "useful",
  "this address, please": "must-know",
  "ride-hailing app": "useful",
  "step-free route": "must-know",
  "wheelchair assistance": "must-know",
  eSIM: "useful",
  "charging outlet": "useful",
  "the key card does not work": "must-know",
  "no hot water": "must-know",
  noise: "useful",
  "accessible room": "must-know",
  "alternative route": "must-know"
};
