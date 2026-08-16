import type { Topic, VocabularyEntry } from "../types";

const vietnamesePartOfSpeech: Record<string, string> = {
  noun: "một danh từ",
  verb: "một động từ",
  adjective: "một tính từ",
  adverb: "một trạng từ",
  phrase: "một cụm từ",
  pronoun: "một đại từ",
  preposition: "một giới từ",
  number: "một từ chỉ số lượng",
  particle: "một tiểu từ"
};

const englishPartOfSpeech: Record<string, string> = {
  phrase: "expression",
  number: "number"
};

const vietnameseUsageByTopic: Record<string, string> = {
  "vietnamese-foundations": "xưng hô lịch sự và tạo câu tiếng Việt cơ bản",
  "greetings-small-talk": "chào hỏi, làm quen và trò chuyện xã giao",
  "numbers-dates-time": "nói về số lượng, ngày tháng và thời gian",
  "airports-flights": "làm thủ tục và di chuyển bằng máy bay",
  "directions-navigation": "hỏi đường và xác định phương hướng",
  "trains-stations": "đi tàu và sử dụng nhà ga",
  "buses-terminals": "đi xe buýt và sử dụng bến xe",
  hotels: "đặt phòng và lưu trú tại khách sạn",
  "restaurants-food": "gọi món và trao đổi về đồ ăn",
  "shopping-payments": "mua sắm và thanh toán",
  "cleaning-laundry-hygiene": "giặt giũ, vệ sinh và chăm sóc cá nhân",
  "food-allergies": "nói về dị ứng và yêu cầu an toàn thực phẩm",
  weather: "trao đổi về thời tiết và các cảnh báo",
  "emergencies-help": "yêu cầu trợ giúp trong tình huống khẩn cấp",
  "cafes-coffee": "gọi đồ uống và trò chuyện ở quán cà phê",
  "work-study": "trao đổi về công việc và học tập",
  "sightseeing-culture": "tham quan và tìm hiểu văn hóa địa phương"
};

const vietnameseUsageByScene: Record<string, string> = {
  "terms-of-address": "chọn cách xưng hô phù hợp với tuổi tác và mối quan hệ",
  "politeness-particles": "thể hiện sự lịch sự trong giao tiếp hằng ngày",
  "core-grammar": "tạo câu cơ bản về bản thân, thời gian, mong muốn và nhu cầu",
  "meet-introduce": "làm quen và giới thiệu bản thân",
  "small-talk": "trò chuyện xã giao và đưa ra lời mời",
  "contact-partings": "trao đổi thông tin liên lạc và chào tạm biệt",
  "numbers-money": "đếm, hỏi giá và xác nhận số lượng",
  "dates-counters": "nói về ngày tháng, lịch hẹn và tần suất",
  "times-schedules": "sắp xếp thời gian và nói về khoảng thời gian",
  "checkin-border": "làm thủ tục chuyến bay, hành lý và nhập cảnh",
  "security-boarding": "qua cửa an ninh, tìm cửa ra máy bay và lên máy bay",
  "connections-delays": "xử lý chuyến bay nối chuyến, chậm chuyến và thay đổi dịch vụ",
  "places-landmarks": "nhận biết địa điểm, công trình và vị trí",
  "follow-route": "hỏi và làm theo chỉ dẫn đường đi",
  "maps-accessibility": "dùng địa chỉ, bản đồ, taxi và lối đi thuận tiện",
  "tickets-gates": "mua vé tàu và tìm đúng sân ga",
  "routes-transfers": "chọn tuyến và chuyển tàu",
  "seats-disruptions": "đặt chỗ, sắp xếp hành lý và xử lý tàu chậm",
  "routes-terminals": "tìm đúng tuyến, trạm dừng và bến xe",
  "boarding-payment": "lên xe, trả tiền vé và yêu cầu dừng xe",
  "express-disruptions": "đi xe đường dài và xử lý thay đổi hành trình",
  "reservation-checkin": "đặt phòng và làm thủ tục nhận phòng",
  "room-services": "yêu cầu đồ dùng, tiện nghi hoặc sửa chữa trong phòng",
  checkout: "sử dụng tiện nghi, thanh toán và trả phòng",
  "enter-menu": "vào nhà hàng, chọn chỗ ngồi và xem thực đơn",
  "order-adjust": "gọi món và điều chỉnh món ăn theo nhu cầu",
  "payment-takeaway": "thanh toán và yêu cầu đóng gói đồ ăn mang đi",
  "products-stock": "tìm sản phẩm, chọn kích cỡ và hỏi hàng còn hay hết",
  "prices-payment": "hỏi giá, kiểm tra tổng tiền và chọn cách thanh toán",
  "returns-delivery": "đổi trả, hoàn tiền và yêu cầu giao hàng",
  "laundry-controls": "giặt, sấy và chăm sóc quần áo",
  "bathing-hygiene": "tắm rửa và chăm sóc vệ sinh cá nhân",
  "cleaning-waste": "dọn dẹp và phân loại rác sinh hoạt",
  "allergies-restrictions": "nói rõ dị ứng, chế độ ăn và mức độ nghiêm trọng",
  "ingredients-cross-contact": "hỏi về thành phần và nguy cơ lẫn chất gây dị ứng",
  "reaction-help": "mô tả phản ứng dị ứng và yêu cầu trợ giúp khẩn cấp",
  "everyday-forecast": "xem dự báo nhiệt độ, mưa và gió",
  "seasonal-planning": "chuẩn bị cho mùa, nắng nóng, mưa và bão",
  "severe-warnings": "hiểu cảnh báo thời tiết nguy hiểm và thay đổi kế hoạch",
  "medical-help": "gọi cấp cứu và mô tả triệu chứng hoặc bệnh trạng",
  "police-loss": "trình báo mất cắp, tai nạn hoặc thất lạc giấy tờ",
  "disaster-evacuation": "làm theo cảnh báo, sơ tán và tìm nơi trú ẩn",
  "find-cafe": "tìm quán cà phê, chọn chỗ và gọi đồ uống",
  "coffee-preferences": "nói về loại cà phê, độ ngọt, sữa, đá và kích cỡ",
  "meet-work-cafe": "hẹn gặp, làm việc và thanh toán ở quán cà phê",
  "introduce-work": "giới thiệu công việc, nơi học và nhu cầu của bản thân",
  "schedule-tasks": "sắp xếp cuộc họp, thời hạn và nhiệm vụ",
  collaboration: "phối hợp, yêu cầu làm rõ và xác nhận cách hiểu",
  "places-tickets": "chọn điểm tham quan, mua vé và hỏi giờ mở cửa",
  "customs-respect": "tuân thủ phong tục khi đến nơi thờ tự, nhà riêng và nơi công cộng",
  "photos-memories": "xin phép chụp ảnh và chia sẻ trải nghiệm"
};

export function definitionsForVocabulary(topic: Topic | undefined, entry: VocabularyEntry) {
  const scene = topic?.scenes.find((candidate) => candidate.id === entry.primarySceneId);
  const targetContext = vietnameseUsageByScene[entry.primarySceneId]
    ?? vietnameseUsageByTopic[topic?.id ?? entry.topicId]
    ?? "giao tiếp trong những tình huống thường ngày";
  const sourceContext = scene?.title ?? topic?.title;
  const partOfSpeech = englishPartOfSpeech[entry.partOfSpeech] ?? entry.partOfSpeech;
  return {
    target: `Đây là ${vietnamesePartOfSpeech[entry.partOfSpeech] ?? "một cách diễn đạt"} trong tiếng Việt, thường dùng khi ${targetContext}.`,
    source: sourceContext
      ? `A Vietnamese ${partOfSpeech} meaning “${entry.meanings.join(" / ")},” used in “${sourceContext}.”`
      : `A Vietnamese ${partOfSpeech} meaning “${entry.meanings.join(" / ")},” used in common travel situations.`
  };
}
