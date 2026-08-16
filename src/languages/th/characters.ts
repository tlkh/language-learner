import type { CharacterCollection, CharacterCourse, CharacterGroup, CharacterItem } from "../types";

type RawUnit = readonly [glyph: string, reading: string, aliases?: readonly string[]];
type RawGroup = readonly [id: string, title: string, units: readonly RawUnit[]];

const consonantSounds: Record<string, readonly [initial: string, final: string]> = {
  "ก": ["k · /k/", "k · /k/"], "ข": ["kh · /kʰ/", "k · /k/"], "ฃ": ["kh · /kʰ/", "—"],
  "ค": ["kh · /kʰ/", "k · /k/"], "ฅ": ["kh · /kʰ/", "—"], "ฆ": ["kh · /kʰ/", "k · /k/"],
  "ง": ["ng · /ŋ/", "ng · /ŋ/"], "จ": ["ch · /tɕ/", "t · /t/"], "ฉ": ["ch · /tɕʰ/", "—"],
  "ช": ["ch · /tɕʰ/", "t · /t/"], "ซ": ["s · /s/", "t · /t/"], "ฌ": ["ch · /tɕʰ/", "t · /t/"],
  "ญ": ["y · /j/", "n · /n/"], "ฎ": ["d · /d/", "t · /t/"], "ฏ": ["t · /t/", "t · /t/"],
  "ฐ": ["th · /tʰ/", "t · /t/"], "ฑ": ["th /tʰ/ or d /d/", "t · /t/"], "ฒ": ["th · /tʰ/", "t · /t/"],
  "ณ": ["n · /n/", "n · /n/"], "ด": ["d · /d/", "t · /t/"], "ต": ["t · /t/", "t · /t/"],
  "ถ": ["th · /tʰ/", "t · /t/"], "ท": ["th · /tʰ/", "t · /t/"], "ธ": ["th · /tʰ/", "t · /t/"],
  "น": ["n · /n/", "n · /n/"], "บ": ["b · /b/", "p · /p/"], "ป": ["p · /p/", "p · /p/"],
  "ผ": ["ph · /pʰ/", "—"], "ฝ": ["f · /f/", "—"], "พ": ["ph · /pʰ/", "p · /p/"],
  "ฟ": ["f · /f/", "p · /p/"], "ภ": ["ph · /pʰ/", "p · /p/"], "ม": ["m · /m/", "m · /m/"],
  "ย": ["y · /j/", "y glide · /j/"], "ร": ["r · /r/", "n · /n/"], "ล": ["l · /l/", "n /n/ (sometimes w /w/)"],
  "ว": ["w · /w/", "w glide · /w/"], "ศ": ["s · /s/", "t · /t/"], "ษ": ["s · /s/", "t · /t/"],
  "ส": ["s · /s/", "t · /t/"], "ห": ["h · /h/", "—"], "ฬ": ["l · /l/", "n · /n/"],
  "อ": ["vowel carrier; glottal onset /ʔ/", "—"], "ฮ": ["h · /h/", "—"]
};

const consonants: readonly RawGroup[] = [
  ["ko", "ก ไก่", [["ก", "ko kai"]]], ["kho", "ข–ฃ–ค–ฅ–ฆ", [["ข", "kho khai"], ["ฃ", "kho khuat", ["obsolete"]], ["ค", "kho khwai"], ["ฅ", "kho khon", ["obsolete"]], ["ฆ", "kho rakhang"]]],
  ["ngo", "ง–จ", [["ง", "ngo ngu"], ["จ", "cho chan"]]], ["cho", "ฉ–ช–ซ–ฌ", [["ฉ", "cho ching"], ["ช", "cho chang"], ["ซ", "so so"], ["ฌ", "cho choe"]]],
  ["yo", "ญ–ฎ–ฏ", [["ญ", "yo ying"], ["ฎ", "do chada"], ["ฏ", "to patak"]]], ["tho", "ฐ–ฑ–ฒ", [["ฐ", "tho than"], ["ฑ", "tho montho"], ["ฒ", "tho phu thao"]]],
  ["no", "ณ–ด–ต", [["ณ", "no nen"], ["ด", "do dek"], ["ต", "to tao"]]], ["tho2", "ถ–ท–ธ", [["ถ", "tho thung"], ["ท", "tho thahan"], ["ธ", "tho thong"]]],
  ["no2", "น–บ–ป", [["น", "no nu"], ["บ", "bo baimai"], ["ป", "po pla"]]], ["pho", "ผ–ฝ–พ–ฟ–ภ", [["ผ", "pho phueng"], ["ฝ", "fo fa"], ["พ", "pho phan"], ["ฟ", "fo fan"], ["ภ", "pho samphao"]]],
  ["mo", "ม–ย–ร–ล", [["ม", "mo ma"], ["ย", "yo yak"], ["ร", "ro ruea"], ["ล", "lo ling"]]], ["wo", "ว–ศ–ษ–ส", [["ว", "wo waen"], ["ศ", "so sala"], ["ษ", "so ruesi"], ["ส", "so suea"]]],
  ["ho", "ห–ฬ–อ–ฮ", [["ห", "ho hip"], ["ฬ", "lo chula"], ["อ", "o ang"], ["ฮ", "ho nokhuk"]]]
];

const vowels: readonly RawGroup[] = [
  ["short", "Short vowels", [["อะ", "a"], ["อิ", "i"], ["อึ", "ue"], ["อุ", "u"], ["เอะ", "e"], ["แอะ", "ae"], ["โอะ", "o"], ["เอาะ", "aw"], ["เออะ", "oe"]]],
  ["long", "Long vowels", [["อา", "aa"], ["อี", "ii"], ["อือ", "uee"], ["อู", "uu"], ["เอ", "e:"], ["แอ", "ae:"], ["โอ", "o:"], ["ออ", "aw:"], ["เออ", "oe:"]]],
  ["diphthongs", "Diphthongs", [["เอียะ", "ia"], ["เอีย", "ia:"], ["เอือะ", "uea"], ["เอือ", "uea:"], ["อัวะ", "ua"], ["อัว", "ua:"], ["ไอ", "ai"], ["ใอ", "ai"], ["เอา", "ao"], ["อำ", "am"], ["ฤ", "rue"], ["ฤๅ", "rue:"], ["ฦ", "lue"], ["ฦๅ", "lue:"]]]
];

const toneMarks: readonly RawGroup[] = [
  ["marks", "Tone and vowel marks", [["อ่", "mai ek / low tone"], ["อ้", "mai tho / falling tone"], ["อ๊", "mai tri / high tone"], ["อ๋", "mai chattawa / rising tone"], ["อ็", "mai taikhuu / short vowel"]]]
];

const items: CharacterItem[] = [];

function referenceDetails(collectionId: string, groupId: string, glyph: string, reading: string) {
  if (collectionId === "consonants") {
    const [initial, final] = consonantSounds[glyph];
    return [
      { label: "Letter name", value: reading },
      { label: "Initial sound", value: initial },
      { label: "Final sound", value: final }
    ];
  }
  if (collectionId === "vowels") {
    const normalizedReading = reading.replace(/:$/, "");
    const duration = groupId === "short" ? "short" : groupId === "long" || reading.endsWith(":") ? "long" : undefined;
    return [{ label: "Pronunciation", value: duration ? `${normalizedReading} · ${duration}` : normalizedReading }];
  }
  const [markName, effect] = reading.split(" / ");
  return [{ label: "Mark name", value: markName }, { label: "Effect", value: effect }];
}

function buildGroups(collectionId: string, sectionId: string, groups: readonly RawGroup[]): CharacterGroup[] {
  return groups.map(([groupId, title, units]) => {
    const itemIds = units.map(([glyph, reading, aliases], index) => {
      const id = `${collectionId}-${sectionId}-${groupId}-${index + 1}`;
      items.push({
        id,
        representations: { glyph, reading },
        aliases: aliases?.length ? { reading: [...aliases] } : undefined,
        referenceDetails: referenceDetails(collectionId, groupId, glyph, reading)
      });
      return id;
    });
    return { id: `${collectionId}-${sectionId}-${groupId}`, title, itemIds };
  });
}

const consonantCollection: CharacterCollection = {
  id: "consonants",
  title: "Thai consonants",
  description: "Learn the 44 traditional Thai consonant letters and their mnemonic names.",
  sections: [{ id: "consonants-main", title: "Consonants", description: "The consonant letters used to build Thai syllables.", groups: buildGroups("consonants", "main", consonants) }]
};

const vowelCollection: CharacterCollection = {
  id: "vowels",
  title: "Thai vowels",
  description: "Recognize Thai vowel forms, including vowels written around a consonant placeholder.",
  sections: [{ id: "vowels-main", title: "Vowels", description: "Short, long, and combined vowel forms.", groups: buildGroups("vowels", "main", vowels) }]
};

const toneCollection: CharacterCollection = {
  id: "tone-marks",
  title: "Tone marks",
  description: "Learn the written marks that help distinguish Thai tones and vowel length.",
  sections: [{ id: "tone-marks-main", title: "Marks", description: "Thai tone marks and the short-vowel mark.", groups: buildGroups("tone-marks", "main", toneMarks) }]
};

export const thaiCharacterCourse: CharacterCourse = {
  id: "thai-writing",
  title: "Thai script",
  navLabel: "Thai script",
  description: "Learn Thai consonants, vowel forms, and tone marks as the building blocks of reading.",
  collections: [consonantCollection, vowelCollection, toneCollection],
  items,
  drillModes: [{
    id: "recognition",
    title: "Read the unit",
    description: "Type the consonant, vowel, or mark reading.",
    promptRepresentationId: "glyph",
    answerRepresentationId: "reading",
    answerLabel: "Thai reading",
    answerPlaceholder: "Type the reading"
  }],
  defaultDrillModeId: "recognition",
  sessionSizes: [10, 20, "all"]
};
