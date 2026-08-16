import type { CharacterCollection, CharacterCourse, CharacterGroup, CharacterItem, CharacterSection } from "../types";

type RawUnit = readonly [glyph: string, reading: string, aliases?: readonly string[]];
type RawGroup = readonly [id: string, title: string, units: readonly RawUnit[]];

const alphabetPronunciationHints: Record<string, string> = {
  a: "ah, as in father, held longer",
  "ă": "short ah, as in father but clipped",
  "â": "uh, as in about",
  e: "e, as in bed",
  "ê": "ay, as in say, without the final y glide",
  i: "ee, as in see",
  o: "aw, as in law",
  "ô": "oh, as in go, without the final w glide",
  "ơ": "uh, as in fur without an r sound, held longer",
  u: "oo, as in food",
  "ư": "oo made with relaxed, unrounded lips",
  y: "ee, as in see",
  b: "b, as in boy, with a slight inward catch",
  c: "k, as in skin",
  d: "z, as in zoo (North); y, as in yes (South)",
  "đ": "d, as in day, with a slight inward catch",
  g: "a soft, raspy g made at the back of the throat",
  h: "h, as in hat",
  k: "k, as in skin",
  l: "l, as in lamp",
  m: "m, as in man",
  n: "n, as in no",
  p: "p, as in spin; mainly final or in loanwords",
  q: "k; usually part of qu, like kw in quick",
  r: "z, as in zoo (North); a rolled r (South)",
  s: "s, as in sun (North); sh-like with the tongue curled back (South)",
  t: "t, as in stop",
  v: "v, as in very",
  x: "s, as in sun"
};

const toneContours: Record<string, string> = {
  ngang: "mid and level",
  "sắc": "rising",
  "huyền": "low and falling",
  "hỏi": "dipping",
  "ngã": "broken and rising",
  "nặng": "low and constricted"
};

const combinedPronunciationHints: Record<string, string> = {
  ch: "ch-like at the start; k, as in back, at the end",
  gh: "a soft, raspy g made at the back of the throat",
  gi: "z, as in zoo (North); y, as in yes (South)",
  kh: "a raspy h, like ch in Scottish loch",
  ng: "ng, as in sing",
  ngh: "ng, as in sing",
  nh: "ny, as in canyon, at the start; ng, as in sing, at the end",
  ph: "f, as in fan",
  qu: "kw, as in quick",
  th: "t, as in top, with a strong puff of air",
  tr: "ch-like (North); tr with the tongue curled back (South)"
};

const referenceDetails = (collectionId: string, glyph: string, reading: string) => {
  if (collectionId === "alphabet") return [
    { label: "Letter name", value: reading },
    { label: "Pronunciation hint", value: alphabetPronunciationHints[glyph] }
  ];
  if (collectionId === "tones") return [
    { label: "Tone name", value: reading },
    { label: "Typical contour", value: toneContours[reading] }
  ];
  return [
    { label: "Example word", value: reading },
    { label: "Pronunciation hint", value: combinedPronunciationHints[glyph] }
  ];
};

const vowels: readonly RawGroup[] = [
  ["a", "A", [["a", "a"], ["ă", "a", ["á", "ă"]], ["â", "o", ["ớ", "â"]]]],
  ["e", "E", [["e", "e"], ["ê", "e", ["ê"]]]],
  ["i", "I", [["i", "i"]]],
  ["o", "O", [["o", "o"], ["ô", "o", ["ô"]], ["ơ", "o", ["ơ"]]]],
  ["u", "U", [["u", "u"], ["ư", "u", ["ư"]]]],
  ["y", "Y", [["y", "i dai", ["i dài", "y"]]]]
];

const consonants: readonly RawGroup[] = [
  ["b-c", "B–C", [["b", "be", ["bê", "b"]], ["c", "xe", ["xê", "c"]]]],
  ["d-d", "D–Đ", [["d", "de", ["dê", "d"]], ["đ", "de", ["đê", "đ"]]]],
  ["g-h", "G–H", [["g", "gie", ["giê", "g"]], ["h", "hat", ["hát", "h"]]]],
  ["k-l", "K–L", [["k", "ca", ["ka", "k"]], ["l", "e-lo", ["e-lờ", "l"]]]],
  ["m-n", "M–N", [["m", "em-mo", ["em-mờ", "m"]], ["n", "en-no", ["en-nờ", "n"]]]],
  ["p-q", "P–Q", [["p", "pe", ["pê", "p"]], ["q", "quy", ["qu", "q"]]]],
  ["r-s", "R–S", [["r", "e-ro", ["e-rờ", "r"]], ["s", "et-si", ["ét-sì", "s"]]]],
  ["t-v", "T–V", [["t", "te", ["tê", "t"]], ["v", "ve", ["vê", "v"]]]],
  ["x", "X", [["x", "ich-xi", ["ích-xì", "x"]]]]
];

const toneMarks: readonly RawGroup[] = [
  ["tone-examples", "Six tones on a", [
    ["a", "ngang", ["level", "level / ngang"]],
    ["á", "sắc", ["acute", "acute / sắc"]],
    ["à", "huyền", ["grave", "grave / huyền"]],
    ["ả", "hỏi", ["hook above", "hook above / hỏi"]],
    ["ã", "ngã", ["tilde", "tilde / ngã"]],
    ["ạ", "nặng", ["dot below", "dot below / nặng"]]
  ]]
];

const combinedConsonants: readonly RawGroup[] = [
  ["common", "Common consonant units and example words", [
    ["ch", "chào"], ["gh", "ghế"], ["gi", "giờ"], ["kh", "không"],
    ["ng", "ngon"], ["ngh", "nghề"], ["nh", "nhà"], ["ph", "phở"],
    ["qu", "quá"], ["th", "thích"], ["tr", "trời"]
  ]]
];

const items: CharacterItem[] = [];

function buildGroups(collectionId: string, sectionId: string, groups: readonly RawGroup[]): CharacterGroup[] {
  return groups.map(([groupId, title, units]) => {
    const itemIds = units.map(([glyph, reading, aliases], index) => {
      const id = `${collectionId}-${sectionId}-${groupId}-${index + 1}`;
      items.push({
        id,
        representations: { glyph, reading },
        aliases: aliases?.length ? { reading: [...aliases] } : undefined,
        referenceDetails: referenceDetails(collectionId, glyph, reading)
      });
      return id;
    });
    return { id: `${collectionId}-${sectionId}-${groupId}`, title, itemIds };
  });
}

const alphabet: CharacterCollection = {
  id: "alphabet",
  title: "Vietnamese alphabet",
  description: "Learn the 29 letters used in Vietnamese spelling, including ă, â, ê, ô, ơ, ư, and đ.",
  sections: [
    {
      id: "alphabet-vowels",
      title: "Vowels",
      description: "Vietnamese vowels and the diacritics that distinguish their sounds.",
      groups: buildGroups("alphabet", "vowels", vowels)
    },
    {
      id: "alphabet-consonants",
      title: "Consonants",
      description: "The Vietnamese consonant letters.",
      groups: buildGroups("alphabet", "consonants", consonants)
    }
  ]
};

const tones: CharacterCollection = {
  id: "tones",
  title: "Six tones",
  description: "Recognize all six tones: the unmarked level tone and the five marked tones.",
  sections: [{
    id: "tones-marks",
    title: "Tone names and marks",
    description: "Ngang has no mark; sắc, huyền, hỏi, ngã, and nặng use marks that are part of spelling.",
    groups: buildGroups("tones", "marks", toneMarks)
  }]
};

const consonantUnits: CharacterCollection = {
  id: "combined-consonants",
  title: "Combined consonants",
  description: "Learn the common digraphs and the ngh trigraph used as consonant spelling units.",
  sections: [{
    id: "combined-consonants-main",
    title: "Digraphs and trigraph",
    description: "These units are important for both Vietnamese spelling and pronunciation.",
    groups: buildGroups("combined-consonants", "main", combinedConsonants)
  }]
};

export const vietnameseCharacterCourse: CharacterCourse = {
  id: "vietnamese-writing",
  title: "Alphabet & tones",
  navLabel: "Alphabet",
  description: "Learn the 29-letter alphabet, all six tones, and the common multi-letter consonant units.",
  collections: [alphabet, tones, consonantUnits],
  items,
  drillModes: [{
    id: "recognition",
    title: "Read the letter",
    description: "Type the Vietnamese letter or tone name, or the example word for a combined consonant.",
    promptRepresentationId: "glyph",
    answerRepresentationId: "reading",
    answerLabel: "Vietnamese name or example",
    answerPlaceholder: "Type the name or example"
  }],
  defaultDrillModeId: "recognition",
  sessionSizes: [10, 20, "all"]
};
