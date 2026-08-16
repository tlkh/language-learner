import type { CharacterCollection, CharacterCourse, CharacterGroup, CharacterItem } from "../types";

type RawUnit = readonly [glyph: string, reading: string, aliases?: readonly string[]];
type RawGroup = readonly [id: string, title: string, units: readonly RawUnit[]];

const consonantSoundHints: Record<string, readonly [initial: string, final: string]> = {
  "ก": ["k, as in skate, with little puff of air", "a clipped k, as at the end of back"],
  "ข": ["k, as in key, with a strong puff of air", "a clipped k, as at the end of back"],
  "ฃ": ["k, as in key, with a strong puff of air", "not used at the end of a syllable"],
  "ค": ["k, as in key, with a strong puff of air", "a clipped k, as at the end of back"],
  "ฅ": ["k, as in key, with a strong puff of air", "not used at the end of a syllable"],
  "ฆ": ["k, as in key, with a strong puff of air", "a clipped k, as at the end of back"],
  "ง": ["ng, as in sing", "ng, as in sing"],
  "จ": ["ch, as in chair, with little puff of air", "a clipped t, as at the end of cat"],
  "ฉ": ["ch, as in chair, with a strong puff of air", "not used at the end of a syllable"],
  "ช": ["ch, as in chair, with a strong puff of air", "a clipped t, as at the end of cat"],
  "ซ": ["s, as in sun", "a clipped t, as at the end of cat"],
  "ฌ": ["ch, as in chair, with a strong puff of air", "a clipped t, as at the end of cat"],
  "ญ": ["y, as in yes", "n, as in no"],
  "ฎ": ["d, as in dog", "a clipped t, as at the end of cat"],
  "ฏ": ["t, as in stop, with little puff of air", "a clipped t, as at the end of cat"],
  "ฐ": ["t, as in top, with a strong puff of air; not English th", "a clipped t, as at the end of cat"],
  "ฑ": ["t, as in top, with a strong puff of air, or d, as in dog", "a clipped t, as at the end of cat"],
  "ฒ": ["t, as in top, with a strong puff of air; not English th", "a clipped t, as at the end of cat"],
  "ณ": ["n, as in no", "n, as in no"],
  "ด": ["d, as in dog", "a clipped t, as at the end of cat"],
  "ต": ["t, as in stop, with little puff of air", "a clipped t, as at the end of cat"],
  "ถ": ["t, as in top, with a strong puff of air; not English th", "a clipped t, as at the end of cat"],
  "ท": ["t, as in top, with a strong puff of air; not English th", "a clipped t, as at the end of cat"],
  "ธ": ["t, as in top, with a strong puff of air; not English th", "a clipped t, as at the end of cat"],
  "น": ["n, as in no", "n, as in no"],
  "บ": ["b, as in boy", "a clipped p, as at the end of cap"],
  "ป": ["p, as in spin, with little puff of air", "a clipped p, as at the end of cap"],
  "ผ": ["p, as in pie, with a strong puff of air; not f", "not used at the end of a syllable"],
  "ฝ": ["f, as in fan", "not used at the end of a syllable"],
  "พ": ["p, as in pie, with a strong puff of air; not f", "a clipped p, as at the end of cap"],
  "ฟ": ["f, as in fan", "a clipped p, as at the end of cap"],
  "ภ": ["p, as in pie, with a strong puff of air; not f", "a clipped p, as at the end of cap"],
  "ม": ["m, as in man", "m, as in man"],
  "ย": ["y, as in yes", "a y glide, as at the end of day"],
  "ร": ["a quick tapped or lightly rolled r", "n, as in no"],
  "ล": ["l, as in lamp", "n, as in no; sometimes a w glide"],
  "ว": ["w, as in win", "a w glide, as at the end of cow"],
  "ศ": ["s, as in sun", "a clipped t, as at the end of cat"],
  "ษ": ["s, as in sun", "a clipped t, as at the end of cat"],
  "ส": ["s, as in sun", "a clipped t, as at the end of cat"],
  "ห": ["h, as in hat", "not used at the end of a syllable"],
  "ฬ": ["l, as in lamp", "n, as in no"],
  "อ": ["a light catch, as in uh-oh; otherwise it carries a vowel", "not used at the end of a syllable"],
  "ฮ": ["h, as in hat", "not used at the end of a syllable"]
};

const vowelPronunciationHints: Record<string, string> = {
  "อะ": "short ah, as in father but clipped",
  "อา": "long ah, as in father",
  "อิ": "short ee, as in see but clipped",
  "อี": "long ee, as in see",
  "อึ": "short unrounded oo; say oo with relaxed, spread lips",
  "อือ": "long unrounded oo; say oo with relaxed, spread lips",
  "อุ": "short oo, as in food but clipped",
  "อู": "long oo, as in food",
  "เอะ": "short ay, as in say, without the final y glide",
  "เอ": "long ay, as in say, without the final y glide",
  "แอะ": "short e, as in bed",
  "แอ": "long e, as in bed",
  "โอะ": "short oh, as in go, without the final w glide",
  "โอ": "long oh, as in go, without the final w glide",
  "เอาะ": "short aw, as in law",
  "ออ": "long aw, as in law",
  "เออะ": "short uh, as in fur without an r sound",
  "เออ": "long uh, as in fur without an r sound",
  "เอียะ": "short ee-ah, run together",
  "เอีย": "long ee-ah, run together",
  "เอือะ": "short unrounded oo-ah, run together",
  "เอือ": "long unrounded oo-ah, run together",
  "อัวะ": "short oo-ah, run together",
  "อัว": "long oo-ah, run together",
  "ไอ": "eye",
  "ใอ": "eye",
  "เอา": "ow, as in cow",
  "อำ": "ahm, as in balm",
  "ฤ": "short rue: r followed by an unrounded oo",
  "ฤๅ": "long rue: r followed by an unrounded oo",
  "ฦ": "short lue: l followed by an unrounded oo",
  "ฦๅ": "long lue: l followed by an unrounded oo"
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
    const [initial, final] = consonantSoundHints[glyph];
    return [
      { label: "Letter name", value: reading },
      { label: "Initial sound hint", value: initial },
      { label: "Final sound hint", value: final }
    ];
  }
  if (collectionId === "vowels") {
    return [{ label: "Pronunciation hint", value: vowelPronunciationHints[glyph] }];
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
