import { buildTopic, dialogue, v, type TopicSeed } from "./helpers";

const seeds: TopicSeed[] = [
  {
    id: "greetings-small-talk", title: "Greetings & Small Talk", shortTitle: "Greetings", description: "Meet people, introduce yourself, make plans, and leave conversations warmly.", category: "essentials",
    domain: [
      v("name", "nama", "na-ma"), v("age", "umur", "u-mur"), v("country", "negara", "ne-ga-ra"), v("city", "kota", "ko-ta"), v("language", "bahasa", "ba-ha-sa"), v("occupation", "pekerjaan", "pe-ker-ja-an"), v("student", "pelajar", "pe-la-jar"), v("friend", "teman", "te-man"),
      v("family", "keluarga", "ke-lu-ar-ga"), v("married", "menikah", "me-ni-kah", "adjective"), v("single", "lajang", "la-jang", "adjective"), v("interesting", "menarik", "me-na-rik", "adjective"), v("free / available", "senggang", "seng-gang", "adjective"), v("busy", "sibuk", "si-buk", "adjective"), v("plan", "rencana", "ren-ca-na"), v("weekend", "akhir pekan", "a-khir pe-kan"),
      v("invitation", "undangan", "un-dang-an"), v("accept", "setuju", "se-tu-ju", "verb"), v("decline", "menolak", "me-no-lak", "verb"), v("happy", "senang", "se-nang", "adjective"), v("tired", "lelah", "le-lah", "adjective"), v("hot", "panas", "pa-nas", "adjective"), v("cold", "dingin", "di-ngin", "adjective"), v("long time no see", "lama tidak bertemu", "la-ma ti-dak ber-te-mu", "phrase")
    ],
    dialogues: [
      dialogue("greetings-meet", "First meeting", "Introduce yourself to someone new.", [["traveler", "Hello. My name is Alex.", "Halo. Nama saya Alex."], ["local", "Nice to meet you. Where are you from?", "Senang bertemu dengan Anda. Anda dari mana?"], ["traveler", "I am from Canada.", "Saya dari Kanada."]]),
      dialogue("greetings-small-talk", "Making plans", "Make a simple plan with a new friend.", [["traveler", "Are you free this weekend?", "Apakah Anda senggang akhir pekan ini?"], ["local", "Yes, I am free on Saturday.", "Ya, saya senggang hari Sabtu."], ["traveler", "Would you like to have coffee?", "Maukah Anda minum kopi?"]]),
      dialogue("greetings-partings", "Parting warmly", "End a friendly conversation.", [["local", "It was nice talking with you.", "Senang berbicara dengan Anda."], ["traveler", "Thank you. See you again.", "Terima kasih. Sampai jumpa lagi."], ["local", "Have a good day!", "Semoga harimu menyenangkan!"]])
    ]
  },
  {
    id: "numbers-dates-time", title: "Numbers, Dates & Time", shortTitle: "Numbers & Time", description: "Count, understand prices, arrange appointments, and talk about duration.", category: "essentials",
    domain: [
      v("one", "satu", "sa-tu", "number"), v("two", "dua", "du-a", "number"), v("three", "tiga", "ti-ga", "number"), v("four", "empat", "em-pat", "number"), v("five", "lima", "li-ma", "number"), v("six", "enam", "e-nam", "number"), v("seven", "tujuh", "tu-juh", "number"), v("eight", "delapan", "de-la-pan", "number"),
      v("nine", "sembilan", "sem-bi-lan", "number"), v("ten", "sepuluh", "se-pu-luh", "number"), v("hundred", "seratus", "se-ra-tus", "number"), v("thousand", "seribu", "se-ri-bu", "number"), v("price", "harga", "har-ga"), v("money", "uang", "u-ang"), v("change", "kembalian", "kem-ba-li-an"), v("cheap", "murah", "mu-rah", "adjective"),
      v("expensive", "mahal", "ma-hal", "adjective"), v("total", "jumlah total", "jum-lah to-tal"), v("quantity", "jumlah", "jum-lah"), v("pair", "pasang", "pa-sang"), v("piece", "buah", "bu-ah"), v("kilogram", "kilogram", "ki-lo-gram"), v("hour", "jam", "jam"), v("minute", "menit", "me-nit")
    ],
    dialogues: [
      dialogue("numbers-money", "At a market", "Confirm a quantity and price.", [["traveler", "How much is this?", "Ini harganya berapa?"], ["local", "It is fifty thousand rupiah.", "Lima puluh ribu rupiah."], ["traveler", "I would like two pieces, please.", "Saya mau dua buah, tolong."]]),
      dialogue("numbers-dates", "Making an appointment", "Arrange a day and time.", [["traveler", "What day is the appointment?", "Janji temu hari apa?"], ["local", "It is on Monday the tenth.", "Hari Senin tanggal sepuluh."], ["traveler", "What time should I come?", "Saya harus datang jam berapa?"]]),
      dialogue("numbers-time", "Running late", "Explain a delay.", [["traveler", "I am sorry, I am late.", "Maaf, saya terlambat."], ["local", "That is okay. How long will it take?", "Tidak apa-apa. Berapa lama?"], ["traveler", "About thirty minutes.", "Sekitar tiga puluh menit."]])
    ]
  },
  {
    id: "airports-flights", title: "Airports & Flights", shortTitle: "Airports", description: "Handle check-in, baggage, immigration, security, boarding, and flight changes.", category: "travel",
    domain: [
      v("airport", "bandara", "ban-da-ra"), v("flight", "penerbangan", "pe-ner-bang-an"), v("ticket", "tiket pesawat", "ti-ket pe-sa-wat"), v("passport", "paspor", "pas-por"), v("visa", "visa", "vi-sa"), v("check-in counter", "konter check-in", "kon-ter cek-in"), v("boarding pass", "kartu naik pesawat", "kar-tu na-ik pe-sa-wat"), v("luggage", "bagasi", "ba-ga-si"),
      v("suitcase", "koper", "ko-per"), v("carry-on bag", "tas kabin", "tas ka-bin"), v("checked baggage", "bagasi tercatat", "ba-ga-si ter-ca-tat"), v("baggage claim", "pengambilan bagasi", "peng-am-bi-lan ba-ga-si"), v("customs", "bea cukai", "be-a cu-kai"), v("immigration", "imigrasi", "i-mi-gra-si"), v("security check", "pemeriksaan keamanan", "pe-me-rik-sa-an ke-a-man-an"), v("gate", "pintu keberangkatan", "pin-tu ke-be-rang-kat-an"),
      v("terminal", "terminal", "ter-mi-nal"), v("departure", "keberangkatan", "ke-be-rang-kat-an"), v("arrival", "kedatangan", "ke-da-tang-an"), v("seat", "kursi", "kur-si"), v("window seat", "kursi dekat jendela", "kur-si de-kat jen-de-la"), v("delay", "terlambat", "ter-lam-bat"), v("cancel", "membatalkan", "mem-ba-tal-kan", "verb"), v("connection", "penerbangan lanjutan", "pe-ner-bang-an lan-jut-an")
    ],
    dialogues: [
      dialogue("airport-checkin", "Checking in", "Complete check-in and baggage drop.", [["traveler", "Here is my passport and ticket.", "Ini paspor dan tiket saya."], ["local", "Do you have any checked baggage?", "Apakah Anda punya bagasi tercatat?"], ["traveler", "Yes, one suitcase.", "Ya, satu koper."]]),
      dialogue("airport-boarding", "Finding the gate", "Ask about security and boarding.", [["traveler", "Where is gate twelve?", "Pintu dua belas di mana?"], ["local", "Go through security and turn left.", "Lewati pemeriksaan keamanan lalu belok kiri."], ["traveler", "When does boarding start?", "Kapan mulai naik pesawat?"]]),
      dialogue("airport-delay", "A delayed connection", "Handle a changed flight.", [["traveler", "My flight is delayed. What should I do?", "Penerbangan saya terlambat. Apa yang harus saya lakukan?"], ["local", "Please wait for the new announcement.", "Silakan tunggu pengumuman baru."], ["traveler", "Can I still make my connection?", "Apakah saya masih bisa mengejar penerbangan lanjutan?"]])
    ]
  },
  {
    id: "directions-navigation", title: "Directions & Navigation", shortTitle: "Directions", description: "Ask for places, follow routes, use addresses, and find your way again.", category: "travel",
    domain: [
      v("street", "jalan", "ja-lan"), v("road", "ruas jalan", "ru-as ja-lan"), v("address", "alamat", "a-la-mat"), v("map", "peta", "pe-ta"), v("landmark", "tengara", "te-nga-ra"), v("building", "gedung", "ge-dung"), v("entrance", "pintu masuk", "pin-tu ma-suk"), v("exit", "pintu keluar", "pin-tu ke-lu-ar"),
      v("intersection", "persimpangan", "per-sim-pang-an"), v("traffic light", "lampu lalu lintas", "lam-pu la-lu lin-tas"), v("bridge", "jembatan", "jem-ba-tan"), v("river", "sungai", "su-ngai"), v("left", "kiri", "ki-ri"), v("right", "kanan", "ka-nan"), v("straight", "lurus", "lu-rus", "adverb"), v("turn", "belok", "be-lok", "verb"),
      v("near", "dekat", "de-kat", "adjective"), v("far", "jauh", "ja-uh", "adjective"), v("next to", "di sebelah", "di se-be-lah"), v("opposite", "di seberang", "di se-be-rang"), v("walk", "berjalan kaki", "ber-ja-lan ka-ki", "verb"), v("motorbike taxi", "ojek", "o-jek"), v("taxi driver", "sopir taksi", "so-pir tak-si"), v("lost", "tersesat", "ter-se-sat", "adjective")
    ],
    dialogues: [
      dialogue("directions-landmarks", "Finding a landmark", "Ask where a place is.", [["traveler", "Excuse me, where is the market?", "Permisi, pasar di mana?"], ["local", "It is next to the bridge.", "Pasar ada di sebelah jembatan."], ["traveler", "Is it far from here?", "Apakah jauh dari sini?"]]),
      dialogue("directions-route", "Following a route", "Confirm turns and crossings.", [["traveler", "Should I turn left at the light?", "Haruskah saya belok kiri di lampu lalu lintas?"], ["local", "No, go straight and turn right.", "Tidak, lurus lalu belok kanan."], ["traveler", "How long does it take on foot?", "Berapa lama kalau berjalan kaki?"]]),
      dialogue("directions-lost", "Getting unlost", "Use an address or taxi.", [["traveler", "I am lost. Can you help me?", "Saya tersesat. Bisa bantu saya?"], ["local", "Show me the address on your phone.", "Tunjukkan alamatnya di ponsel Anda."], ["traveler", "I will take a taxi there.", "Saya akan naik taksi ke sana."]])
    ]
  },
  {
    id: "trains-stations", title: "Trains & Stations", shortTitle: "Trains", description: "Buy fares, find platforms, transfer between services, and handle rail disruptions.", category: "travel",
    domain: [
      v("train", "kereta api", "ke-re-ta a-pi"), v("station", "stasiun", "sta-si-un"), v("platform", "peron", "pe-ron"), v("route", "rute", "ru-te"), v("one-way ticket", "tiket sekali jalan", "ti-ket se-ka-li ja-lan"), v("return ticket", "tiket pulang pergi", "ti-ket pu-lang pe-gi"), v("seat reservation", "reservasi kursi", "re-ser-va-si kur-si"), v("coach", "gerbong", "ger-bong"),
      v("soft seat", "kursi empuk", "kur-si em-puk"), v("sleeper", "gerbong tidur", "ger-bong ti-dur"), v("departure board", "papan jadwal keberangkatan", "pa-pan jad-wal ke-be-rang-kat-an"), v("ticket office", "loket tiket", "lo-ket ti-ket"), v("entrance gate", "gerbang masuk", "ger-bang ma-suk"), v("transfer", "pindah kereta", "pin-dah ke-re-ta"), v("next stop", "stasiun berikutnya", "sta-si-un be-ri-kut-nya"), v("luggage rack", "rak bagasi", "rak ba-ga-si"),
      v("aisle", "lorong", "lo-rong"), v("window", "jendela", "jen-de-la"), v("on time", "tepat waktu", "te-pat wak-tu", "adjective"), v("platform number", "nomor peron", "no-mor pe-ron"), v("delay announcement", "pengumuman keterlambatan", "peng-u-mum-an ke-ter-lam-bat-an"), v("sold out", "tiket habis", "ti-ket ha-bis", "adjective"), v("reservation", "pemesanan", "pe-me-san-an"), v("train ticket", "tiket kereta", "ti-ket ke-re-ta")
    ],
    dialogues: [
      dialogue("train-tickets", "Buying a ticket", "Ask for a route and seat.", [["traveler", "I would like a ticket to Yogyakarta.", "Saya mau tiket ke Yogyakarta."], ["local", "One way or return?", "Sekali jalan atau pulang pergi?"], ["traveler", "Return, with a soft seat, please.", "Pulang pergi, kursi empuk, tolong."]]),
      dialogue("train-transfer", "Changing trains", "Confirm a transfer.", [["traveler", "Which platform is the train to Bandung?", "Kereta ke Bandung di peron berapa?"], ["local", "Platform three. Change at the next station.", "Peron tiga. Pindah di stasiun berikutnya."], ["traveler", "How much time do I have?", "Saya punya waktu berapa lama?"]]),
      dialogue("train-disruption", "A rail delay", "Ask about a delayed service.", [["traveler", "Is the train on time?", "Apakah keretanya tepat waktu?"], ["local", "No, there is a thirty-minute delay.", "Tidak, terlambat tiga puluh menit."], ["traveler", "Can I change my reservation?", "Bisa mengubah pemesanan saya?"]])
    ]
  },
  {
    id: "buses-terminals", title: "Buses & Terminals", shortTitle: "Buses", description: "Find stops, pay fares, request a stop, and manage local or long-distance buses.", category: "travel",
    domain: [
      v("bus", "bus", "bus"), v("bus station", "terminal bus", "ter-mi-nal bus"), v("bus stop", "halte bus", "hal-te bus"), v("route number", "nomor rute", "no-mor ru-te"), v("destination", "tujuan", "tu-ju-an"), v("fare", "ongkos", "ong-kos"), v("bus card", "kartu bus", "kar-tu bus"), v("cash", "uang tunai", "u-ang tu-nai"),
      v("driver", "sopir", "so-pir"), v("conductor", "kondektur", "kon-dek-tur"), v("front door", "pintu depan", "pin-tu de-pan"), v("back door", "pintu belakang", "pin-tu be-la-kang"), v("get on", "naik", "na-ik", "verb"), v("get off", "turun", "tu-run", "verb"), v("press the button", "tekan tombol", "te-kan tom-bol", "verb"), v("stop here", "berhenti di sini", "ber-hen-ti di si-ni", "phrase"),
      v("express bus", "bus ekspres", "bus eks-pres"), v("sleeper bus", "bus malam", "bus ma-lam"), v("reservation number", "nomor reservasi", "no-mor re-ser-va-si"), v("luggage compartment", "bagasi bus", "ba-ga-si bus"), v("traffic", "lalu lintas", "la-lu lin-tas"), v("crowded", "penuh", "pe-nuh", "adjective"), v("empty", "kosong", "ko-song", "adjective"), v("last stop", "halte terakhir", "hal-te ter-a-khir")
    ],
    dialogues: [
      dialogue("bus-routes", "Finding a bus", "Ask about a route and stop.", [["traveler", "Which bus goes to the museum?", "Bus nomor berapa yang ke museum?"], ["local", "Take bus number twelve.", "Naik bus nomor dua belas."], ["traveler", "Where is the stop?", "Haltenya di mana?"]]),
      dialogue("bus-boarding", "Getting on", "Pay and ask where to get off.", [["traveler", "How much is the fare?", "Ongkosnya berapa?"], ["local", "It is ten thousand rupiah.", "Sepuluh ribu rupiah."], ["traveler", "Please tell me when to get off.", "Tolong beri tahu saya kapan harus turun."]]),
      dialogue("bus-long-distance", "A night bus", "Confirm a reservation and luggage.", [["traveler", "I have a reservation for Surabaya.", "Saya punya reservasi ke Surabaya."], ["local", "Please put your luggage here.", "Silakan taruh bagasi di sini."], ["traveler", "When do we arrive?", "Kita sampai kapan?"]])
    ]
  },
  {
    id: "hotels", title: "Hotels & Stays", shortTitle: "Hotels", description: "Book a room, check in, request help, use facilities, and check out smoothly.", category: "daily-life",
    domain: [
      v("hotel", "hotel", "ho-tel"), v("room", "kamar", "ka-mar"), v("reservation", "reservasi", "re-ser-va-si"), v("booking number", "nomor pemesanan", "no-mor pe-me-san-an"), v("single room", "kamar single", "ka-mar sing-gel"), v("double room", "kamar double", "ka-mar da-bel"), v("bed", "tempat tidur", "tem-pat ti-dur"), v("bathroom", "kamar mandi", "ka-mar man-di"),
      v("key", "kunci", "kun-ci"), v("key card", "kartu kunci", "kar-tu kun-ci"), v("reception", "resepsionis", "re-sep-si-o-nis"), v("passport copy", "salinan paspor", "sa-li-nan pas-por"), v("breakfast", "sarapan", "sa-ra-pan"), v("elevator", "lift", "lift"), v("floor", "lantai", "lan-tai"), v("Wi-Fi password", "kata sandi Wi-Fi", "ka-ta san-di wai-fai"),
      v("air conditioner", "pendingin udara", "pen-di-ngin u-da-ra"), v("hot water", "air panas", "a-ir pa-nas"), v("towel", "handuk", "han-duk"), v("extra pillow", "bantal tambahan", "ban-tal tam-bah-an"), v("quiet", "tenang", "te-nang", "adjective"), v("noisy", "berisik", "be-ri-sik", "adjective"), v("available", "tersedia", "ter-se-di-a", "adjective"), v("check out", "check-out", "cek-aut", "verb")
    ],
    dialogues: [
      dialogue("hotel-checkin", "Checking in", "Confirm a reservation and room.", [["traveler", "I have a reservation under Alex.", "Saya punya reservasi atas nama Alex."], ["local", "May I see your passport?", "Boleh saya lihat paspor Anda?"], ["traveler", "Is breakfast included?", "Apakah sarapan sudah termasuk?"]]),
      dialogue("hotel-problem", "A room problem", "Request a repair or replacement.", [["traveler", "The air conditioner is not working.", "Pendingin udara tidak berfungsi."], ["local", "We will send someone to check it.", "Kami akan mengirim orang untuk memeriksanya."], ["traveler", "Could I have another towel?", "Boleh minta handuk lagi?"]]),
      dialogue("hotel-checkout", "Checking out", "Return the key and settle the bill.", [["traveler", "I would like to check out.", "Saya ingin check-out."], ["local", "Did you use the minibar?", "Apakah Anda menggunakan minibar?"], ["traveler", "No. Can you call a taxi?", "Tidak. Bisa panggilkan taksi?"]])
    ]
  },
  {
    id: "restaurants-food", title: "Restaurants & Food", shortTitle: "Food", description: "Choose dishes, order naturally, ask about ingredients, and pay at the end of a meal.", category: "daily-life",
    domain: [
      v("restaurant", "restoran", "res-to-ran"), v("table", "meja", "me-ja"), v("menu", "menu", "me-nu"), v("dish", "hidangan", "hi-dang-an"), v("rice", "nasi", "na-si"), v("noodle soup", "soto", "so-to"), v("noodles", "mi", "mi"), v("bread", "roti", "ro-ti"),
      v("meat", "daging", "da-ging"), v("chicken", "ayam", "a-yam"), v("beef", "daging sapi", "da-ging sa-pi"), v("fish", "ikan", "i-kan"), v("vegetables", "sayur", "sa-yur"), v("herbs", "rempah", "rem-pah"), v("soup", "sup", "sup"), v("sauce", "saus", "saus"),
      v("spicy", "pedas", "pe-das", "adjective"), v("sweet", "manis", "ma-nis", "adjective"), v("salty", "asin", "a-sin", "adjective"), v("delicious", "enak", "e-nak", "adjective"), v("vegetarian", "vegetarian", "ve-ge-ta-ri-an", "adjective"), v("ice", "es", "es"), v("bill", "tagihan", "ta-gi-han"), v("takeaway", "dibungkus", "di-bung-kus", "phrase")
    ],
    dialogues: [
      dialogue("food-menu", "Choosing a table", "Enter a restaurant and ask for a menu.", [["traveler", "A table for two, please.", "Meja untuk dua orang, tolong."], ["local", "Here is the menu.", "Ini menunya."], ["traveler", "What do you recommend?", "Apa yang Anda rekomendasikan?"]]),
      dialogue("food-order", "Ordering food", "Order a dish and adjust the spice.", [["traveler", "I would like noodles with chicken.", "Saya mau mi ayam."], ["local", "Would you like it spicy?", "Mau pedas?"], ["traveler", "A little spicy, please.", "Sedikit pedas, tolong."]]),
      dialogue("food-payment", "Paying the bill", "Finish a meal and request takeaway.", [["traveler", "Could we have the bill, please?", "Minta tagihannya, tolong."], ["local", "Here is your bill.", "Ini tagihannya."], ["traveler", "Please pack the leftovers to go.", "Tolong bungkus sisa makanan ini."]])
    ]
  },
  {
    id: "shopping-payments", title: "Shopping & Payments", shortTitle: "Shopping", description: "Find products, compare prices, pay with confidence, and manage returns or delivery.", category: "daily-life",
    domain: [
      v("shop", "toko", "to-ko"), v("market", "pasar", "pa-sar"), v("product", "produk", "pro-duk"), v("size", "ukuran", "u-kur-an"), v("color", "warna", "war-na"), v("small", "kecil", "ke-cil", "adjective"), v("large", "besar", "be-sar", "adjective"), v("different", "berbeda", "be-be-da", "adjective"),
      v("in stock", "tersedia", "ter-se-di-a", "adjective"), v("out of stock", "habis", "ha-bis", "adjective"), v("price tag", "label harga", "la-bel har-ga"), v("discount", "diskon", "dis-kon"), v("cash", "uang tunai", "u-ang tu-nai"), v("card", "kartu", "kar-tu"), v("bank transfer", "transfer bank", "trans-fer bank"), v("receipt", "struk", "struk"),
      v("bag", "tas", "tas"), v("gift", "hadiah", "ha-di-ah"), v("try on", "mencoba", "men-co-ba", "verb"), v("buy", "membeli", "mem-be-li", "verb"), v("exchange", "menukar", "me-nu-kar", "verb"), v("refund", "pengembalian uang", "peng-em-ba-li-an u-ang", "verb"), v("delivery", "pengiriman", "peng-i-rim-an"), v("warranty", "garansi", "ga-ran-si")
    ],
    dialogues: [
      dialogue("shopping-products", "Finding an item", "Ask about size, color, and stock.", [["traveler", "Do you have this in a larger size?", "Ada ukuran yang lebih besar?"], ["local", "Yes, we have blue and black.", "Ada warna biru dan hitam."], ["traveler", "May I try it on?", "Boleh saya coba?"]]),
      dialogue("shopping-payment", "Paying", "Confirm the total and payment method.", [["traveler", "How much is the total?", "Totalnya berapa?"], ["local", "It is three hundred thousand rupiah.", "Tiga ratus ribu rupiah."], ["traveler", "Can I pay by card?", "Bisa bayar dengan kartu?"]]),
      dialogue("shopping-return", "Returning an item", "Ask about an exchange or refund.", [["traveler", "I would like to exchange this item.", "Saya ingin menukar barang ini."], ["local", "Do you have the receipt?", "Ada struknya?"], ["traveler", "Yes, here it is.", "Ya, ini."]])
    ]
  },
  {
    id: "cleaning-laundry-hygiene", title: "Laundry, Hygiene & Cleaning", shortTitle: "Laundry & Hygiene", description: "Use laundry machines, find toiletries, keep a room clean, and sort waste.", category: "daily-life",
    domain: [
      v("laundry", "binatu", "bi-na-tu"), v("washing machine", "mesin cuci", "me-sin cu-ci"), v("dryer", "mesin pengering", "me-sin peng-e-ring"), v("detergent", "deterjen", "de-ter-jen"), v("soap", "sabun", "sa-bun"), v("shampoo", "sampo", "sam-po"), v("toothbrush", "sikat gigi", "si-kat gi-gi"), v("toothpaste", "pasta gigi", "pas-ta gi-gi"),
      v("tissue", "tisu", "ti-su"), v("towel", "handuk", "han-duk"), v("toilet", "toilet", "toi-let"), v("shower", "pancuran", "pan-cur-an"), v("hot water", "air panas", "a-ir pa-nas"), v("cold water", "air dingin", "a-ir di-ngin"), v("clean", "bersih", "ber-sih", "adjective"), v("dirty", "kotor", "ko-tor", "adjective"),
      v("wash", "mencuci", "men-cu-ci", "verb"), v("dry", "mengeringkan", "meng-e-ring-kan", "verb"), v("iron", "setrika", "se-tri-ka"), v("trash", "sampah", "sam-pah"), v("recycling", "daur ulang", "da-ur u-lang"), v("plastic", "plastik", "plas-tik"), v("separate", "memisahkan", "me-mi-sah-kan", "verb"), v("cleaning service", "jasa kebersihan", "ja-sa ke-ber-sih-an")
    ],
    dialogues: [
      dialogue("laundry-machine", "Using laundry", "Ask how to wash and dry clothes.", [["traveler", "Where is the washing machine?", "Mesin cucinya di mana?"], ["local", "The detergent is next to it.", "Deterjennya di sebelahnya."], ["traveler", "Can I use the dryer too?", "Bisa memakai mesin pengering juga?"]]),
      dialogue("hygiene-supplies", "Finding supplies", "Ask for toiletries and hot water.", [["traveler", "Could I have more shampoo and a towel?", "Boleh minta sampo dan handuk lagi?"], ["local", "Of course. I will bring them up.", "Tentu. Saya akan membawanya ke atas."], ["traveler", "Is there hot water?", "Ada air panas?"]]),
      dialogue("cleaning-waste", "Sorting waste", "Ask about cleaning and recycling.", [["traveler", "Where should I put the trash?", "Sampahnya harus ditaruh di mana?"], ["local", "Please separate plastic and food waste.", "Tolong pisahkan plastik dan sampah makanan."], ["traveler", "Thank you for explaining.", "Terima kasih sudah menjelaskan."]])
    ]
  },
  {
    id: "food-allergies", title: "Food Allergies & Restrictions", shortTitle: "Food Safety", description: "Name allergies clearly, ask about ingredients, and respond safely to a reaction.", category: "safety",
    domain: [
      v("allergy", "alergi", "a-ler-gi"), v("food restriction", "pantangan makanan", "pan-tang-an ma-kan-an"), v("ingredient", "bahan", "ba-han"), v("peanut", "kacang tanah", "ka-cang ta-nah"), v("tree nut", "kacang pohon", "ka-cang po-hon"), v("shellfish", "kerang dan udang", "ke-rang dan u-dang"), v("fish sauce", "kecap ikan", "ke-cap i-kan"), v("milk", "susu", "su-su"),
      v("egg", "telur", "te-lur"), v("wheat", "gandum", "gan-dum"), v("soy", "kedelai", "ke-de-lai"), v("gluten", "gluten", "glu-ten"), v("vegetarian", "vegetarian", "ve-ge-ta-ri-an"), v("vegan", "vegan", "ve-gan"), v("safe", "aman", "a-man", "adjective"), v("dangerous", "berbahaya", "ber-ba-ha-ya", "adjective"),
      v("contain", "mengandung", "meng-an-dung", "verb"), v("without", "tanpa", "tan-pa", "preposition"), v("separate utensil", "peralatan terpisah", "per-a-lat-an ter-pi-sah"), v("cross-contact", "kontak silang", "kon-tak si-lang"), v("symptom", "gejala", "ge-ja-la"), v("rash", "ruam", "ru-am"), v("swelling", "bengkak", "beng-kak"), v("emergency", "darurat", "da-rat", "noun")
    ],
    dialogues: [
      dialogue("allergy-order", "Explaining an allergy", "Tell a restaurant about a serious allergy.", [["traveler", "I have a peanut allergy.", "Saya alergi kacang tanah."], ["local", "Does this dish contain peanuts?", "Apakah makanan ini mengandung kacang tanah?"], ["traveler", "Please prepare it without peanuts.", "Tolong siapkan tanpa kacang tanah."]]),
      dialogue("allergy-ingredients", "Checking ingredients", "Ask about sauces and utensils.", [["traveler", "Does the sauce contain fish sauce?", "Apakah sausnya mengandung kecap ikan?"], ["local", "Yes. We can prepare a separate dish.", "Ya. Kami bisa menyiapkan hidangan terpisah."], ["traveler", "Thank you for being careful.", "Terima kasih sudah berhati-hati."]]),
      dialogue("allergy-reaction", "A reaction", "Describe symptoms and ask for help.", [["traveler", "I am having an allergic reaction.", "Saya mengalami reaksi alergi."], ["local", "What symptoms do you have?", "Apa gejalanya?"], ["traveler", "My face is swelling. Call an ambulance.", "Wajah saya bengkak. Tolong panggil ambulans."]])
    ]
  },
  {
    id: "weather", title: "Weather & Conditions", shortTitle: "Weather", description: "Understand forecasts, plan around heat or rain, and respond to severe weather.", category: "safety",
    domain: [
      v("weather", "cuaca", "cu-a-ca"), v("forecast", "prakiraan cuaca", "pra-ki-ra-an cu-a-ca"), v("temperature", "suhu", "su-hu"), v("sun", "matahari", "ma-ta-ha-ri"), v("cloud", "awan", "a-wan"), v("rain", "hujan", "hu-jan"), v("storm", "badai", "ba-dai"), v("thunder", "guntur", "gun-tur"),
      v("lightning", "petir", "pe-tir"), v("wind", "angin", "a-ngin"), v("humidity", "kelembapan", "ke-lem-ba-pan"), v("flood", "banjir", "ban-jir"), v("sunny", "cerah", "ce-rah", "adjective"), v("cloudy", "berawan", "be-ra-wan", "adjective"), v("rainy", "musim hujan", "mu-sim hu-jan", "adjective"), v("hot", "panas", "pa-nas", "adjective"),
      v("cool", "sejuk", "se-juk", "adjective"), v("cold", "dingin", "di-ngin", "adjective"), v("umbrella", "payung", "pa-yung"), v("raincoat", "jas hujan", "jas hu-jan"), v("sunscreen", "tabir surya", "ta-bir sur-ya"), v("warning", "peringatan", "pe-ring-at-an"), v("evacuate", "mengungsi", "meng-ung-si", "verb"), v("safe place", "tempat aman", "tem-pat a-man")
    ],
    dialogues: [
      dialogue("weather-forecast", "Checking the forecast", "Ask whether it will rain.", [["traveler", "What will the weather be like today?", "Bagaimana cuaca hari ini?"], ["local", "It will be hot with some rain.", "Akan panas dan sedikit hujan."], ["traveler", "Should I bring an umbrella?", "Haruskah saya membawa payung?"]]),
      dialogue("weather-planning", "Planning around weather", "Change a plan because of heat or rain.", [["traveler", "It is too hot to walk now.", "Sekarang terlalu panas untuk berjalan."], ["local", "Let us go in the evening.", "Mari pergi sore nanti."], ["traveler", "I will bring sunscreen.", "Saya akan membawa tabir surya."]]),
      dialogue("weather-warning", "A severe warning", "Respond to a storm or flood warning.", [["local", "There is a storm warning. Please stay inside.", "Ada peringatan badai. Silakan tetap di dalam."], ["traveler", "Is this area safe?", "Apakah daerah ini aman?"], ["local", "Go to the higher, safe place.", "Pergilah ke tempat yang lebih tinggi dan aman."]])
    ]
  },
  {
    id: "emergencies-help", title: "Emergencies & Help", shortTitle: "Emergencies", description: "Ask for urgent medical or police help and follow emergency instructions.", category: "safety",
    domain: [
      v("help", "bantuan", "ban-tu-an"), v("emergency", "keadaan darurat", "ke-a-da-an da-rat"), v("ambulance", "ambulans", "am-bu-lans"), v("hospital", "rumah sakit", "ru-mah sa-kit"), v("doctor", "dokter", "dok-ter"), v("pharmacy", "apotek", "a-po-tek"), v("medicine", "obat", "o-bat"), v("pain", "sakit", "sa-kit"),
      v("injury", "cedera", "ce-de-ra"), v("fever", "demam", "de-mam"), v("dizzy", "pusing", "pu-sing", "adjective"), v("breathe", "bernapas", "ber-na-pas", "verb"), v("police", "polisi", "po-li-si"), v("police station", "kantor polisi", "kan-tor po-li-si"), v("theft", "pencurian", "pen-cu-ri-an"), v("lost passport", "paspor hilang", "pas-por hi-lang"),
      v("accident", "kecelakaan", "ke-ce-la-ka-an"), v("fire", "kebakaran", "ke-ba-kar-an"), v("danger", "bahaya", "ba-ha-ya"), v("address", "alamat", "a-la-mat"), v("phone number", "nomor telepon", "no-mor te-le-pon"), v("insurance", "asuransi", "a-su-ran-si"), v("shelter", "tempat perlindungan", "tem-pat per-lin-dung-an"), v("safe", "aman", "a-man", "adjective")
    ],
    dialogues: [
      dialogue("emergency-medical", "Getting medical help", "Describe an urgent symptom.", [["traveler", "Please help me. I am hurt.", "Tolong bantu saya. Saya terluka."], ["local", "Where does it hurt?", "Bagian mana yang sakit?"], ["traveler", "My leg hurts. Call an ambulance.", "Kaki saya sakit. Panggil ambulans."]]),
      dialogue("emergency-police", "Reporting a loss", "Ask the police for help.", [["traveler", "I lost my passport.", "Paspor saya hilang."], ["local", "Please report it at the police station.", "Silakan laporkan di kantor polisi."], ["traveler", "Where is the nearest station?", "Kantor polisi terdekat di mana?"]]),
      dialogue("emergency-evacuation", "Following instructions", "Move to a safe place.", [["local", "There is a fire. Leave the building now.", "Ada kebakaran. Tinggalkan gedung sekarang."], ["traveler", "Where is the emergency exit?", "Pintu keluar darurat di mana?"], ["local", "Follow me to the safe area.", "Ikuti saya ke tempat yang aman."]])
    ]
  },
  {
    id: "cafes-coffee", title: "Cafés & Indonesian Drinks", shortTitle: "Cafés", description: "Find a café, order Indonesian coffee, and make a relaxed meeting plan.", category: "explore",
    domain: [
      v("café", "kedai kopi", "ke-dai ko-pi"), v("coffee", "kopi", "ko-pi"), v("coffee bean", "biji kopi", "bi-ji ko-pi"), v("filter", "saringan", "sa-ring-an"), v("condensed milk", "susu kental manis", "su-su ken-tal ma-nis"), v("black coffee", "kopi hitam", "ko-pi hi-tam"), v("milk coffee", "kopi susu", "ko-pi su-su"), v("iced coffee", "es kopi", "es ko-pi"),
      v("hot coffee", "kopi panas", "ko-pi pa-nas"), v("less sweet", "kurang manis", "ku-rang ma-nis"), v("no sugar", "tanpa gula", "tan-pa gu-la"), v("extra ice", "tambah es", "tam-bah es"), v("tea", "teh", "teh"), v("juice", "jus", "jus"), v("cup", "cangkir", "cang-kir"), v("straw", "sedotan", "se-do-tan"),
      v("table", "meja", "me-ja"), v("seat", "tempat duduk", "tem-pat du-duk"), v("Wi-Fi", "Wi-Fi", "wai-fai"), v("outlet", "stopkontak", "stop-kon-tak"), v("work", "bekerja", "be-ker-ja", "verb"), v("meeting", "pertemuan", "per-te-mu-an"), v("quiet", "tenang", "te-nang", "adjective"), v("bill", "minta tagihan", "min-ta ta-gi-han", "verb")
    ],
    dialogues: [
      dialogue("cafe-order", "Ordering coffee", "Choose an Indonesian coffee.", [["traveler", "What coffee do you recommend?", "Kopi apa yang Anda rekomendasikan?"], ["local", "Try iced coffee with milk.", "Coba es kopi susu."], ["traveler", "Great. One cup, please.", "Baik. Satu cangkir, tolong."]]),
      dialogue("cafe-preferences", "Adjusting a drink", "Ask for less sugar or more ice.", [["traveler", "Could I have less sweet and extra ice?", "Boleh kurang manis dan tambah es?"], ["local", "Sure. Would you like a straw?", "Tentu. Mau sedotan?"], ["traveler", "Yes, thank you.", "Ya, terima kasih."]]),
      dialogue("cafe-meeting", "Working at a café", "Arrange a meeting and ask about Wi-Fi.", [["traveler", "Is there Wi-Fi and a quiet table?", "Ada Wi-Fi dan meja yang tenang?"], ["local", "The password is on the wall.", "Kata sandinya ada di dinding."], ["traveler", "I will work here for an hour.", "Saya akan bekerja di sini selama satu jam."]])
    ]
  },
  {
    id: "work-study", title: "Work & Study", shortTitle: "Work & Study", description: "Introduce your work or studies, arrange tasks, and clarify what happens next.", category: "explore",
    domain: [
      v("work", "kerja", "ker-ja"), v("job", "pekerjaan", "pe-ker-ja-an"), v("office", "kantor", "kan-tor"), v("school", "sekolah", "se-ko-lah"), v("university", "universitas", "u-ni-ver-si-tas"), v("teacher", "guru", "gu-ru"), v("student", "mahasiswa", "ma-ha-sis-wa"), v("colleague", "rekan kerja", "re-kan ker-ja"),
      v("manager", "manajer", "ma-na-jer"), v("meeting", "rapat", "ra-pat"), v("schedule", "jadwal", "jad-wal"), v("task", "tugas", "tu-gas"), v("project", "proyek", "pro-yek"), v("deadline", "batas waktu", "ba-tas wak-tu"), v("document", "dokumen", "do-ku-men"), v("email", "surel", "su-rel"),
      v("example", "contoh", "con-toh"), v("question", "pertanyaan", "per-ta-nya-an"), v("answer", "jawaban", "ja-wab-an"), v("explain", "menjelaskan", "men-je-las-kan", "verb"), v("understand", "memahami", "me-ma-ha-mi", "verb"), v("agree", "setuju", "se-tu-ju", "verb"), v("finish", "menyelesaikan", "me-nye-le-sai-kan", "verb"), v("follow up", "menindaklanjuti", "me-nin-dak-lan-jut-i", "verb")
    ],
    dialogues: [
      dialogue("work-introduce", "Introducing yourself", "Say what you do.", [["traveler", "I work in technology.", "Saya bekerja di bidang teknologi."], ["local", "Where is your office?", "Kantor Anda di mana?"], ["traveler", "It is in Singapore.", "Di Singapura."]]),
      dialogue("work-schedule", "Arranging a task", "Confirm a meeting and deadline.", [["traveler", "When is the meeting?", "Rapatnya kapan?"], ["local", "Tomorrow at nine in the morning.", "Besok jam sembilan pagi."], ["traveler", "When is the deadline?", "Batas waktunya kapan?"]]),
      dialogue("work-clarify", "Clarifying", "Ask for an example and confirm next steps.", [["traveler", "I do not understand this part.", "Saya tidak memahami bagian ini."], ["local", "I will explain with an example.", "Saya akan menjelaskan dengan contoh."], ["traveler", "I will follow up by email.", "Saya akan menindaklanjuti melalui surel."]])
    ]
  },
  {
    id: "sightseeing-culture", title: "Sightseeing & Indonesian Culture", shortTitle: "Sightseeing", description: "Visit attractions respectfully, buy tickets, ask permission, and share experiences.", category: "explore",
    domain: [
      v("sightseeing", "berwisata", "ber-wi-sa-ta"), v("attraction", "tempat wisata", "tem-pat wi-sa-ta"), v("museum", "museum", "mu-se-um"), v("temple", "kuil", "ku-il"), v("mosque", "masjid", "mas-jid"), v("old town", "kota tua", "ko-ta tu-a"), v("beach", "pantai", "pan-tai"), v("mountain", "gunung", "gu-nung"),
      v("lake", "danau", "da-nau"), v("ticket booth", "loket tiket", "lo-ket ti-ket"), v("entrance fee", "biaya masuk", "bi-a-ya ma-suk"), v("opening hours", "jam buka", "jam bu-ka"), v("closed day", "hari libur", "ha-ri li-bur"), v("guide", "pemandu", "pe-man-du"), v("tour", "tur", "tur"), v("traditional", "tradisional", "tra-di-si-o-nal", "adjective"),
      v("custom", "adat", "a-dat"), v("respect", "menghormati", "meng-hor-ma-ti", "verb"), v("shoes", "sepatu", "se-pa-tu"), v("quiet", "tenang", "te-nang", "adjective"), v("photo", "foto", "fo-to"), v("permission", "izin", "i-zin"), v("souvenir", "oleh-oleh", "o-leh o-leh"), v("memory", "kenangan", "ke-nang-an")
    ],
    dialogues: [
      dialogue("culture-tickets", "Visiting a place", "Ask about tickets and hours.", [["traveler", "How much is the entrance fee?", "Biaya masuknya berapa?"], ["local", "It is one hundred thousand rupiah.", "Seratus ribu rupiah."], ["traveler", "What time do you close?", "Tutup jam berapa?"]]),
      dialogue("culture-respect", "A respectful visit", "Follow local customs.", [["local", "Please remove your shoes here.", "Silakan lepas sepatu di sini."], ["traveler", "May I take a photo?", "Boleh saya mengambil foto?"], ["local", "Yes, but please be quiet.", "Boleh, tetapi tolong tenang."]]),
      dialogue("culture-memories", "Sharing a memory", "Talk about a place and a souvenir.", [["traveler", "This place is beautiful.", "Tempat ini indah sekali."], ["local", "Would you like a local souvenir?", "Mau membeli oleh-oleh?"], ["traveler", "Yes. I want something for my family.", "Ya. Saya ingin sesuatu untuk keluarga saya."]])
    ]
  }
];

export const indonesianTopics = seeds.map(buildTopic);
