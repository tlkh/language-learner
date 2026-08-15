import type { LearningCollection } from "../types";

export const ESSENTIAL_PHRASE_SET_ID = "essential-phrase-kit";

export interface SceneSpec { id: string; title: string; description: string; }
export interface TopicCurriculumSpec {
  collectionId: string;
  scenes: readonly [SceneSpec, SceneSpec, SceneSpec];
  relatedTopicIds: string[];
}

export const collections: LearningCollection[] = [
  {
    id: "start-connect",
    title: "Start & Connect",
    description: "Greetings, numbers, and the everyday language that makes later conversations easier.",
    phraseSetIds: [ESSENTIAL_PHRASE_SET_ID],
    topicIds: ["greetings-small-talk", "numbers-dates-time"],
    presentation: "path"
  },
  {
    id: "arrive-get-around",
    title: "Arrive & Get Around",
    description: "Land, orient yourself, and move confidently around Thailand.",
    topicIds: ["airports-flights", "directions-navigation", "trains-stations", "buses-terminals"],
    presentation: "path"
  },
  {
    id: "stay-daily-needs",
    title: "Stay & Daily Needs",
    description: "Handle accommodation, meals, shopping, laundry, and daily errands.",
    topicIds: ["hotels", "restaurants-food", "shopping-payments", "cleaning-laundry-hygiene"],
    presentation: "path"
  },
  {
    id: "safety-conditions",
    title: "Safety & Conditions",
    description: "Keep food, weather, medical, and emergency language close at hand.",
    topicIds: ["food-allergies", "weather", "emergencies-help"],
    presentation: "featured"
  },
  {
    id: "explore-interests",
    title: "Explore & Connect",
    description: "Optional language for cafés, work, study, sightseeing, and local culture.",
    topicIds: ["cafes-coffee", "work-study", "sightseeing-culture"],
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
  scenes: scenes.map(([id, title, description]) => ({ id, title, description })) as unknown as TopicCurriculumSpec["scenes"]
});

export const topicCurriculum: Record<string, TopicCurriculumSpec> = {
  "greetings-small-talk": spec("start-connect", [], [
    ["meet-introduce", "Meet and introduce yourself", "Names, origins, work, study, and first meetings."],
    ["small-talk", "Small talk and invitations", "Interests, plans, friendly reactions, and invitations."],
    ["contact-partings", "Contact and partings", "Stay in touch, mark occasions, and end conversations warmly."]
  ]),
  "numbers-dates-time": spec("start-connect", [], [
    ["numbers-money", "Numbers, money and quantities", "Count, understand prices, and confirm amounts."],
    ["dates-counters", "Dates and calendar language", "Talk about days, months, appointments, and frequency."],
    ["times-schedules", "Times, schedules and duration", "Arrange times and understand how long something takes."]
  ]),
  "airports-flights": spec("arrive-get-around", [], [
    ["checkin-border", "Check-in, baggage and immigration", "Documents, baggage, customs, and arrival formalities."],
    ["security-boarding", "Security, gates and boarding", "Screening, airport facilities, seats, and announcements."],
    ["connections-delays", "Connections, delays and arrival", "Transfers, service changes, baggage problems, and arrival."]
  ]),
  "directions-navigation": spec("arrive-get-around", ["airports-flights", "trains-stations", "buses-terminals"], [
    ["places-landmarks", "Places and landmarks", "Recognize positions, streets, buildings, and destinations."],
    ["follow-route", "Ask and follow a route", "Understand turns, crossings, distance, and walking directions."],
    ["maps-accessibility", "Maps, taxis and getting unlost", "Use addresses, map apps, taxis, and accessible routes."]
  ]),
  "trains-stations": spec("arrive-get-around", ["directions-navigation"], [
    ["tickets-gates", "Tickets, passes and platforms", "Buy the right fare and find the correct platform."],
    ["routes-transfers", "Routes and transfers", "Find the right service and change trains confidently."],
    ["seats-disruptions", "Seats, luggage and disruptions", "Reserve space, handle luggage, and respond to delays."]
  ]),
  "buses-terminals": spec("arrive-get-around", ["directions-navigation"], [
    ["routes-terminals", "Routes, stops and terminals", "Find the correct stop, bay, route, and destination."],
    ["boarding-payment", "Boarding and payment", "Understand doors, fares, cards, and stop requests."],
    ["express-disruptions", "Express buses and disruptions", "Manage reservations, luggage, accessibility, and delays."]
  ]),
  hotels: spec("stay-daily-needs", ["cleaning-laundry-hygiene"], [
    ["reservation-checkin", "Reservations and check-in", "Choose a room, confirm a booking, and check in."],
    ["room-services", "Rooms and problem resolution", "Request supplies, connectivity, access, and repairs."],
    ["checkout", "Breakfast, facilities and check-out", "Use hotel facilities, settle the bill, and depart."]
  ]),
  "restaurants-food": spec("stay-daily-needs", ["food-allergies", "cafes-coffee"], [
    ["enter-menu", "Entering, seating and menus", "Get a table and understand common ordering systems."],
    ["order-adjust", "Ordering and adjustments", "Choose food and drinks and request practical changes."],
    ["payment-takeaway", "Payment and takeaway", "Finish the meal, pay the bill, and take food away."]
  ]),
  "shopping-payments": spec("stay-daily-needs", [], [
    ["products-stock", "Products, sizes and stock", "Locate items, compare options, and ask what is available."],
    ["prices-payment", "Prices and payment", "Understand totals, discounts, cash, cards, and transfers."],
    ["returns-delivery", "Returns and delivery", "Handle exchanges, refunds, warranties, and delivery."]
  ]),
  "cleaning-laundry-hygiene": spec("stay-daily-needs", ["hotels"], [
    ["laundry-controls", "Laundry and machine controls", "Wash, dry, and care for clothes without guessing."],
    ["bathing-hygiene", "Bathing and hygiene", "Find toiletries and manage daily personal care."],
    ["cleaning-waste", "Cleaning and waste", "Use cleaning supplies and sort everyday waste."]
  ]),
  "food-allergies": spec("safety-conditions", ["restaurants-food", "emergencies-help"], [
    ["allergies-restrictions", "Allergies and restrictions", "Name allergens, dietary restrictions, and severity clearly."],
    ["ingredients-cross-contact", "Ingredients and cross-contact", "Ask about labels, utensils, preparation, and stock."],
    ["reaction-help", "Reactions and urgent help", "Describe symptoms and request urgent medical help."]
  ]),
  weather: spec("safety-conditions", ["emergencies-help"], [
    ["everyday-forecast", "Everyday forecasts", "Understand temperature, rain, wind, and ordinary forecasts."],
    ["seasonal-planning", "Seasons and equipment", "Prepare for heat, storms, rain, and poor visibility."],
    ["severe-warnings", "Severe weather and warnings", "Recognize official warnings and change plans safely."]
  ]),
  "emergencies-help": spec("safety-conditions", ["food-allergies", "weather"], [
    ["medical-help", "Medical help", "Call an ambulance and describe symptoms, conditions, and medication."],
    ["police-loss", "Police, theft and lost property", "Report theft, accidents, or missing documents."],
    ["disaster-evacuation", "Disasters and evacuation", "Follow alerts, reach shelter, and confirm safety."]
  ]),
  "cafes-coffee": spec("explore-interests", ["restaurants-food", "sightseeing-culture"], [
    ["find-cafe", "Find a café and order", "Choose a café, find a seat, and order a drink."],
    ["coffee-preferences", "Coffee preferences", "Talk about beans, ice, sweetness, milk, and size."],
    ["meet-work-cafe", "Meet, work and linger", "Arrange a meeting, use Wi-Fi, and settle the bill."]
  ]),
  "work-study": spec("explore-interests", ["greetings-small-talk"], [
    ["introduce-work", "Work and study introductions", "Say what you do, where you study, and what you need."],
    ["schedule-tasks", "Schedules and tasks", "Arrange meetings, deadlines, documents, and priorities."],
    ["collaboration", "Collaboration and clarification", "Ask for examples, confirm understanding, and follow up."]
  ]),
  "sightseeing-culture": spec("explore-interests", ["directions-navigation", "cafes-coffee"], [
    ["places-tickets", "Places and tickets", "Choose attractions, buy tickets, and ask about opening hours."],
    ["customs-respect", "Customs and respectful visits", "Follow local etiquette at temples, homes, and public places."],
    ["photos-memories", "Photos and memories", "Ask permission, describe experiences, and keep in touch."]
  ])
};

export const priorityOverrides: Record<string, "must-know" | "useful" | "reference"> = {
  "สวัสดี": "must-know",
  "ขอบคุณ": "must-know",
  "ขอโทษ": "must-know",
  "ช่วยด้วย": "must-know",
  "ห้องน้ำ": "must-know",
  "โรงพยาบาล": "must-know",
  "แพ้": "must-know",
  "ไม่เผ็ด": "must-know",
  "เท่าไร": "must-know",
  "ที่อยู่นี้": "must-know",
  "แท็กซี่": "useful",
  "ไวไฟ": "useful",
  "ที่ชาร์จโทรศัพท์": "useful"
};
