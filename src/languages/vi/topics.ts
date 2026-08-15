import { buildTopic, dialogue, v, type TopicSeed } from "./helpers";

const seeds: TopicSeed[] = [
  {
    id: "vietnamese-foundations",
    title: "People, Politeness & Core Grammar",
    shortTitle: "Vietnamese Foundations",
    description: "Choose respectful terms of address, soften everyday speech, and build essential Vietnamese sentences.",
    category: "essentials",
    domain: [
      v("neutral or formal I", "tôi", "", "pronoun"), v("friendly I", "mình", "", "pronoun"),
      v("you / peer", "bạn", "", "pronoun"), v("older man / older brother", "anh", "", "pronoun"),
      v("older woman / older sister", "chị", "", "pronoun"), v("younger person / younger sibling", "em", "", "pronoun"),
      v("woman around your parents' age / Ms.", "cô", "", "pronoun"), v("man around your parents' age / Mr.", "chú", "", "pronoun"),
      v("polite yes / acknowledgement", "dạ", "", "particle"), v("respectful sentence-ending particle", "ạ", "", "particle"),
      v("soft request or suggestion particle", "nhé", "", "particle"), v("excuse me / may I ask", "cho tôi hỏi", "", "phrase"),
      v("please help me", "giúp tôi với", "", "phrase"), v("please repeat", "xin nói lại", "", "phrase"),
      v("please write it down for me", "xin viết ra giúp tôi", "", "phrase"), v("yes, thank you", "dạ, cảm ơn", "", "phrase"),
      v("identity copula / to be", "là", "", "verb"), v("have / exist", "có", "", "verb"),
      v("not / question particle", "không", "", "particle"), v("ongoing-action marker", "đang", "", "particle"),
      v("completed or past marker", "đã", "", "particle"), v("future marker", "sẽ", "", "particle"),
      v("want", "muốn", "", "verb"), v("need", "cần", "", "verb")
    ],
    dialogues: [
      dialogue("foundations-address", "Choosing how to address someone", "Ask which term of address to use with a new acquaintance.", [["traveler", "How should I address you?", "Tôi nên xưng hô với bạn thế nào?"], ["local", "You can call me Linh.", "Bạn cứ gọi tôi là Linh."], ["traveler", "Hello, Linh. I am Alex.", "Chào bạn Linh. Tôi là Alex."]]),
      dialogue("foundations-politeness", "Speaking politely", "Use ạ, nhé, and dạ in a short exchange.", [["traveler", "Excuse me, where is the station?", "Cho tôi hỏi, nhà ga ở đâu ạ?"], ["local", "Go straight, please.", "Bạn đi thẳng nhé."], ["traveler", "Yes, thank you.", "Dạ, cảm ơn anh."]]),
      dialogue("foundations-grammar", "Using core grammar", "Combine question, aspect, and future markers.", [["local", "Do you need help?", "Bạn có cần giúp đỡ không?"], ["traveler", "Yes. I am looking for the station.", "Có. Tôi đang tìm nhà ga."], ["local", "I will show you the way.", "Tôi sẽ chỉ đường cho bạn."]])
    ]
  },
  {
    id: "greetings-small-talk",
    title: "Greetings & Small Talk",
    shortTitle: "Greetings",
    description: "Meet people, introduce yourself, make plans, and leave conversations warmly.",
    category: "essentials",
    domain: [
      v("name", "tên", "ten"), v("age", "tuổi", "tooy"), v("country", "đất nước", "duht nook"), v("city", "thành phố", "tang foh"),
      v("language", "ngôn ngữ", "ngone ngoo"), v("occupation", "nghề nghiệp", "ngay nyep"), v("student", "sinh viên", "sing vyen"), v("friend", "bạn bè", "ban bay"),
      v("family", "gia đình", "zah ding"), v("married", "đã kết hôn", "da kayt hone", "adjective"), v("single", "độc thân", "doke tun", "adjective"), v("interesting", "thú vị", "took vee", "adjective"),
      v("free / available", "rảnh", "ranh", "adjective"), v("busy", "bận", "bun", "adjective"), v("plan", "kế hoạch", "kay hwahk"), v("weekend", "cuối tuần", "koy toon"),
      v("invitation", "lời mời", "loy moy"), v("accept", "đồng ý", "dome ee", "verb"), v("decline", "từ chối", "too choy", "verb"), v("happy", "vui", "voo-ee", "adjective"),
      v("tired", "mệt", "met", "adjective"), v("hot", "nóng", "nong", "adjective"), v("cold", "lạnh", "lanh", "adjective"), v("long time no see", "lâu rồi không gặp", "low roy khom gap", "phrase")
    ],
    dialogues: [
      dialogue("greetings-meet", "First meeting", "Introduce yourself to someone new.", [["traveler", "Hello. My name is Alex.", "Xin chào. Tôi tên là Alex."], ["local", "Nice to meet you. Where are you from?", "Rất vui được gặp bạn. Bạn đến từ đâu?"], ["traveler", "I am from Canada.", "Tôi đến từ Canada."]]),
      dialogue("greetings-small-talk", "Making plans", "Make a simple plan with a new friend.", [["traveler", "Are you free this weekend?", "Cuối tuần này bạn có rảnh không?"], ["local", "Yes, I am free on Saturday.", "Có, tôi rảnh vào thứ bảy."], ["traveler", "Would you like to have coffee?", "Bạn muốn đi uống cà phê không?"]]),
      dialogue("greetings-partings", "Parting warmly", "End a friendly conversation.", [["local", "It was nice talking with you.", "Nói chuyện với bạn rất vui."], ["traveler", "Thank you. See you again.", "Cảm ơn. Hẹn gặp lại."], ["local", "Have a good day!", "Chúc bạn một ngày tốt lành!"]])
    ]
  },
  {
    id: "numbers-dates-time",
    title: "Numbers, Dates & Time",
    shortTitle: "Numbers & Time",
    description: "Count, understand prices, arrange appointments, and talk about duration.",
    category: "essentials",
    domain: [
      v("one", "một", "moht", "number"), v("two", "hai", "high", "number"), v("three", "ba", "bah", "number"),
      v("four", "bốn", "bone", "number"), v("five", "năm", "num", "number"), v("six", "sáu", "sow", "number"), v("seven", "bảy", "buy", "number"),
      v("eight", "tám", "tahm", "number"), v("nine", "chín", "cheen", "number"), v("ten", "mười", "mooy", "number"),
      v("price", "giá", "zah"), v("money", "tiền", "tyen"), v("change", "tiền thừa", "tyen too-uh"), v("cheap", "rẻ", "ray", "adjective"),
      v("expensive", "đắt", "duht", "adjective"), v("total", "tổng cộng", "tome gome"), v("quantity", "số lượng", "so loong"), v("pair", "đôi", "doy"),
      v("piece", "cái", "guy"), v("kilogram", "ki-lô-gam", "kee-lo-gam"), v("hour", "giờ", "zuh"), v("minute", "phút", "foot"),
      v("appointment", "cuộc hẹn", "kook hen"), v("late", "muộn", "moone", "adverb")
    ],
    dialogues: [
      dialogue("numbers-money", "At a market", "Confirm a quantity and price.", [["traveler", "How much is this?", "Cái này bao nhiêu tiền?"], ["local", "It is fifty thousand dong.", "Năm mươi nghìn đồng."], ["traveler", "I would like two pieces, please.", "Cho tôi hai cái, làm ơn."]]),
      dialogue("numbers-dates", "Making an appointment", "Arrange a day and time.", [["traveler", "What day is the appointment?", "Cuộc hẹn vào ngày nào?"], ["local", "It is on Monday the tenth.", "Vào thứ hai, ngày mười."], ["traveler", "What time should I come?", "Tôi nên đến lúc mấy giờ?"]]),
      dialogue("numbers-time", "Running late", "Explain a delay.", [["traveler", "I am sorry, I am late.", "Xin lỗi, tôi đến muộn."], ["local", "That is okay. How long will it take?", "Không sao. Sẽ mất bao lâu?"], ["traveler", "About thirty minutes.", "Khoảng ba mươi phút."]])
    ]
  },
  {
    id: "airports-flights",
    title: "Airports & Flights",
    shortTitle: "Airports",
    description: "Handle check-in, baggage, immigration, security, boarding, and flight changes.",
    category: "travel",
    domain: [
      v("airport", "sân bay", "sun buy"), v("flight", "chuyến bay", "chwen buy"), v("ticket", "vé máy bay", "vay my buy"), v("passport", "hộ chiếu", "ho chew"),
      v("visa", "thị thực", "tee took"), v("check-in counter", "quầy làm thủ tục", "kway lahm too took"), v("boarding pass", "thẻ lên máy bay", "tay lung my buy"), v("luggage", "hành lý", "han lee"),
      v("suitcase", "va li", "vah lee"), v("carry-on bag", "hành lý xách tay", "han lee sak tie"), v("checked baggage", "hành lý ký gửi", "han lee kee goo-ee"), v("baggage claim", "khu nhận hành lý", "koo nyun han lee"),
      v("customs", "hải quan", "high kwan"), v("immigration", "nhập cảnh", "nyup kanh"), v("security check", "kiểm tra an ninh", "kyem chah an ning"), v("gate", "cửa ra máy bay", "koo-uh rah my buy"),
      v("terminal", "nhà ga", "nya gah"), v("departure", "khởi hành", "khoy hanh"), v("arrival", "đến nơi", "den noy"), v("seat", "chỗ ngồi", "chaw ngoy"),
      v("window seat", "ghế cạnh cửa sổ", "gay kanh koo-uh soh"), v("delay", "trì hoãn", "chee hwan"), v("cancel", "hủy chuyến", "hoo-ee chwen", "verb"), v("connection", "chuyến bay nối chuyến", "chwen buy noy chwen")
    ],
    dialogues: [
      dialogue("airport-checkin", "Checking in", "Complete check-in and baggage drop.", [["traveler", "Here is my passport and ticket.", "Đây là hộ chiếu và vé của tôi."], ["local", "Do you have any checked baggage?", "Bạn có hành lý ký gửi không?"], ["traveler", "Yes, one suitcase.", "Có, một va li."]]),
      dialogue("airport-boarding", "Finding the gate", "Ask about security and boarding.", [["traveler", "Where is gate twelve?", "Cửa số mười hai ở đâu?"], ["local", "Go through security and turn left.", "Đi qua cửa an ninh rồi rẽ trái."], ["traveler", "Thank you. When does boarding start?", "Cảm ơn. Khi nào bắt đầu lên máy bay?"]]),
      dialogue("airport-delay", "A delayed connection", "Handle a changed flight.", [["traveler", "My flight is delayed. What should I do?", "Chuyến bay của tôi bị hoãn. Tôi nên làm gì?"], ["local", "Please wait for the new announcement.", "Vui lòng chờ thông báo mới."], ["traveler", "Can I still make my connection?", "Tôi vẫn có thể kịp chuyến nối không?"]])
    ]
  },
  {
    id: "directions-navigation",
    title: "Directions & Navigation",
    shortTitle: "Directions",
    description: "Ask for places, follow routes, use addresses, and find your way again.",
    category: "travel",
    domain: [
      v("street", "phố", "foh"), v("road", "đường", "duhng"), v("address", "địa chỉ", "dee-uh chee"), v("map", "bản đồ", "ban daw"),
      v("landmark", "địa danh", "dee-uh zun"), v("building", "tòa nhà", "twah nya"), v("entrance", "lối vào", "loy vow"), v("exit", "lối ra", "loy rah"),
      v("intersection", "ngã tư", "ngah too"), v("traffic light", "đèn giao thông", "den zow thong"), v("bridge", "cầu", "kow"), v("river", "sông", "sung"),
      v("left", "bên trái", "ben try"), v("right", "bên phải", "ben fie"), v("straight", "thẳng", "tang", "adverb"), v("turn", "rẽ", "ray", "verb"),
      v("near", "gần", "gun", "adjective"), v("far", "xa", "sah", "adjective"), v("next to", "bên cạnh", "ben kanh"), v("opposite", "đối diện", "doy deen"),
      v("walk", "đi bộ", "dee bow", "verb"), v("motorbike taxi", "xe ôm", "say ohm"), v("taxi driver", "tài xế taxi", "tie say taxi"), v("lost", "bị lạc", "bee lack", "adjective")
    ],
    dialogues: [
      dialogue("directions-landmarks", "Finding a landmark", "Ask where a place is.", [["traveler", "Excuse me, where is the market?", "Cho tôi hỏi, chợ ở đâu ạ?"], ["local", "It is next to the bridge.", "Chợ ở bên cạnh cây cầu."], ["traveler", "Is it far from here?", "Chỗ đó có xa đây không?"]]),
      dialogue("directions-route", "Following a route", "Confirm turns and crossings.", [["traveler", "Should I turn left at the light?", "Tôi có nên rẽ trái ở đèn giao thông không?"], ["local", "No, go straight and turn right.", "Không, đi thẳng rồi rẽ phải."], ["traveler", "How long does it take on foot?", "Đi bộ mất bao lâu?"]]),
      dialogue("directions-lost", "Getting unlost", "Use an address or taxi.", [["traveler", "I am lost. Can you help me?", "Tôi bị lạc. Bạn có thể giúp tôi không?"], ["local", "Show me the address on your phone.", "Cho tôi xem địa chỉ trên điện thoại."], ["traveler", "I will take a taxi there.", "Tôi sẽ đi taxi đến đó."]])
    ]
  },
  {
    id: "trains-stations",
    title: "Trains & Stations",
    shortTitle: "Trains",
    description: "Buy fares, find platforms, transfer between services, and handle rail disruptions.",
    category: "travel",
    domain: [
      v("train", "tàu hỏa", "tow haw"), v("station", "ga tàu", "gah tow"), v("platform", "sân ga", "sun gah"), v("route", "tuyến đường", "twen duhng"),
      v("one-way ticket", "vé một chiều", "vay moht chee-ow"), v("return ticket", "vé khứ hồi", "vay koo hoy"), v("seat reservation", "đặt chỗ", "duht chaw"), v("coach", "toa tàu", "twah tow"),
      v("soft seat", "ghế mềm", "gay mem"), v("hard seat", "ghế cứng", "gay koong"), v("sleeper", "giường nằm", "zuhng num"), v("departure board", "bảng giờ tàu", "bang zuh tow"),
      v("ticket office", "phòng vé", "fome vay"), v("entrance gate", "cổng vào", "gome vow"), v("transfer", "chuyển tàu", "chwen tow"), v("next stop", "ga tiếp theo", "gah tyep theo"),
      v("luggage rack", "giá để hành lý", "zah day han lee"), v("aisle", "lối đi", "loy dee"), v("window", "cửa sổ", "koo-uh soh"), v("on time", "đúng giờ", "doong zuh", "adjective"),
      v("platform number", "số sân ga", "so sun gah"), v("delay announcement", "thông báo tàu chậm", "thong bow tow chum"), v("sold out", "hết vé", "het vay", "adjective"), v("reservation", "đặt chỗ trước", "duht chaw truoc")
    ],
    dialogues: [
      dialogue("train-tickets", "Buying a ticket", "Ask for a route and seat.", [["traveler", "I would like a ticket to Huế.", "Tôi muốn mua vé đi Huế."], ["local", "One way or return?", "Một chiều hay khứ hồi?"], ["traveler", "Return, with a soft seat, please.", "Khứ hồi, ghế mềm, làm ơn."]]),
      dialogue("train-transfer", "Changing trains", "Confirm a transfer.", [["traveler", "Which platform is the train to Đà Nẵng?", "Tàu đi Đà Nẵng ở sân ga nào?"], ["local", "Platform three. Change at the next station.", "Sân ga số ba. Đổi tàu ở ga tiếp theo."], ["traveler", "How much time do I have?", "Tôi có bao lâu?"]]),
      dialogue("train-disruption", "A rail delay", "Ask about a delayed service.", [["traveler", "Is the train on time?", "Tàu có đúng giờ không?"], ["local", "No, there is a thirty-minute delay.", "Không, tàu bị chậm ba mươi phút."], ["traveler", "Can I change my reservation?", "Tôi có thể đổi đặt chỗ không?"]])
    ]
  },
  {
    id: "buses-terminals",
    title: "Buses & Terminals",
    shortTitle: "Buses",
    description: "Find stops, pay fares, request a stop, and manage local or long-distance buses.",
    category: "travel",
    domain: [
      v("bus", "xe buýt", "say boot"), v("bus station", "bến xe", "ben say"), v("bus stop", "trạm xe buýt", "trum say boot"), v("route number", "số tuyến", "so twen"),
      v("destination", "điểm đến", "dee-um den"), v("fare", "giá vé", "zah vay"), v("bus card", "thẻ xe buýt", "tay say boot"), v("cash", "tiền mặt", "tyen muht"),
      v("driver", "tài xế", "tie say"), v("conductor", "phụ xe", "foo say"), v("front door", "cửa trước", "koo-uh truoc"), v("back door", "cửa sau", "koo-uh sow"),
      v("get on", "lên xe", "lung say", "verb"), v("get off", "xuống xe", "swong say", "verb"), v("press the button", "bấm nút", "bum noot", "verb"), v("stop here", "dừng ở đây", "zoong uh day", "phrase"),
      v("express bus", "xe buýt nhanh", "say boot nyang"), v("sleeper bus", "xe giường nằm", "say zuhng num"), v("reservation number", "mã đặt chỗ", "mah duht chaw"), v("luggage compartment", "khoang hành lý", "kwang han lee"),
      v("traffic", "giao thông", "zow thong"), v("crowded", "đông", "dome", "adjective"), v("empty", "vắng", "vung", "adjective"), v("last stop", "bến cuối", "ben koy")
    ],
    dialogues: [
      dialogue("bus-routes", "Finding a bus", "Ask about a route and stop.", [["traveler", "Which bus goes to the museum?", "Xe buýt nào đi đến bảo tàng?"], ["local", "Take bus number twelve.", "Đi xe buýt số mười hai."], ["traveler", "Where is the stop?", "Trạm xe buýt ở đâu?"]]),
      dialogue("bus-boarding", "Getting on", "Pay and ask where to get off.", [["traveler", "How much is the fare?", "Giá vé bao nhiêu?"], ["local", "It is seven thousand dong.", "Bảy nghìn đồng."], ["traveler", "Please tell me when to get off.", "Làm ơn cho tôi biết khi nào xuống xe."]]),
      dialogue("bus-long-distance", "A sleeper bus", "Confirm a reservation and luggage.", [["traveler", "I have a reservation for Đà Lạt.", "Tôi có đặt chỗ đi Đà Lạt."], ["local", "Please put your luggage here.", "Vui lòng để hành lý ở đây."], ["traveler", "When do we arrive?", "Khi nào chúng ta đến nơi?"]])
    ]
  },
  {
    id: "hotels",
    title: "Hotels & Stays",
    shortTitle: "Hotels",
    description: "Book a room, check in, request help, use facilities, and check out smoothly.",
    category: "daily-life",
    domain: [
      v("hotel", "khách sạn", "kak san"), v("room", "phòng", "fome"), v("reservation", "đặt phòng", "duht fome"), v("booking number", "mã đặt phòng", "mah duht fome"),
      v("single room", "phòng đơn", "fome done"), v("double room", "phòng đôi", "fome doy"), v("bed", "giường", "zuhng"), v("bathroom", "phòng tắm", "fome tum"),
      v("key", "chìa khóa", "chee-ah khwah"), v("key card", "thẻ phòng", "tay fome"), v("reception", "quầy lễ tân", "kway lay tun"), v("passport copy", "bản sao hộ chiếu", "ban sow ho chew"),
      v("breakfast", "bữa sáng", "boo-ah sahng"), v("elevator", "thang máy", "tang my"), v("floor", "tầng", "tung"), v("Wi-Fi password", "mật khẩu Wi-Fi", "mut khow-ee"),
      v("air conditioner", "điều hòa", "dee-ow hwah", "noun", ["máy lạnh"]), v("hot water", "nước nóng", "nooc nong"), v("towel", "khăn tắm", "khan tum"), v("extra pillow", "gối thêm", "goy them"),
      v("quiet", "yên tĩnh", "yen ting", "adjective"), v("noisy", "ồn", "one", "adjective"), v("available", "còn phòng", "gone fome", "adjective"), v("check out", "trả phòng", "chah fome", "verb")
    ],
    dialogues: [
      dialogue("hotel-checkin", "Checking in", "Confirm a reservation and room.", [["traveler", "I have a reservation under Alex.", "Tôi đã đặt phòng dưới tên Alex."], ["local", "May I see your passport?", "Tôi có thể xem hộ chiếu của bạn không?"], ["traveler", "Here it is. Does the room rate include breakfast?", "Đây ạ. Giá phòng có bao gồm bữa sáng không?"]]),
      dialogue("hotel-problem", "A room problem", "Request a repair or replacement.", [["traveler", "The air conditioner is not working.", "Điều hòa không hoạt động."], ["local", "We will send someone to check it.", "Chúng tôi sẽ cho người đến kiểm tra."], ["traveler", "Thank you. Could I have another towel?", "Cảm ơn. Tôi có thể xin thêm khăn không?"]]),
      dialogue("hotel-checkout", "Checking out", "Return the key and settle the bill.", [["traveler", "I would like to check out.", "Tôi muốn trả phòng."], ["local", "Did you use the minibar?", "Bạn có dùng minibar không?"], ["traveler", "No. Can you call a taxi, please?", "Không. Bạn gọi taxi giúp tôi được không?"]])
    ]
  },
  {
    id: "restaurants-food",
    title: "Restaurants & Food",
    shortTitle: "Food",
    description: "Choose dishes, order naturally, ask about ingredients, and pay at the end of a meal.",
    category: "daily-life",
    domain: [
      v("restaurant", "nhà hàng", "nya hang"), v("table", "bàn", "ban"), v("menu", "thực đơn", "took done"), v("dish", "món ăn", "mone an"),
      v("rice", "cơm", "guhm"), v("noodle soup", "phở", "fuh"), v("noodles", "bún", "boon"), v("bread", "bánh mì", "bang mee"),
      v("meat", "thịt", "teet"), v("chicken", "gà", "gah"), v("beef", "thịt bò", "teet baw"), v("fish", "cá", "gah"),
      v("vegetables", "rau", "row"), v("herbs", "rau thơm", "row tome"), v("soup", "canh", "kanh"), v("sauce", "nước chấm", "nooc chum"),
      v("spicy", "cay", "guy", "adjective"), v("sweet", "ngọt", "ngote", "adjective"), v("salty", "mặn", "mun", "adjective"), v("delicious", "ngon", "ngone", "adjective"),
      v("vegetarian", "chay", "chigh", "adjective"), v("ice", "đá", "dah"), v("bill", "tính tiền", "ting tyen", "phrase", ["hóa đơn"]), v("takeaway", "mang đi", "mang dee", "phrase")
    ],
    dialogues: [
      dialogue("food-menu", "Choosing a table", "Enter a restaurant and ask for a menu.", [["traveler", "A table for two, please.", "Cho tôi một bàn cho hai người."], ["local", "Here is the menu.", "Đây là thực đơn."], ["traveler", "What do you recommend?", "Bạn giới thiệu món nào?"]]),
      dialogue("food-order", "Ordering food", "Order a dish and adjust the spice.", [["traveler", "I would like phở with chicken.", "Tôi muốn phở gà."], ["local", "Would you like it spicy?", "Bạn có muốn cay không?"], ["traveler", "Please make it a little spicy.", "Cho cay một chút nhé."]]),
      dialogue("food-payment", "Paying the bill", "Finish a meal and request takeaway.", [["traveler", "Could we have the bill, please?", "Cho chúng tôi tính tiền."], ["local", "Yes, one moment please.", "Vâng, xin chờ một chút."], ["traveler", "Please pack the leftovers to go.", "Làm ơn gói phần còn lại mang đi."]])
    ]
  },
  {
    id: "shopping-payments",
    title: "Shopping & Payments",
    shortTitle: "Shopping",
    description: "Find products, compare prices, pay with confidence, and manage returns or delivery.",
    category: "daily-life",
    domain: [
      v("shop", "cửa hàng", "koo-uh hang"), v("market", "chợ", "chuh"), v("product", "sản phẩm", "sun fum"), v("size", "kích cỡ", "kik kuh"),
      v("color", "màu", "mao"), v("small", "nhỏ", "nyaw", "adjective"), v("large", "lớn", "luhn", "adjective"), v("different", "khác", "khak", "adjective"),
      v("in stock", "còn hàng", "gone hang", "adjective"), v("out of stock", "hết hàng", "het hang", "adjective"), v("price tag", "nhãn giá", "nyan zah"), v("discount", "giảm giá", "zyum zah"),
      v("cash", "tiền mặt", "tyen muht"), v("card", "thẻ", "tay"), v("bank transfer", "chuyển khoản", "chwen kwun"), v("receipt", "hóa đơn", "hwah done"),
      v("bag", "túi", "too-ee"), v("gift", "quà", "kwah"), v("try on", "thử", "too", "verb"), v("buy", "mua", "moo-ah", "verb"),
      v("exchange", "đổi hàng", "doy hang", "verb"), v("refund", "hoàn tiền", "hwan tyen", "verb"), v("delivery", "giao hàng", "zow hang"), v("warranty", "bảo hành", "bow hanh")
    ],
    dialogues: [
      dialogue("shopping-products", "Finding an item", "Ask about size, color, and stock.", [["traveler", "Do you have this in a larger size?", "Bạn có cái này cỡ lớn hơn không?"], ["local", "Yes, we have blue and black.", "Có, chúng tôi có màu xanh và màu đen."], ["traveler", "May I try it on?", "Tôi có thể thử không?"]]),
      dialogue("shopping-payment", "Paying", "Confirm the total and payment method.", [["traveler", "How much is the total?", "Tổng cộng bao nhiêu tiền?"], ["local", "It is three hundred thousand dong.", "Ba trăm nghìn đồng."], ["traveler", "Can I pay by card?", "Tôi có thể trả bằng thẻ không?"]]),
      dialogue("shopping-return", "Returning an item", "Ask about an exchange or refund.", [["traveler", "I would like to exchange this item.", "Tôi muốn đổi món hàng này."], ["local", "Do you have the receipt?", "Bạn có hóa đơn không?"], ["traveler", "Yes, here it is.", "Có, đây ạ."]])
    ]
  },
  {
    id: "cleaning-laundry-hygiene",
    title: "Laundry, Hygiene & Cleaning",
    shortTitle: "Laundry & Hygiene",
    description: "Use laundry machines, find toiletries, keep a room clean, and sort waste.",
    category: "daily-life",
    domain: [
      v("laundry", "giặt ủi", "zut oo-ee", "noun", ["giặt là"]), v("washing machine", "máy giặt", "my zut"), v("dryer", "máy sấy", "my say"), v("detergent", "bột giặt", "boht zut"),
      v("soap", "xà phòng", "sah fome"), v("shampoo", "dầu gội", "dow goy"), v("toothbrush", "bàn chải đánh răng", "ban try dung rang"), v("toothpaste", "kem đánh răng", "kem dung rang"),
      v("tissue", "khăn giấy", "khan zay"), v("towel", "khăn", "khan"), v("toilet", "nhà vệ sinh", "nya vay sing"), v("shower", "vòi sen", "voy sen"),
      v("hot water", "nước nóng", "nooc nong"), v("cold water", "nước lạnh", "nooc lanh"), v("clean", "sạch", "suk", "adjective"), v("dirty", "bẩn", "buhn", "adjective"),
      v("wash", "giặt", "zut", "verb"), v("dry", "sấy khô", "say khaw", "verb"), v("iron", "bàn ủi", "ban oo-ee"), v("trash", "rác", "rahk"),
      v("recycling", "tái chế", "tie chay"), v("plastic", "nhựa", "nyoo-uh"), v("separate", "phân loại", "fun loy", "verb"), v("cleaning service", "dịch vụ dọn phòng", "zik voo zohn fome")
    ],
    dialogues: [
      dialogue("laundry-machine", "Using laundry", "Ask how to wash and dry clothes.", [["traveler", "Where is the washing machine?", "Máy giặt ở đâu?"], ["local", "The detergent is next to it.", "Bột giặt ở bên cạnh máy."], ["traveler", "Can I use the dryer too?", "Tôi có thể dùng máy sấy không?"]]),
      dialogue("hygiene-supplies", "Finding supplies", "Ask for toiletries and hot water.", [["traveler", "Could I have more shampoo and a towel?", "Cho tôi thêm dầu gội và một cái khăn được không?"], ["local", "Of course. I will bring them up.", "Được. Tôi sẽ mang lên."], ["traveler", "Is there hot water?", "Có nước nóng không?"]]),
      dialogue("cleaning-waste", "Sorting waste", "Ask about cleaning and recycling.", [["traveler", "Where should I put the trash?", "Tôi nên để rác ở đâu?"], ["local", "Please separate plastic and food waste.", "Vui lòng phân loại nhựa và rác thực phẩm."], ["traveler", "Thank you for explaining.", "Cảm ơn bạn đã giải thích."]])
    ]
  },
  {
    id: "food-allergies",
    title: "Food Allergies & Restrictions",
    shortTitle: "Food Safety",
    description: "Name allergies clearly, ask about ingredients, and respond safely to a reaction.",
    category: "safety",
    domain: [
      v("allergy", "dị ứng", "zee oong"), v("food restriction", "kiêng ăn", "kyeng an"), v("ingredient", "nguyên liệu", "ngwen lee-oo"), v("peanut", "đậu phộng", "dow fong", "noun", ["lạc"]),
      v("tree nut", "các loại hạt", "gak loy hut"), v("shellfish", "hải sản có vỏ", "high sun gaw vaw"), v("fish sauce", "nước mắm", "nooc mum"), v("milk", "sữa", "soo-uh"),
      v("egg", "trứng", "choong"), v("wheat", "lúa mì", "loo-ah mee"), v("soy", "đậu nành", "dow nanh"), v("gluten", "gluten", "gloo-ten"),
      v("vegetarian", "ăn chay", "an chigh"), v("vegan", "thuần chay", "toon chigh"), v("safe", "an toàn", "an twan", "adjective"), v("dangerous", "nguy hiểm", "ngwee hyem", "adjective"),
      v("contain", "có chứa", "gaw choo-ah", "verb"), v("without", "không có", "khom gaw", "preposition"), v("separate utensil", "dụng cụ riêng", "zoong koo zeeng"), v("cross-contact", "nhiễm chéo", "nyem cheo"),
      v("symptom", "triệu chứng", "chee-ow choong"), v("rash", "phát ban", "fut ban"), v("swelling", "sưng", "soong"), v("emergency", "cấp cứu", "kup koo", "noun")
    ],
    dialogues: [
      dialogue("allergy-order", "Explaining an allergy", "Tell a restaurant about a serious allergy.", [["traveler", "I have a severe peanut allergy.", "Tôi bị dị ứng nặng với đậu phộng."], ["local", "This dish contains peanuts.", "Món này có đậu phộng."], ["traveler", "Then I cannot eat it.", "Vậy thì tôi không thể ăn món này."]]),
      dialogue("allergy-ingredients", "Checking ingredients", "Ask about sauces and utensils.", [["traveler", "Does the sauce contain fish sauce?", "Nước chấm có nước mắm không?"], ["local", "Yes. We can prepare a separate dish with separate utensils.", "Có. Chúng tôi có thể làm một món riêng bằng dụng cụ riêng."], ["traveler", "Thank you for being careful.", "Cảm ơn bạn đã cẩn thận."]]),
      dialogue("allergy-reaction", "A reaction", "Describe symptoms and ask for help.", [["traveler", "I am having an allergic reaction.", "Tôi đang bị phản ứng dị ứng."], ["local", "What symptoms do you have?", "Bạn có triệu chứng gì?"], ["traveler", "My face is swelling. Please call an ambulance.", "Mặt tôi đang sưng. Làm ơn gọi xe cấp cứu."]])
    ]
  },
  {
    id: "weather",
    title: "Weather & Conditions",
    shortTitle: "Weather",
    description: "Understand forecasts, plan around heat or rain, and respond to severe weather.",
    category: "safety",
    domain: [
      v("weather", "thời tiết", "toy tyet"), v("forecast", "dự báo", "zoo bow"), v("temperature", "nhiệt độ", "nyet do"), v("sun", "mặt trời", "mut choy"),
      v("cloud", "mây", "my"), v("rain", "mưa", "moo-ah"), v("storm", "bão", "bow"), v("thunder", "sấm", "sum"),
      v("lightning", "sét", "set"), v("wind", "gió", "zaw"), v("humidity", "độ ẩm", "do um"), v("flood", "lũ lụt", "loo loot"),
      v("sunny", "trời nắng", "choy nung", "adjective"), v("cloudy", "nhiều mây", "nyew my", "adjective"), v("rainy", "trời mưa", "choy moo-ah", "adjective"), v("hot", "nóng", "nong", "adjective"),
      v("cool", "mát", "maht", "adjective"), v("cold", "lạnh", "lanh", "adjective"), v("umbrella", "ô", "oh", "noun", ["dù"]), v("raincoat", "áo mưa", "ow moo-ah"),
      v("sunscreen", "kem chống nắng", "kem chong nung"), v("warning", "cảnh báo", "kanh bow"), v("evacuate", "sơ tán", "suh tan", "verb"), v("safe place", "nơi an toàn", "noy an twan")
    ],
    dialogues: [
      dialogue("weather-forecast", "Checking the forecast", "Ask whether it will rain.", [["traveler", "What will the weather be like today?", "Thời tiết hôm nay thế nào?"], ["local", "It will be hot with some rain.", "Trời sẽ nóng và có mưa."], ["traveler", "Should I bring an umbrella?", "Tôi có nên mang ô không?"]]),
      dialogue("weather-planning", "Planning around weather", "Change a plan because of heat or rain.", [["traveler", "It is too hot to walk now.", "Bây giờ nóng quá, không thể đi bộ."], ["local", "Let us go in the evening.", "Chúng ta đi vào buổi tối nhé."], ["traveler", "Good idea. I will bring sunscreen.", "Ý hay đấy. Tôi sẽ mang kem chống nắng."]]),
      dialogue("weather-warning", "A severe warning", "Respond to a storm or flood warning.", [["local", "There is a storm warning. Please stay inside.", "Có cảnh báo bão. Vui lòng ở trong nhà."], ["traveler", "Is this area safe?", "Khu vực này có an toàn không?"], ["local", "Go to the higher, safe place.", "Hãy đi đến nơi cao và an toàn."]])
    ]
  },
  {
    id: "emergencies-help",
    title: "Emergencies & Help",
    shortTitle: "Emergencies",
    description: "Ask for urgent medical or police help and follow emergency instructions.",
    category: "safety",
    domain: [
      v("help", "giúp đỡ", "zoop duh"), v("emergency", "trường hợp khẩn cấp", "choong hup khun kup"), v("ambulance", "xe cấp cứu", "say kup koo"), v("hospital", "bệnh viện", "ben vyen"),
      v("doctor", "bác sĩ", "bak see"), v("pharmacy", "nhà thuốc", "nya took"), v("medicine", "thuốc", "took"), v("pain", "đau", "dow"),
      v("injury", "chấn thương", "chun thuhng"), v("fever", "sốt", "sote"), v("dizzy", "chóng mặt", "chome mut", "adjective"), v("breathe", "thở", "tuh", "verb"),
      v("police", "công an", "gome an"), v("police station", "đồn công an", "done gome an"), v("theft", "trộm cắp", "chome kup"), v("lost passport", "mất hộ chiếu", "mut ho chew"),
      v("accident", "tai nạn", "tie nun"), v("fire", "cháy", "chigh"), v("danger", "nguy hiểm", "ngwee hyem"), v("address", "địa chỉ", "dee-uh chee"),
      v("phone number", "số điện thoại", "so deen twie"), v("insurance", "bảo hiểm", "bow hyem"), v("shelter", "nơi trú ẩn", "noy choo un"), v("safe", "an toàn", "an twan", "adjective")
    ],
    dialogues: [
      dialogue("emergency-medical", "Getting medical help", "Describe an urgent symptom.", [["traveler", "Please help me. I cannot breathe.", "Làm ơn giúp tôi. Tôi không thở được."], ["local", "I will call 115 for an ambulance.", "Tôi sẽ gọi xe cấp cứu theo số 115."], ["traveler", "I need a doctor now.", "Tôi cần bác sĩ ngay."]]),
      dialogue("emergency-police", "Reporting a loss", "Ask the police for help.", [["traveler", "My passport was stolen.", "Hộ chiếu của tôi bị mất cắp."], ["local", "Call the police at 113.", "Hãy gọi công an theo số 113."], ["traveler", "Where is the nearest police station?", "Đồn công an gần nhất ở đâu?"]]),
      dialogue("emergency-evacuation", "Following instructions", "Move to a safe place.", [["local", "There is a fire. Call 114 and leave the building now.", "Có cháy. Hãy gọi 114 và rời khỏi tòa nhà ngay."], ["traveler", "Where is the emergency exit?", "Lối thoát hiểm ở đâu?"], ["local", "Follow me to the safe area.", "Đi theo tôi đến khu vực an toàn."]])
    ]
  },
  {
    id: "cafes-coffee",
    title: "Cafés & Vietnamese Coffee",
    shortTitle: "Cafés",
    description: "Find a café, order Vietnamese coffee, and make a relaxed meeting plan.",
    category: "explore",
    domain: [
      v("café", "quán cà phê", "kwan kah fay"), v("coffee", "cà phê", "kah fay"), v("coffee bean", "hạt cà phê", "hut kah fay"), v("filter", "phin", "feen"),
      v("condensed milk", "sữa đặc", "soo-ah duk"), v("black coffee", "cà phê đen", "kah fay den"), v("milk coffee", "cà phê sữa", "kah fay soo-ah"), v("iced coffee", "cà phê đá", "kah fay dah"),
      v("hot coffee", "cà phê nóng", "kah fay nong"), v("less sweet", "ít ngọt", "eet ngote"), v("no sugar", "không đường", "khom duhng"), v("extra ice", "thêm đá", "them dah"),
      v("tea", "trà", "chah"), v("juice", "nước ép", "nooc ep"), v("cup", "ly", "lee"), v("straw", "ống hút", "ong hoot"),
      v("table", "bàn", "ban"), v("seat", "chỗ ngồi", "chaw ngoy"), v("Wi-Fi", "Wi-Fi", "why-fye"), v("outlet", "ổ cắm điện", "oh kum deen"),
      v("work", "làm việc", "lahm vyek", "verb"), v("meeting", "cuộc họp", "kook hope"), v("quiet", "yên tĩnh", "yen ting", "adjective"), v("bill", "tính tiền", "ting tyen", "verb")
    ],
    dialogues: [
      dialogue("cafe-order", "Ordering coffee", "Choose a Vietnamese coffee.", [["traveler", "What coffee do you recommend?", "Bạn giới thiệu cà phê nào?"], ["local", "Try iced coffee with condensed milk.", "Bạn thử cà phê đá với sữa đặc nhé."], ["traveler", "Great. One cup, please.", "Được. Cho tôi một ly."]]),
      dialogue("cafe-preferences", "Adjusting a drink", "Ask for less sugar or more ice.", [["traveler", "Could I have less sweet and extra ice?", "Cho tôi ít ngọt và thêm đá được không?"], ["local", "Sure. Would you like a straw?", "Được. Bạn có muốn ống hút không?"], ["traveler", "Yes, thank you.", "Có, cảm ơn."]]),
      dialogue("cafe-meeting", "Working at a café", "Arrange a meeting and ask about Wi-Fi.", [["traveler", "Is there Wi-Fi and a quiet table?", "Có Wi-Fi và bàn yên tĩnh không?"], ["local", "The password is on the wall.", "Mật khẩu ở trên tường."], ["traveler", "I will work here for an hour.", "Tôi sẽ làm việc ở đây một giờ."]])
    ]
  },
  {
    id: "work-study",
    title: "Work & Study",
    shortTitle: "Work & Study",
    description: "Introduce your work or studies, arrange tasks, and clarify what happens next.",
    category: "explore",
    domain: [
      v("work", "công việc", "gome vyek"), v("job", "việc làm", "vyek lahm"), v("office", "văn phòng", "vun fome"), v("school", "trường học", "choong hawk"),
      v("university", "trường đại học", "choong die hawk"), v("teacher", "giáo viên", "zow vyen"), v("student", "học sinh", "hawk sing"), v("colleague", "đồng nghiệp", "dome nyep"),
      v("manager", "quản lý", "kwun lee"), v("meeting", "cuộc họp", "kook hope"), v("schedule", "lịch trình", "lik ching"), v("task", "nhiệm vụ", "nyem voo"),
      v("project", "dự án", "zoo an"), v("deadline", "hạn chót", "hun chote"), v("document", "tài liệu", "tie lee-oo"), v("email", "thư điện tử", "too deen too"),
      v("example", "ví dụ", "vee zoo"), v("question", "câu hỏi", "kow hoy"), v("answer", "câu trả lời", "kow chah loy"), v("explain", "giải thích", "zye tik", "verb"),
      v("understand", "hiểu", "hyew", "verb"), v("agree", "đồng ý", "dome ee", "verb"), v("finish", "hoàn thành", "hwan tang", "verb"), v("follow up", "liên hệ lại", "lyen hay lie", "verb")
    ],
    dialogues: [
      dialogue("work-introduce", "Introducing yourself", "Say what you do.", [["traveler", "I work in technology.", "Tôi làm việc trong ngành công nghệ."], ["local", "Where is your office?", "Văn phòng của bạn ở đâu?"], ["traveler", "It is in Singapore.", "Ở Singapore."]]),
      dialogue("work-schedule", "Arranging a task", "Confirm a meeting and deadline.", [["traveler", "When is the meeting?", "Cuộc họp vào khi nào?"], ["local", "Tomorrow at nine in the morning.", "Ngày mai lúc chín giờ sáng."], ["traveler", "When is the deadline?", "Hạn chót là khi nào?"]]),
      dialogue("work-clarify", "Clarifying", "Ask for an example and confirm next steps.", [["traveler", "I do not understand this part.", "Tôi không hiểu phần này."], ["local", "I will explain with an example.", "Tôi sẽ giải thích bằng một ví dụ."], ["traveler", "Thank you. I will follow up by email.", "Cảm ơn. Tôi sẽ liên hệ lại qua email."]])
    ]
  },
  {
    id: "sightseeing-culture",
    title: "Sightseeing & Local Culture",
    shortTitle: "Sightseeing",
    description: "Visit attractions respectfully, buy tickets, ask permission, and share experiences.",
    category: "explore",
    domain: [
      v("sightseeing", "tham quan", "tum kwan"), v("attraction", "điểm tham quan", "dee-um tum kwan"), v("museum", "bảo tàng", "bow tang"), v("temple", "đền", "den"),
      v("pagoda", "chùa", "choo-ah"), v("old quarter", "phố cổ", "foh go"), v("beach", "bãi biển", "buy byen"), v("mountain", "núi", "noo-ee"),
      v("lake", "hồ", "hoh"), v("ticket booth", "quầy vé", "kway vay"), v("entrance fee", "phí vào cửa", "fee vow koo-uh"), v("opening hours", "giờ mở cửa", "zuh muh koo-uh"),
      v("closed day", "ngày nghỉ", "ngai ngee"), v("guide", "hướng dẫn viên", "hoo-uhng zun vyen"), v("tour", "chuyến tham quan", "chwen tum kwan"), v("traditional", "truyền thống", "chwen thone", "adjective"),
      v("custom", "phong tục", "fome took"), v("respect", "tôn trọng", "tone chome", "verb"), v("shoes", "giày", "zye"), v("quiet", "yên lặng", "yen lang", "adjective"),
      v("photo", "ảnh", "ung"), v("permission", "sự cho phép", "soo chaw fep"), v("souvenir", "quà lưu niệm", "kwah loo nyem"), v("memory", "kỷ niệm", "kee nyem")
    ],
    dialogues: [
      dialogue("culture-tickets", "Visiting a place", "Ask about tickets and hours.", [["traveler", "How much is the entrance fee?", "Phí vào cửa bao nhiêu tiền?"], ["local", "It is one hundred thousand dong.", "Một trăm nghìn đồng."], ["traveler", "What time do you close?", "Mấy giờ đóng cửa?"]]),
      dialogue("culture-respect", "A respectful visit", "Follow local customs.", [["local", "Please remove your shoes here.", "Vui lòng cởi giày ở đây."], ["traveler", "May I take a photo?", "Tôi có thể chụp ảnh không?"], ["local", "Yes, but please be quiet.", "Được, nhưng vui lòng giữ im lặng."]]),
      dialogue("culture-memories", "Sharing a memory", "Talk about a place and a souvenir.", [["traveler", "This place is beautiful.", "Nơi này rất đẹp."], ["local", "Would you like a local souvenir?", "Bạn có muốn mua quà lưu niệm địa phương không?"], ["traveler", "Yes. I want something for my family.", "Có. Tôi muốn mua gì đó cho gia đình."]])
    ]
  }
];

export const vietnameseTopics = seeds.map(buildTopic);
