import type { CharacterCollection, CharacterCourse, CharacterGroup, CharacterItem, CharacterSection } from "../types";

type RawUnit = readonly [glyph: string, reading: string, aliases?: readonly string[]];
type RawGroup = readonly [id: string, title: string, units: readonly RawUnit[]];

const vowels: readonly RawGroup[] = [
  ["a", "A", [["a", "a"], ["ă", "ă"], ["â", "â"]]],
  ["e", "E", [["e", "e"], ["ê", "ê"]]],
  ["i", "I", [["i", "i"]]],
  ["o", "O", [["o", "o"], ["ô", "ô"], ["ơ", "ơ"]]],
  ["u", "U", [["u", "u"], ["ư", "ư"]]],
  ["y", "Y", [["y", "i dài", ["y"]]]]
];

const consonants: readonly RawGroup[] = [
  ["b-c", "B–C", [["b", "bê", ["b"]], ["c", "xê", ["c"]]]],
  ["d-d", "D–Đ", [["d", "dê", ["d"]], ["đ", "đê", ["đ"]]]],
  ["g-h", "G–H", [["g", "giê", ["g"]], ["h", "hát", ["h"]]]],
  ["k-l", "K–L", [["k", "ca", ["ka", "k"]], ["l", "e-lờ", ["l"]]]],
  ["m-n", "M–N", [["m", "em-mờ", ["m"]], ["n", "en-nờ", ["n"]]]],
  ["p-q", "P–Q", [["p", "pê", ["p"]], ["q", "quy", ["qu", "q"]]]],
  ["r-s", "R–S", [["r", "e-rờ", ["r"]], ["s", "ét-xì", ["s"]]]],
  ["t-v", "T–V", [["t", "tê", ["t"]], ["v", "vê", ["v"]]]],
  ["x", "X", [["x", "ích-xì", ["x"]]]]
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
        aliases: aliases?.length ? { reading: [...aliases] } : undefined
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
