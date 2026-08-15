import type { Topic, VocabularyEntry } from "../types";

export interface VocabularyDefinitions {
  japanese: string;
  english: string;
}

const japaneseSceneContexts: Record<string, string> = {
  "greetings-small-talk:meet-introduce": "初対面で自分や相手について話す",
  "greetings-small-talk:small-talk": "日常会話を続けたり、人を誘ったりする",
  "greetings-small-talk:contact-partings": "連絡や別れのあいさつをする",
  "numbers-dates-time:numbers-money": "数、金額、量を伝える",
  "numbers-dates-time:dates-counters": "日付や物の数を伝える",
  "numbers-dates-time:times-schedules": "時刻、予定、時間の長さを話す",
  "airports-flights:checkin-border": "空港で搭乗手続きや入国手続きをする",
  "airports-flights:security-boarding": "空港の保安検査や搭乗について話す",
  "airports-flights:connections-delays": "乗り継ぎ、遅れ、到着の問題に対応する",
  "directions-navigation:places-landmarks": "場所や目印を説明する",
  "directions-navigation:follow-route": "道を尋ねたり、道順を説明したりする",
  "directions-navigation:maps-accessibility": "地図、住所、移動しやすい道について話す",
  "trains-stations:tickets-gates": "駅で切符や改札について話す",
  "trains-stations:platforms-transfers": "ホーム、路線、乗り換えを確認する",
  "trains-stations:seats-disruptions": "座席、荷物、運行の問題に対応する",
  "buses-terminals:routes-terminals": "バスの路線、停留所、乗り場を探す",
  "buses-terminals:boarding-payment": "バスに乗り、運賃を支払い、降車を知らせる",
  "buses-terminals:express-disruptions": "高速バス、荷物、運行の問題に対応する",
  "hotels:reservation-checkin": "宿泊を予約し、チェックインする",
  "hotels:room-services": "客室、設備、ホテルの問題について話す",
  "hotels:ryokan-checkout": "旅館、入浴、チェックアウトについて話す",
  "restaurants-food:enter-menu": "飲食店に入り、席やメニューを確認する",
  "restaurants-food:order-adjust": "料理や飲み物を注文し、変更を頼む",
  "restaurants-food:payment-rules": "会計、持ち帰り、店のルールについて話す",
  "shopping-payments:products-stock": "商品、サイズ、在庫を探す",
  "shopping-payments:prices-payment": "値段や支払い方法を確認する",
  "shopping-payments:returns-delivery": "免税、返品、交換、配送について話す",
  "cleaning-laundry-hygiene:laundry-controls": "洗濯や洗濯機の操作について話す",
  "cleaning-laundry-hygiene:bathing-hygiene": "入浴や毎日の衛生について話す",
  "cleaning-laundry-hygiene:cleaning-waste": "掃除やごみの分別について話す",
  "food-allergies:allergies-restrictions": "アレルギーや食事制限を伝える",
  "food-allergies:ingredients-cross-contact": "材料や調理中の混入を確認する",
  "food-allergies:reaction-help": "アレルギー症状を伝え、助けを求める",
  "weather:everyday-forecast": "毎日の天気予報について話す",
  "weather:seasonal-planning": "季節の天気に合わせて準備する",
  "weather:severe-warnings": "悪天候の警報や避難情報を理解する",
  "emergencies-help:medical-help": "病気やけがを伝え、医療の助けを求める",
  "emergencies-help:police-loss": "警察、盗難、紛失について話す",
  "emergencies-help:disaster-evacuation": "災害情報を理解し、安全な場所へ避難する",
  "photography-cameras:equipment-types": "カメラや撮影機材について話す",
  "photography-cameras:exposure-focus": "露出、ピント、撮影設定について話す",
  "photography-cameras:permission-troubleshooting": "撮影許可を尋ね、機材の問題に対応する",
  "aircraft-jsdf:types-roles": "航空機の種類や役割を説明する",
  "aircraft-jsdf:parts-systems": "機体の部分や装置を説明する",
  "aircraft-jsdf:jsdf-recognition": "日本の自衛隊機や標識を見分ける",
  "air-bases-shows-jsdf:entry-logistics": "航空祭の入場、検査、会場設備について話す",
  "air-bases-shows-jsdf:aircraft-viewing": "航空祭の展示、飛行予定、観覧について話す",
  "air-bases-shows-jsdf:photography-safety": "航空祭で撮影ルールや安全案内に従う"
};

const japanesePartOfSpeech: Record<string, string> = {
  noun: "名詞",
  verb: "動詞",
  adjective: "形容詞",
  adverb: "副詞",
  phrase: "表現",
  counter: "助数詞"
};

const englishPartOfSpeech: Record<string, string> = {
  noun: "noun",
  verb: "verb",
  adjective: "adjective",
  adverb: "adverb",
  phrase: "expression",
  counter: "counter"
};

export function definitionsForVocabulary(topic: Topic | undefined, entry: VocabularyEntry): VocabularyDefinitions {
  const scene = topic?.scenes.find((candidate) => candidate.id === entry.primarySceneId);
  const context = topic ? japaneseSceneContexts[`${topic.id}:${entry.primarySceneId}`] ?? "この場面について話す" : "よくある場面で意思を伝える";
  const japanese = entry.partOfSpeech === "counter"
    ? `数や量を数えるときに使う${japanesePartOfSpeech.counter}。`
    : `${context}ときに使う${japanesePartOfSpeech[entry.partOfSpeech] ?? "表現"}。`;
  const englishContext = scene ? `the “${scene.title}” situation` : topic ? `the “${topic.title}” topic` : "common travel interactions";
  return {
    japanese,
    english: `The Japanese ${englishPartOfSpeech[entry.partOfSpeech] ?? "expression"} for “${entry.meanings.join(" / ")},” used in ${englishContext}.`
  };
}

export function hasJapaneseDefinitionContext(topicId: string, sceneId: string) {
  return Boolean(japaneseSceneContexts[`${topicId}:${sceneId}`]);
}
