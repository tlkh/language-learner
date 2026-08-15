import type { CharacterCollection, CharacterCourse, CharacterGroup, CharacterItem, CharacterSection } from "../types";

type RawUnit = readonly [glyph: string, reading: string, aliases?: readonly string[]];
type RawGroup = readonly [id: string, title: string, units: readonly RawUnit[]];

const vowels: readonly RawGroup[] = [
  ["a", "A", [["a", "a"], ["ă", "ă / short a"], ["â", "â / central a"]]],
  ["e", "E", [["e", "e"], ["ê", "ê"]]],
  ["i", "I", [["i", "i"]]],
  ["o", "O", [["o", "o"], ["ô", "ô"], ["ơ", "ơ"]]],
  ["u", "U", [["u", "u"], ["ư", "ư"]]],
  ["y", "Y", [["y", "y"]]]
];

const consonants: readonly RawGroup[] = [
  ["b-c", "B–C", [["b", "b"], ["c", "c"]]],
  ["d-d", "D–Đ", [["d", "d"], ["đ", "đ"]]],
  ["g-h", "G–H", [["g", "g"], ["h", "h"]]],
  ["k-l", "K–L", [["k", "k"], ["l", "l"]]],
  ["m-n", "M–N", [["m", "m"], ["n", "n"]]],
  ["p-q", "P–Q", [["p", "p"], ["q", "q"]]],
  ["r-s", "R–S", [["r", "r"], ["s", "s"]]],
  ["t-v", "T–V", [["t", "t"], ["v", "v"]]],
  ["x", "X", [["x", "x"]]]
];

const toneMarks: readonly RawGroup[] = [
  ["tone-examples", "Tone-mark examples", [
    ["á", "acute / sắc"], ["à", "grave / huyền"], ["ả", "hook above / hỏi"], ["ã", "tilde / ngã"], ["ạ", "dot below / nặng"]
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
  title: "Tone marks",
  description: "Recognize the five written tone marks used alongside the level tone.",
  sections: [{
    id: "tones-marks",
    title: "Five tone marks",
    description: "Tone marks are part of Vietnamese spelling and should be kept when writing.",
    groups: buildGroups("tones", "marks", toneMarks)
  }]
};

export const vietnameseCharacterCourse: CharacterCourse = {
  id: "vietnamese-writing",
  title: "Alphabet & tones",
  navLabel: "Alphabet",
  description: "Learn the Vietnamese alphabet and recognize the tone marks that carry meaning.",
  collections: [alphabet, tones],
  items,
  drillModes: [{
    id: "recognition",
    title: "Read the letter",
    description: "Type the letter name or tone-mark reading.",
    promptRepresentationId: "glyph",
    answerRepresentationId: "reading",
    answerLabel: "Letter or tone reading",
    answerPlaceholder: "Type the reading"
  }],
  defaultDrillModeId: "recognition",
  sessionSizes: [10, 20, "all"]
};
