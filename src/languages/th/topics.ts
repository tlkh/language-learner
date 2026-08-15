import { buildTopic, dialogue, v, type TopicSeed } from "./helpers";

const seeds: TopicSeed[] = [
  {
    id: "greetings-small-talk", title: "Greetings & Small Talk", shortTitle: "Greetings",
    description: "Meet people, introduce yourself, make plans, and leave conversations warmly.", category: "essentials",
    domain: [
      v("name", "ชื่อ", "chue"), v("age", "อายุ", "a-yu"), v("country", "ประเทศ", "pra-thet"), v("city", "เมือง", "mueang"), v("language", "ภาษา", "pha-sa"), v("occupation", "อาชีพ", "a-chip"), v("student", "นักเรียน", "nak-rian"), v("friend", "เพื่อน", "phuean"),
      v("family", "ครอบครัว", "khrop-khrua"), v("married", "แต่งงานแล้ว", "taeng-ngan-laeo", "adjective"), v("single", "โสด", "sot", "adjective"), v("interesting", "น่าสนใจ", "na-son-jai", "adjective"), v("free / available", "ว่าง", "wang", "adjective"), v("busy", "ยุ่ง", "yung", "adjective"), v("plan", "แผน", "phaen"), v("weekend", "สุดสัปดาห์", "sut-sap-da"),
      v("invitation", "คำเชิญ", "kham-choen"), v("accept", "ตกลง", "tok-long", "verb"), v("decline", "ปฏิเสธ", "pa-ti-set", "verb"), v("happy", "มีความสุข", "mee-khwam-suk", "adjective"), v("tired", "เหนื่อย", "nueai", "adjective"), v("hot", "ร้อน", "ron", "adjective"), v("cold", "หนาว", "nao", "adjective"), v("long time no see", "ไม่ได้เจอกันนาน", "mai-dai-joe-kan-nan", "phrase")
    ],
    dialogues: [
      dialogue("greetings-meet", "First meeting", "Introduce yourself to someone new.", [["traveler", "Hello. My name is Alex.", "สวัสดี ฉันชื่ออเล็กซ์"], ["local", "Nice to meet you. Where are you from?", "ยินดีที่ได้รู้จัก คุณมาจากไหน"], ["traveler", "I am from Canada.", "ฉันมาจากแคนาดา"]]),
      dialogue("greetings-small-talk", "Making plans", "Make a simple plan with a new friend.", [["traveler", "Are you free this weekend?", "สุดสัปดาห์นี้คุณว่างไหม"], ["local", "Yes, I am free on Saturday.", "ใช่ ฉันว่างวันเสาร์"], ["traveler", "Would you like to have coffee?", "คุณอยากไปดื่มกาแฟไหม"]]),
      dialogue("greetings-partings", "Parting warmly", "End a friendly conversation.", [["local", "It was nice talking with you.", "คุยกับคุณสนุกมาก"], ["traveler", "Thank you. See you again.", "ขอบคุณ แล้วพบกันใหม่"], ["local", "Have a good day!", "ขอให้เป็นวันที่ดี"]])
    ]
  },
  {
    id: "numbers-dates-time", title: "Numbers, Dates & Time", shortTitle: "Numbers & Time",
    description: "Count, understand prices, arrange appointments, and talk about duration.", category: "essentials",
    domain: [
      v("one", "หนึ่ง", "nueng", "number"), v("two", "สอง", "song", "number"), v("three", "สาม", "sam", "number"), v("four", "สี่", "see", "number"), v("five", "ห้า", "ha", "number"), v("six", "หก", "hok", "number"), v("seven", "เจ็ด", "jet", "number"), v("eight", "แปด", "paet", "number"),
      v("nine", "เก้า", "kao", "number"), v("ten", "สิบ", "sip", "number"), v("hundred", "ร้อย", "roi", "number"), v("thousand", "พัน", "phan", "number"), v("price", "ราคา", "ra-kha"), v("money", "เงิน", "ngoen"), v("change", "เงินทอน", "ngoen-thon"), v("cheap", "ถูก", "thuk", "adjective"),
      v("expensive", "แพง", "phaeng", "adjective"), v("total", "ทั้งหมด", "thang-mot"), v("quantity", "จำนวน", "jam-nuan"), v("pair", "คู่", "khuu"), v("piece", "ชิ้น", "chin"), v("kilogram", "กิโลกรัม", "ki-lo-gram"), v("hour", "ชั่วโมง", "chua-mong"), v("minute", "นาที", "na-thee")
    ],
    dialogues: [
      dialogue("numbers-money", "At a market", "Confirm a quantity and price.", [["traveler", "How much is this?", "อันนี้ราคาเท่าไร"], ["local", "It is fifty baht.", "ห้าสิบบาท"], ["traveler", "I would like two pieces, please.", "ขอสองชิ้นครับ/ค่ะ"]]),
      dialogue("numbers-dates", "Making an appointment", "Arrange a day and time.", [["traveler", "What day is the appointment?", "นัดวันไหน"], ["local", "It is on Monday the tenth.", "วันจันทร์ที่สิบ"], ["traveler", "What time should I come?", "ฉันควรมากี่โมง"]]),
      dialogue("numbers-time", "Running late", "Explain a delay.", [["traveler", "I am sorry, I am late.", "ขอโทษ ฉันมาสาย"], ["local", "That is okay. How long will it take?", "ไม่เป็นไร ใช้เวลานานแค่ไหน"], ["traveler", "About thirty minutes.", "ประมาณสามสิบนาที"]])
    ]
  },
  {
    id: "airports-flights", title: "Airports & Flights", shortTitle: "Airports",
    description: "Handle check-in, baggage, immigration, security, boarding, and flight changes.", category: "travel",
    domain: [
      v("airport", "สนามบิน", "sa-nam-bin"), v("flight", "เที่ยวบิน", "thiao-bin"), v("ticket", "ตั๋วเครื่องบิน", "tua-khrueang-bin"), v("passport", "หนังสือเดินทาง", "nang-sue-doen-thang"), v("visa", "วีซ่า", "wee-sa"), v("check-in counter", "เคาน์เตอร์เช็กอิน", "khao-ter-chek-in"), v("boarding pass", "บัตรขึ้นเครื่อง", "bat-khuen-khrueang"), v("luggage", "สัมภาระ", "sam-pha-ra"),
      v("suitcase", "กระเป๋าเดินทาง", "kra-pao-doen-thang"), v("carry-on bag", "กระเป๋าถือขึ้นเครื่อง", "kra-pao-thue-khuen-khrueang"), v("checked baggage", "สัมภาระโหลดใต้เครื่อง", "sam-pha-ra-load-tai-khrueang"), v("baggage claim", "จุดรับกระเป๋า", "jut-rap-kra-pao"), v("customs", "ศุลกากร", "sun-la-ka-kon"), v("immigration", "ตรวจคนเข้าเมือง", "truat-khon-khao-mueang"), v("security check", "จุดตรวจความปลอดภัย", "jut-truat-khwam-plot-phai"), v("gate", "ประตูขึ้นเครื่อง", "pra-tu-khuen-khrueang"),
      v("terminal", "อาคารผู้โดยสาร", "a-khan-phu-doi-san"), v("departure", "ขาออก", "kha-ok"), v("arrival", "ขาเข้า", "kha-khao"), v("seat", "ที่นั่ง", "thi-nang"), v("window seat", "ที่นั่งริมหน้าต่าง", "thi-nang-rim-na-tang"), v("delay", "ล่าช้า", "la-cha"), v("cancel", "ยกเลิก", "yok-loek", "verb"), v("connection", "เที่ยวบินต่อ", "thiao-bin-to")
    ],
    dialogues: [
      dialogue("airport-checkin", "Checking in", "Complete check-in and baggage drop.", [["traveler", "Here is my passport and ticket.", "นี่คือหนังสือเดินทางและตั๋วของฉัน"], ["local", "Do you have any checked baggage?", "มีสัมภาระโหลดไหม"], ["traveler", "Yes, one suitcase.", "มี กระเป๋าหนึ่งใบ"]]),
      dialogue("airport-boarding", "Finding the gate", "Ask about security and boarding.", [["traveler", "Where is gate twelve?", "ประตูสิบสองอยู่ที่ไหน"], ["local", "Go through security and turn left.", "ผ่านจุดตรวจแล้วเลี้ยวซ้าย"], ["traveler", "When does boarding start?", "เริ่มขึ้นเครื่องกี่โมง"]]),
      dialogue("airport-delay", "A delayed connection", "Handle a changed flight.", [["traveler", "My flight is delayed. What should I do?", "เที่ยวบินของฉันล่าช้า ต้องทำอย่างไร"], ["local", "Please wait for the new announcement.", "กรุณารอประกาศใหม่"], ["traveler", "Can I still make my connection?", "ฉันยังต่อเที่ยวบินทันไหม"]])
    ]
  },
  {
    id: "directions-navigation", title: "Directions & Navigation", shortTitle: "Directions",
    description: "Ask for places, follow routes, use addresses, and find your way again.", category: "travel",
    domain: [
      v("street", "ถนน", "thanong"), v("road", "ทาง", "thang"), v("address", "ที่อยู่", "thi-yu"), v("map", "แผนที่", "phaen-thi"), v("landmark", "จุดสังเกต", "jut-sang-ket"), v("building", "อาคาร", "a-khan"), v("entrance", "ทางเข้า", "thang-khao"), v("exit", "ทางออก", "thang-ok"),
      v("intersection", "สี่แยก", "see-yaek"), v("traffic light", "ไฟจราจร", "fai-ja-ra-jorn"), v("bridge", "สะพาน", "sa-phan"), v("river", "แม่น้ำ", "mae-nam"), v("left", "ซ้าย", "sai"), v("right", "ขวา", "khwa"), v("straight", "ตรงไป", "trong-pai", "adverb"), v("turn", "เลี้ยว", "liao", "verb"),
      v("near", "ใกล้", "klai", "adjective"), v("far", "ไกล", "klai", "adjective"), v("next to", "ข้างๆ", "khang-khang"), v("opposite", "ตรงข้าม", "trong-kham"), v("walk", "เดิน", "doen", "verb"), v("motorbike taxi", "มอเตอร์ไซค์รับจ้าง", "mo-toe-sai-rap-jang"), v("taxi driver", "คนขับแท็กซี่", "khon-khap-taek-see"), v("lost", "หลงทาง", "long-thang", "adjective")
    ],
    dialogues: [
      dialogue("directions-landmarks", "Finding a landmark", "Ask where a place is.", [["traveler", "Excuse me, where is the market?", "ขอโทษ ตลาดอยู่ที่ไหน"], ["local", "It is next to the bridge.", "อยู่ข้างๆสะพาน"], ["traveler", "Is it far from here?", "ไกลจากที่นี่ไหม"]]),
      dialogue("directions-route", "Following a route", "Confirm turns and crossings.", [["traveler", "Should I turn left at the light?", "ฉันควรเลี้ยวซ้ายที่ไฟจราจรไหม"], ["local", "No, go straight and turn right.", "ไม่ต้อง ตรงไปแล้วเลี้ยวขวา"], ["traveler", "How long does it take on foot?", "เดินใช้เวลานานแค่ไหน"]]),
      dialogue("directions-lost", "Getting unlost", "Use an address or taxi.", [["traveler", "I am lost. Can you help me?", "ฉันหลงทาง ช่วยได้ไหม"], ["local", "Show me the address on your phone.", "แสดงที่อยู่ในโทรศัพท์ให้ฉันดู"], ["traveler", "I will take a taxi there.", "ฉันจะนั่งแท็กซี่ไปที่นั่น"]])
    ]
  },
  {
    id: "trains-stations", title: "Trains & Stations", shortTitle: "Trains",
    description: "Buy fares, find platforms, transfer between services, and handle rail disruptions.", category: "travel",
    domain: [
      v("train", "รถไฟ", "rot-fai"), v("station", "สถานีรถไฟ", "sa-tha-nee-rot-fai"), v("platform", "ชานชาลา", "chan-cha-la"), v("route", "เส้นทาง", "sen-thang"), v("one-way ticket", "ตั๋วเที่ยวเดียว", "tua-thiao-diao"), v("return ticket", "ตั๋วไปกลับ", "tua-pai-klap"), v("seat reservation", "จองที่นั่ง", "jong-thi-nang"), v("coach", "ตู้รถไฟ", "tu-rot-fai"),
      v("soft seat", "ที่นั่งนุ่ม", "thi-nang-num"), v("sleeper", "ตู้นอน", "tu-non"), v("departure board", "ตารางเวลาออก", "ta-rang-we-la-ok"), v("ticket office", "ห้องขายตั๋ว", "hong-khai-tua"), v("entrance gate", "ประตูทางเข้า", "pra-tu-thang-khao"), v("transfer", "เปลี่ยนรถไฟ", "plian-rot-fai"), v("next stop", "สถานีถัดไป", "sa-tha-nee-that-pai"), v("luggage rack", "ชั้นวางสัมภาระ", "chan-wang-sam-pha-ra"),
      v("aisle", "ทางเดิน", "thang-doen"), v("window", "หน้าต่าง", "na-tang"), v("on time", "ตรงเวลา", "trong-we-la", "adjective"), v("platform number", "หมายเลขชานชาลา", "mai-lek-chan-cha-la"), v("delay announcement", "ประกาศล่าช้า", "pra-kat-la-cha"), v("sold out", "ตั๋วหมด", "tua-mot", "adjective"), v("reservation", "การจอง", "kan-jong"), v("train ticket", "ตั๋วรถไฟ", "tua-rot-fai")
    ],
    dialogues: [
      dialogue("train-tickets", "Buying a ticket", "Ask for a route and seat.", [["traveler", "I would like a ticket to Chiang Mai.", "ฉันต้องการตั๋วไปเชียงใหม่"], ["local", "One way or return?", "เที่ยวเดียวหรือไปกลับ"], ["traveler", "Return, with a soft seat, please.", "ไปกลับ ที่นั่งนุ่มครับ/ค่ะ"]]),
      dialogue("train-transfer", "Changing trains", "Confirm a transfer.", [["traveler", "Which platform is the train to Ayutthaya?", "รถไฟไปอยุธยาอยู่ชานชาลาไหน"], ["local", "Platform three. Change at the next station.", "ชานชาลาสาม เปลี่ยนรถที่สถานีถัดไป"], ["traveler", "How much time do I have?", "ฉันมีเวลาเท่าไร"]]),
      dialogue("train-disruption", "A rail delay", "Ask about a delayed service.", [["traveler", "Is the train on time?", "รถไฟตรงเวลาไหม"], ["local", "No, there is a thirty-minute delay.", "ไม่ตรงเวลา ล่าช้าสามสิบนาที"], ["traveler", "Can I change my reservation?", "ฉันเปลี่ยนการจองได้ไหม"]])
    ]
  },
  {
    id: "buses-terminals", title: "Buses & Terminals", shortTitle: "Buses",
    description: "Find stops, pay fares, request a stop, and manage local or long-distance buses.", category: "travel",
    domain: [
      v("bus", "รถเมล์", "rot-may"), v("bus station", "สถานีขนส่ง", "sa-tha-nee-khon-song"), v("bus stop", "ป้ายรถเมล์", "pai-rot-may"), v("route number", "หมายเลขสายรถ", "mai-lek-sai-rot"), v("destination", "จุดหมายปลายทาง", "jut-mai-plai-thang"), v("fare", "ค่าโดยสาร", "kha-doi-san"), v("bus card", "บัตรรถโดยสาร", "bat-rot-doi-san"), v("cash", "เงินสด", "ngoen-sot"),
      v("driver", "คนขับรถ", "khon-khap-rot"), v("conductor", "กระเป๋ารถเมล์", "kra-pao-rot-may"), v("front door", "ประตูหน้า", "pra-tu-na"), v("back door", "ประตูหลัง", "pra-tu-lang"), v("get on", "ขึ้นรถ", "khuen-rot", "verb"), v("get off", "ลงรถ", "long-rot", "verb"), v("press the button", "กดปุ่ม", "kot-pum", "verb"), v("stop here", "จอดตรงนี้", "jot-trong-nee", "phrase"),
      v("express bus", "รถด่วน", "rot-duan"), v("sleeper bus", "รถนอน", "rot-non"), v("reservation number", "หมายเลขการจอง", "mai-lek-kan-jong"), v("luggage compartment", "ช่องเก็บสัมภาระ", "chong-kep-sam-pha-ra"), v("traffic", "การจราจร", "kan-ja-ra-jorn"), v("crowded", "คนแน่น", "khon-naen", "adjective"), v("empty", "ว่าง", "wang", "adjective"), v("last stop", "ป้ายสุดท้าย", "pai-sut-thai")
    ],
    dialogues: [
      dialogue("bus-routes", "Finding a bus", "Ask about a route and stop.", [["traveler", "Which bus goes to the museum?", "รถเมล์สายไหนไปพิพิธภัณฑ์"], ["local", "Take bus number twelve.", "ขึ้นรถเมล์สายสิบสอง"], ["traveler", "Where is the stop?", "ป้ายรถอยู่ที่ไหน"]]),
      dialogue("bus-boarding", "Getting on", "Pay and ask where to get off.", [["traveler", "How much is the fare?", "ค่าโดยสารเท่าไร"], ["local", "It is twenty baht.", "ยี่สิบบาท"], ["traveler", "Please tell me when to get off.", "ช่วยบอกฉันเมื่อถึงป้ายด้วย"]]),
      dialogue("bus-long-distance", "A sleeper bus", "Confirm a reservation and luggage.", [["traveler", "I have a reservation for Phuket.", "ฉันมีการจองไปภูเก็ต"], ["local", "Please put your luggage here.", "กรุณาวางสัมภาระไว้ตรงนี้"], ["traveler", "When do we arrive?", "เราจะถึงเมื่อไร"]])
    ]
  },
  {
    id: "hotels", title: "Hotels & Stays", shortTitle: "Hotels",
    description: "Book a room, check in, request help, use facilities, and check out smoothly.", category: "daily-life",
    domain: [
      v("hotel", "โรงแรม", "rong-raem"), v("room", "ห้องพัก", "hong-phak"), v("reservation", "จองห้องพัก", "jong-hong-phak"), v("booking number", "หมายเลขการจอง", "mai-lek-kan-jong"), v("single room", "ห้องเดี่ยว", "hong-diao"), v("double room", "ห้องคู่", "hong-khu"), v("bed", "เตียง", "tiang"), v("bathroom", "ห้องน้ำ", "hong-nam"),
      v("key", "กุญแจ", "kun-jae"), v("key card", "คีย์การ์ด", "khee-kat"), v("reception", "แผนกต้อนรับ", "pha-naek-ton-rap"), v("passport copy", "สำเนาหนังสือเดินทาง", "sam-na-nang-sue-doen-thang"), v("breakfast", "อาหารเช้า", "a-han-chao"), v("elevator", "ลิฟต์", "lift"), v("floor", "ชั้น", "chan"), v("Wi-Fi password", "รหัสไวไฟ", "ra-hat-wai-fai"),
      v("air conditioner", "เครื่องปรับอากาศ", "khrueang-prap-a-kat"), v("hot water", "น้ำร้อน", "nam-ron"), v("towel", "ผ้าเช็ดตัว", "pha-chet-tua"), v("extra pillow", "หมอนเพิ่ม", "mon-phoem"), v("quiet", "เงียบ", "ngiap", "adjective"), v("noisy", "เสียงดัง", "siang-dang", "adjective"), v("available", "มีห้องว่าง", "mee-hong-wang", "adjective"), v("check out", "เช็กเอาต์", "chek-ao", "verb")
    ],
    dialogues: [
      dialogue("hotel-checkin", "Checking in", "Confirm a reservation and room.", [["traveler", "I have a reservation under Alex.", "ฉันจองห้องไว้ชื่ออเล็กซ์"], ["local", "May I see your passport?", "ขอดูหนังสือเดินทางได้ไหม"], ["traveler", "Is breakfast included?", "รวมอาหารเช้าไหม"]]),
      dialogue("hotel-problem", "A room problem", "Request a repair or replacement.", [["traveler", "The air conditioner is not working.", "เครื่องปรับอากาศไม่ทำงาน"], ["local", "We will send someone to check it.", "เราจะส่งคนไปตรวจสอบ"], ["traveler", "Could I have another towel?", "ขอผ้าเช็ดตัวอีกผืนได้ไหม"]]),
      dialogue("hotel-checkout", "Checking out", "Return the key and settle the bill.", [["traveler", "I would like to check out.", "ฉันต้องการเช็กเอาต์"], ["local", "Did you use the minibar?", "ใช้มินิบาร์ไหม"], ["traveler", "No. Can you call a taxi?", "ไม่ ช่วยเรียกแท็กซี่ได้ไหม"]])
    ]
  },
  {
    id: "restaurants-food", title: "Restaurants & Food", shortTitle: "Food",
    description: "Choose dishes, order naturally, ask about ingredients, and pay at the end of a meal.", category: "daily-life",
    domain: [
      v("restaurant", "ร้านอาหาร", "ran-a-han"), v("table", "โต๊ะ", "to"), v("menu", "เมนู", "may-nu"), v("dish", "อาหารจานหนึ่ง", "a-han-chan-nueng"), v("rice", "ข้าว", "khao"), v("noodle soup", "ก๋วยเตี๋ยว", "kuai-tiao"), v("noodles", "บะหมี่", "ba-mee"), v("bread", "ขนมปัง", "kha-nom-pang"),
      v("meat", "เนื้อสัตว์", "nuea-sat"), v("chicken", "ไก่", "kai"), v("beef", "เนื้อวัว", "nuea-wua"), v("fish", "ปลา", "pla"), v("vegetables", "ผัก", "phak"), v("herbs", "สมุนไพร", "sa-mun-phrai"), v("soup", "ซุป", "sup"), v("sauce", "น้ำจิ้ม", "nam-jim"),
      v("spicy", "เผ็ด", "phet", "adjective"), v("sweet", "หวาน", "wan", "adjective"), v("salty", "เค็ม", "khem", "adjective"), v("delicious", "อร่อย", "a-roi", "adjective"), v("vegetarian", "มังสวิรัติ", "mang-sa-wi-rat", "adjective"), v("ice", "น้ำแข็ง", "nam-khaeng"), v("bill", "บิล", "bin"), v("takeaway", "ใส่ถุงกลับบ้าน", "sai-thung-klap-ban", "phrase")
    ],
    dialogues: [
      dialogue("food-menu", "Choosing a table", "Enter a restaurant and ask for a menu.", [["traveler", "A table for two, please.", "ขอโต๊ะสำหรับสองคน"], ["local", "Here is the menu.", "นี่คือเมนู"], ["traveler", "What do you recommend?", "แนะนำอะไรบ้าง"]]),
      dialogue("food-order", "Ordering food", "Order a dish and adjust the spice.", [["traveler", "I would like noodles with chicken.", "ฉันเอาก๋วยเตี๋ยวไก่"], ["local", "Would you like it spicy?", "เอาเผ็ดไหม"], ["traveler", "A little spicy, please.", "เผ็ดนิดหน่อยครับ/ค่ะ"]]),
      dialogue("food-payment", "Paying the bill", "Finish a meal and request takeaway.", [["traveler", "Could we have the bill, please?", "คิดเงินด้วยครับ/ค่ะ"], ["local", "Here is your bill.", "นี่คือบิลของคุณ"], ["traveler", "Please pack the leftovers to go.", "ช่วยใส่ถุงกลับบ้านด้วย"]])
    ]
  },
  {
    id: "shopping-payments", title: "Shopping & Payments", shortTitle: "Shopping",
    description: "Find products, compare prices, pay with confidence, and manage returns or delivery.", category: "daily-life",
    domain: [
      v("shop", "ร้านค้า", "ran-kha"), v("market", "ตลาด", "ta-lat"), v("product", "สินค้า", "sin-kha"), v("size", "ขนาด", "kha-nat"), v("color", "สี", "see"), v("small", "เล็ก", "lek", "adjective"), v("large", "ใหญ่", "yai", "adjective"), v("different", "แตกต่าง", "taek-tang", "adjective"),
      v("in stock", "มีสินค้า", "mee-sin-kha", "adjective"), v("out of stock", "สินค้าหมด", "sin-kha-mot", "adjective"), v("price tag", "ป้ายราคา", "pai-ra-kha"), v("discount", "ส่วนลด", "suan-lot"), v("cash", "เงินสด", "ngoen-sot"), v("card", "บัตร", "bat"), v("bank transfer", "โอนเงิน", "on-ngoen"), v("receipt", "ใบเสร็จ", "bai-set"),
      v("bag", "ถุง", "thung"), v("gift", "ของขวัญ", "khong-khwan"), v("try on", "ลอง", "long", "verb"), v("buy", "ซื้อ", "sue", "verb"), v("exchange", "เปลี่ยนสินค้า", "plian-sin-kha", "verb"), v("refund", "คืนเงิน", "khuen-ngoen", "verb"), v("delivery", "ส่งสินค้า", "song-sin-kha"), v("warranty", "การรับประกัน", "kan-rap-pra-kan")
    ],
    dialogues: [
      dialogue("shopping-products", "Finding an item", "Ask about size, color, and stock.", [["traveler", "Do you have this in a larger size?", "มีอันนี้ขนาดใหญ่กว่านี้ไหม"], ["local", "Yes, we have blue and black.", "มีสีฟ้าและสีดำ"], ["traveler", "May I try it on?", "ขอลองได้ไหม"]]),
      dialogue("shopping-payment", "Paying", "Confirm the total and payment method.", [["traveler", "How much is the total?", "ทั้งหมดเท่าไร"], ["local", "It is three hundred baht.", "สามร้อยบาท"], ["traveler", "Can I pay by card?", "จ่ายด้วยบัตรได้ไหม"]]),
      dialogue("shopping-return", "Returning an item", "Ask about an exchange or refund.", [["traveler", "I would like to exchange this item.", "ฉันต้องการเปลี่ยนสินค้านี้"], ["local", "Do you have the receipt?", "มีใบเสร็จไหม"], ["traveler", "Yes, here it is.", "มี นี่ครับ/ค่ะ"]])
    ]
  },
  {
    id: "cleaning-laundry-hygiene", title: "Laundry, Hygiene & Cleaning", shortTitle: "Laundry & Hygiene",
    description: "Use laundry machines, find toiletries, keep a room clean, and sort waste.", category: "daily-life",
    domain: [
      v("laundry", "ซักรีด", "sak-reet"), v("washing machine", "เครื่องซักผ้า", "khrueang-sak-pha"), v("dryer", "เครื่องอบผ้า", "khrueang-op-pha"), v("detergent", "ผงซักฟอก", "phong-sak-fok"), v("soap", "สบู่", "sa-bu"), v("shampoo", "แชมพู", "chaem-phu"), v("toothbrush", "แปรงสีฟัน", "praeng-see-fan"), v("toothpaste", "ยาสีฟัน", "ya-see-fan"),
      v("tissue", "ทิชชู", "thit-chu"), v("towel", "ผ้าเช็ดตัว", "pha-chet-tua"), v("toilet", "ห้องน้ำ", "hong-nam"), v("shower", "ฝักบัว", "fak-bua"), v("hot water", "น้ำร้อน", "nam-ron"), v("cold water", "น้ำเย็น", "nam-yen"), v("clean", "สะอาด", "sa-at", "adjective"), v("dirty", "สกปรก", "sok-ka-prok", "adjective"),
      v("wash", "ซัก", "sak", "verb"), v("dry", "ตาก", "tak", "verb"), v("iron", "เตารีด", "tao-reet"), v("trash", "ขยะ", "kha-ya"), v("recycling", "รีไซเคิล", "ree-sai-khoen"), v("plastic", "พลาสติก", "pha-la-satik"), v("separate", "แยก", "yaek", "verb"), v("cleaning service", "บริการทำความสะอาด", "bo-ri-kan-tham-khwam-sa-at")
    ],
    dialogues: [
      dialogue("laundry-machine", "Using laundry", "Ask how to wash and dry clothes.", [["traveler", "Where is the washing machine?", "เครื่องซักผ้าอยู่ที่ไหน"], ["local", "The detergent is next to it.", "ผงซักฟอกอยู่ข้างๆ"], ["traveler", "Can I use the dryer too?", "ใช้เครื่องอบผ้าได้ไหม"]]),
      dialogue("hygiene-supplies", "Finding supplies", "Ask for toiletries and hot water.", [["traveler", "Could I have more shampoo and a towel?", "ขอแชมพูและผ้าเช็ดตัวเพิ่มได้ไหม"], ["local", "Of course. I will bring them up.", "ได้ เดี๋ยวเอาขึ้นไปให้"], ["traveler", "Is there hot water?", "มีน้ำร้อนไหม"]]),
      dialogue("cleaning-waste", "Sorting waste", "Ask about cleaning and recycling.", [["traveler", "Where should I put the trash?", "ควรทิ้งขยะที่ไหน"], ["local", "Please separate plastic and food waste.", "กรุณาแยกพลาสติกกับขยะอาหาร"], ["traveler", "Thank you for explaining.", "ขอบคุณที่อธิบาย"]])
    ]
  },
  {
    id: "food-allergies", title: "Food Allergies & Restrictions", shortTitle: "Food Safety",
    description: "Name allergies clearly, ask about ingredients, and respond safely to a reaction.", category: "safety",
    domain: [
      v("allergy", "แพ้", "phae"), v("food restriction", "ข้อจำกัดด้านอาหาร", "kho-jam-kat-dan-a-han"), v("ingredient", "ส่วนผสม", "suan-pha-som"), v("peanut", "ถั่วลิสง", "thua-lisong"), v("tree nut", "ถั่วเปลือกแข็ง", "thua-plueak-khaeng"), v("shellfish", "หอยและกุ้ง", "hoi-lae-kung"), v("fish sauce", "น้ำปลา", "nam-pla"), v("milk", "นม", "nom"),
      v("egg", "ไข่", "khai"), v("wheat", "ข้าวสาลี", "khao-sa-lee"), v("soy", "ถั่วเหลือง", "thua-lueang"), v("gluten", "กลูเตน", "klu-ten"), v("vegetarian", "มังสวิรัติ", "mang-sa-wi-rat"), v("vegan", "วีแกน", "wee-kaen"), v("safe", "ปลอดภัย", "plot-phai", "adjective"), v("dangerous", "อันตราย", "an-ta-rai", "adjective"),
      v("contain", "มีส่วนผสม", "mee-suan-pha-som", "verb"), v("without", "ไม่มี", "mai-mee", "preposition"), v("separate utensil", "อุปกรณ์แยก", "u-pa-kon-yaek"), v("cross-contact", "ปนเปื้อน", "pon-puean"), v("symptom", "อาการ", "a-kan"), v("rash", "ผื่น", "phuen"), v("swelling", "บวม", "buam"), v("emergency", "ฉุกเฉิน", "chuk-choen", "noun")
    ],
    dialogues: [
      dialogue("allergy-order", "Explaining an allergy", "Tell a restaurant about a serious allergy.", [["traveler", "I have a peanut allergy.", "ฉันแพ้ถั่วลิสง"], ["local", "Does this dish contain peanuts?", "จานนี้มีถั่วลิสงไหม"], ["traveler", "Please prepare it without peanuts.", "กรุณาทำโดยไม่ใส่ถั่วลิสง"]]),
      dialogue("allergy-ingredients", "Checking ingredients", "Ask about sauces and utensils.", [["traveler", "Does the sauce contain fish sauce?", "น้ำจิ้มมีน้ำปลาไหม"], ["local", "Yes. We can prepare a separate dish.", "มี เราทำจานแยกได้"], ["traveler", "Thank you for being careful.", "ขอบคุณที่ระวัง"]]),
      dialogue("allergy-reaction", "A reaction", "Describe symptoms and ask for help.", [["traveler", "I am having an allergic reaction.", "ฉันกำลังมีอาการแพ้"], ["local", "What symptoms do you have?", "มีอาการอะไรบ้าง"], ["traveler", "My face is swelling. Call an ambulance.", "หน้าของฉันบวม เรียกรถพยาบาลด้วย"]])
    ]
  },
  {
    id: "weather", title: "Weather & Conditions", shortTitle: "Weather",
    description: "Understand forecasts, plan around heat or rain, and respond to severe weather.", category: "safety",
    domain: [
      v("weather", "สภาพอากาศ", "sa-phap-a-kat"), v("forecast", "พยากรณ์อากาศ", "pha-ya-kon-a-kat"), v("temperature", "อุณหภูมิ", "un-ha-phum"), v("sun", "ดวงอาทิตย์", "duang-a-thit"), v("cloud", "เมฆ", "mek"), v("rain", "ฝน", "fon"), v("storm", "พายุ", "pha-yu"), v("thunder", "ฟ้าร้อง", "fa-rong"),
      v("lightning", "ฟ้าผ่า", "fa-pha"), v("wind", "ลม", "lom"), v("humidity", "ความชื้น", "khwam-chuen"), v("flood", "น้ำท่วม", "nam-thuam"), v("sunny", "แดดออก", "daet-ok", "adjective"), v("cloudy", "มีเมฆมาก", "mee-mek-mak", "adjective"), v("rainy", "ฝนตก", "fon-tok", "adjective"), v("hot", "ร้อน", "ron", "adjective"),
      v("cool", "เย็น", "yen", "adjective"), v("cold", "หนาว", "nao", "adjective"), v("umbrella", "ร่ม", "rom"), v("raincoat", "เสื้อกันฝน", "suea-kan-fon"), v("sunscreen", "ครีมกันแดด", "khreem-kan-daet"), v("warning", "คำเตือน", "kham-tuean"), v("evacuate", "อพยพ", "op-pha-yop", "verb"), v("safe place", "สถานที่ปลอดภัย", "sa-tha-nee-plot-phai")
    ],
    dialogues: [
      dialogue("weather-forecast", "Checking the forecast", "Ask whether it will rain.", [["traveler", "What will the weather be like today?", "วันนี้อากาศเป็นอย่างไร"], ["local", "It will be hot with some rain.", "อากาศร้อนและมีฝนบ้าง"], ["traveler", "Should I bring an umbrella?", "ควรเอาร่มไปไหม"]]),
      dialogue("weather-planning", "Planning around weather", "Change a plan because of heat or rain.", [["traveler", "It is too hot to walk now.", "ตอนนี้ร้อนเกินไปที่จะเดิน"], ["local", "Let us go in the evening.", "ไปตอนเย็นกันเถอะ"], ["traveler", "I will bring sunscreen.", "ฉันจะเอาครีมกันแดดไป"]]),
      dialogue("weather-warning", "A severe warning", "Respond to a storm or flood warning.", [["local", "There is a storm warning. Please stay inside.", "มีคำเตือนพายุ กรุณาอยู่ข้างใน"], ["traveler", "Is this area safe?", "บริเวณนี้ปลอดภัยไหม"], ["local", "Go to the higher, safe place.", "ไปที่สูงและปลอดภัย"]])
    ]
  },
  {
    id: "emergencies-help", title: "Emergencies & Help", shortTitle: "Emergencies",
    description: "Ask for urgent medical or police help and follow emergency instructions.", category: "safety",
    domain: [
      v("help", "ความช่วยเหลือ", "khwam-chuai-luea"), v("emergency", "เหตุฉุกเฉิน", "het-chuk-choen"), v("ambulance", "รถพยาบาล", "rot-pha-ya-ban"), v("hospital", "โรงพยาบาล", "rong-pha-ya-ban"), v("doctor", "หมอ", "mo"), v("pharmacy", "ร้านขายยา", "ran-khai-ya"), v("medicine", "ยา", "ya"), v("pain", "เจ็บ", "jep"),
      v("injury", "บาดเจ็บ", "bat-jep"), v("fever", "ไข้", "khai"), v("dizzy", "เวียนหัว", "wian-hua", "adjective"), v("breathe", "หายใจ", "hai-jai", "verb"), v("police", "ตำรวจ", "tam-ruat"), v("police station", "สถานีตำรวจ", "sa-tha-nee-tam-ruat"), v("theft", "ลักขโมย", "lak-kha-moi"), v("lost passport", "หนังสือเดินทางหาย", "nang-sue-doen-thang-hai"),
      v("accident", "อุบัติเหตุ", "u-bat-ti-het"), v("fire", "ไฟไหม้", "fai-mai"), v("danger", "อันตราย", "an-ta-rai"), v("address", "ที่อยู่", "thi-yu"), v("phone number", "หมายเลขโทรศัพท์", "mai-lek-tho-ra-sap"), v("insurance", "ประกันภัย", "pra-kan-phai"), v("shelter", "ที่หลบภัย", "thi-lop-phai"), v("safe", "ปลอดภัย", "plot-phai", "adjective")
    ],
    dialogues: [
      dialogue("emergency-medical", "Getting medical help", "Describe an urgent symptom.", [["traveler", "Please help me. I am hurt.", "ช่วยฉันด้วย ฉันบาดเจ็บ"], ["local", "Where does it hurt?", "เจ็บตรงไหน"], ["traveler", "My leg hurts. Call an ambulance.", "ขาของฉันเจ็บ เรียกรถพยาบาลด้วย"]]),
      dialogue("emergency-police", "Reporting a loss", "Ask the police for help.", [["traveler", "I lost my passport.", "หนังสือเดินทางของฉันหาย"], ["local", "Please report it at the police station.", "กรุณาแจ้งที่สถานีตำรวจ"], ["traveler", "Where is the nearest station?", "สถานีที่ใกล้ที่สุดอยู่ที่ไหน"]]),
      dialogue("emergency-evacuation", "Following instructions", "Move to a safe place.", [["local", "There is a fire. Leave the building now.", "ไฟไหม้ ออกจากอาคารเดี๋ยวนี้"], ["traveler", "Where is the emergency exit?", "ทางออกฉุกเฉินอยู่ที่ไหน"], ["local", "Follow me to the safe area.", "ตามฉันไปที่พื้นที่ปลอดภัย"]])
    ]
  },
  {
    id: "cafes-coffee", title: "Cafés & Thai Drinks", shortTitle: "Cafés",
    description: "Find a café, order Thai coffee or tea, and make a relaxed meeting plan.", category: "explore",
    domain: [
      v("café", "ร้านกาแฟ", "ran-ka-fae"), v("coffee", "กาแฟ", "ka-fae"), v("coffee bean", "เมล็ดกาแฟ", "ma-let-ka-fae"), v("filter", "ตัวกรอง", "tua-krong"), v("condensed milk", "นมข้นหวาน", "nom-khon-wan"), v("black coffee", "กาแฟดำ", "ka-fae-dam"), v("milk coffee", "กาแฟใส่นม", "ka-fae-sai-nom"), v("iced coffee", "กาแฟเย็น", "ka-fae-yen"),
      v("hot coffee", "กาแฟร้อน", "ka-fae-ron"), v("less sweet", "หวานน้อย", "wan-noi"), v("no sugar", "ไม่ใส่น้ำตาล", "mai-sai-nam-tan"), v("extra ice", "เพิ่มน้ำแข็ง", "phoem-nam-khaeng"), v("tea", "ชา", "cha"), v("juice", "น้ำผลไม้", "nam-phon-la-mai"), v("cup", "แก้ว", "kaeo"), v("straw", "หลอด", "lot"),
      v("table", "โต๊ะ", "to"), v("seat", "ที่นั่ง", "thi-nang"), v("Wi-Fi", "ไวไฟ", "wai-fai"), v("outlet", "ปลั๊กไฟ", "plak-fai"), v("work", "ทำงาน", "tham-ngan", "verb"), v("meeting", "ประชุม", "pra-chum"), v("quiet", "เงียบ", "ngiap", "adjective"), v("bill", "คิดเงิน", "khit-ngoen", "verb")
    ],
    dialogues: [
      dialogue("cafe-order", "Ordering a drink", "Choose a Thai drink.", [["traveler", "What drink do you recommend?", "แนะนำเครื่องดื่มอะไรบ้าง"], ["local", "Try iced Thai tea.", "ลองชาไทยเย็นสิ"], ["traveler", "Great. One cup, please.", "ดีเลย ขอหนึ่งแก้ว"]]),
      dialogue("cafe-preferences", "Adjusting a drink", "Ask for less sugar or more ice.", [["traveler", "Could I have less sweet and extra ice?", "ขอหวานน้อยและเพิ่มน้ำแข็งได้ไหม"], ["local", "Sure. Would you like a straw?", "ได้ ต้องการหลอดไหม"], ["traveler", "Yes, thank you.", "ใช่ ขอบคุณ"]]),
      dialogue("cafe-meeting", "Working at a café", "Arrange a meeting and ask about Wi-Fi.", [["traveler", "Is there Wi-Fi and a quiet table?", "มีไวไฟและโต๊ะเงียบไหม"], ["local", "The password is on the wall.", "รหัสอยู่บนผนัง"], ["traveler", "I will work here for an hour.", "ฉันจะทำงานที่นี่หนึ่งชั่วโมง"]])
    ]
  },
  {
    id: "work-study", title: "Work & Study", shortTitle: "Work & Study",
    description: "Introduce your work or studies, arrange tasks, and clarify what happens next.", category: "explore",
    domain: [
      v("work", "งาน", "ngan"), v("job", "งานอาชีพ", "ngan-a-chip"), v("office", "สำนักงาน", "sam-nak-ngan"), v("school", "โรงเรียน", "rong-rian"), v("university", "มหาวิทยาลัย", "ma-ha-wit-tha-ya-lai"), v("teacher", "ครู", "khru"), v("student", "นักศึกษา", "nak-sueksa"), v("colleague", "เพื่อนร่วมงาน", "phuean-ruam-ngan"),
      v("manager", "ผู้จัดการ", "phu-jat-kan"), v("meeting", "การประชุม", "kan-pra-chum"), v("schedule", "ตารางเวลา", "ta-rang-we-la"), v("task", "งานที่ต้องทำ", "ngan-thi-tong-tham"), v("project", "โครงการ", "khrong-kan"), v("deadline", "กำหนดส่ง", "kam-not-song"), v("document", "เอกสาร", "e-ka-san"), v("email", "อีเมล", "ee-may"),
      v("example", "ตัวอย่าง", "tua-yang"), v("question", "คำถาม", "kham-tham"), v("answer", "คำตอบ", "kham-top"), v("explain", "อธิบาย", "a-thi-bai", "verb"), v("understand", "เข้าใจ", "khao-jai", "verb"), v("agree", "เห็นด้วย", "hen-duai", "verb"), v("finish", "เสร็จ", "set", "verb"), v("follow up", "ติดตาม", "tit-tam", "verb")
    ],
    dialogues: [
      dialogue("work-introduce", "Introducing yourself", "Say what you do.", [["traveler", "I work in technology.", "ฉันทำงานด้านเทคโนโลยี"], ["local", "Where is your office?", "สำนักงานของคุณอยู่ที่ไหน"], ["traveler", "It is in Singapore.", "อยู่ที่สิงคโปร์"]]),
      dialogue("work-schedule", "Arranging a task", "Confirm a meeting and deadline.", [["traveler", "When is the meeting?", "ประชุมเมื่อไร"], ["local", "Tomorrow at nine in the morning.", "พรุ่งนี้เก้าโมงเช้า"], ["traveler", "When is the deadline?", "กำหนดส่งเมื่อไร"]]),
      dialogue("work-clarify", "Clarifying", "Ask for an example and confirm next steps.", [["traveler", "I do not understand this part.", "ฉันไม่เข้าใจส่วนนี้"], ["local", "I will explain with an example.", "ฉันจะอธิบายด้วยตัวอย่าง"], ["traveler", "I will follow up by email.", "ฉันจะติดตามทางอีเมล"]])
    ]
  },
  {
    id: "sightseeing-culture", title: "Sightseeing & Thai Culture", shortTitle: "Sightseeing",
    description: "Visit attractions respectfully, buy tickets, ask permission, and share experiences.", category: "explore",
    domain: [
      v("sightseeing", "เที่ยวชม", "thiao-chom"), v("attraction", "สถานที่ท่องเที่ยว", "sa-tha-nee-thong-thiao"), v("museum", "พิพิธภัณฑ์", "phi-phi-tha-phan"), v("temple", "วัด", "wat"), v("palace", "พระราชวัง", "phra-rat-cha-wang"), v("old town", "เมืองเก่า", "mueang-kao"), v("beach", "ชายหาด", "chai-hat"), v("mountain", "ภูเขา", "phu-khao"),
      v("lake", "ทะเลสาบ", "tha-lay-sap"), v("ticket booth", "ห้องขายตั๋ว", "hong-khai-tua"), v("entrance fee", "ค่าเข้าชม", "kha-khao-chom"), v("opening hours", "เวลาเปิดทำการ", "we-la-poet-tham-kan"), v("closed day", "วันหยุด", "wan-yut"), v("guide", "ไกด์", "kai"), v("tour", "ทัวร์", "thua"), v("traditional", "แบบดั้งเดิม", "baep-dang-doem", "adjective"),
      v("custom", "ประเพณี", "pra-phay-nee"), v("respect", "เคารพ", "khao-rop", "verb"), v("shoes", "รองเท้า", "rong-thao"), v("quiet", "เงียบ", "ngiap", "adjective"), v("photo", "รูปถ่าย", "roop-thai"), v("permission", "อนุญาต", "a-nu-yat"), v("souvenir", "ของที่ระลึก", "khong-thi-ra-luek"), v("memory", "ความทรงจำ", "khwam-song-jam")
    ],
    dialogues: [
      dialogue("culture-tickets", "Visiting a place", "Ask about tickets and hours.", [["traveler", "How much is the entrance fee?", "ค่าเข้าชมเท่าไร"], ["local", "It is one hundred baht.", "หนึ่งร้อยบาท"], ["traveler", "What time do you close?", "ปิดกี่โมง"]]),
      dialogue("culture-respect", "A respectful visit", "Follow local customs.", [["local", "Please remove your shoes here.", "กรุณาถอดรองเท้าที่นี่"], ["traveler", "May I take a photo?", "ขอถ่ายรูปได้ไหม"], ["local", "Yes, but please be quiet.", "ได้ แต่กรุณาเงียบ"]]),
      dialogue("culture-memories", "Sharing a memory", "Talk about a place and a souvenir.", [["traveler", "This place is beautiful.", "ที่นี่สวยมาก"], ["local", "Would you like a local souvenir?", "อยากซื้อของที่ระลึกไหม"], ["traveler", "Yes. I want something for my family.", "ใช่ ฉันอยากซื้อของให้ครอบครัว"]])
    ]
  }
];

export const thaiTopics = seeds.map(buildTopic);
