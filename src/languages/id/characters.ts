import type { CharacterCollection, CharacterCourse, CharacterGroup, CharacterItem } from "../types";

type RawUnit = readonly [glyph: string, reading: string, aliases?: readonly string[]];
type RawGroup = readonly [id: string, title: string, units: readonly RawUnit[]];

const pronunciations: Record<string, string> = {
  a: "/a/", e: "/ə/, /e/, or /ɛ/", i: "/i/", o: "/o/ or /ɔ/", u: "/u/",
  b: "/b/", c: "/tʃ/", d: "/d/", f: "/f/", g: "/ɡ/", h: "/h/", j: "/dʒ/",
  k: "/k/", l: "/l/", m: "/m/", n: "/n/", p: "/p/", q: "/k/", r: "/r/",
  s: "/s/", t: "/t/", v: "/f/ or /v/ in loanwords", w: "/w/", x: "/ks/; often /s/ initially",
  y: "/j/", z: "/z/", ng: "/ŋ/", ny: "/ɲ/", kh: "/x/", sy: "/ʃ/"
};

const vowels: readonly RawGroup[] = [["vowels", "Vowels", [["a", "a"], ["e", "e"], ["i", "i"], ["o", "o"], ["u", "u"]]]];
const consonants: readonly RawGroup[] = [["b-c", "B–C", [["b", "be"], ["c", "ce"]]], ["d-f", "D–F", [["d", "de"], ["f", "ef"]]], ["g-j", "G–J", [["g", "ge"], ["h", "ha"], ["j", "je"]]], ["k-m", "K–M", [["k", "ka"], ["l", "el"], ["m", "em"]]], ["n-p", "N–P", [["n", "en"], ["p", "pe"]]], ["q-s", "Q–S", [["q", "ki"], ["r", "er"], ["s", "es"]]], ["t-w", "T–W", [["t", "te"], ["v", "ve"], ["w", "we"]]], ["x-z", "X–Z", [["x", "eks"], ["y", "ye"], ["z", "zet"]]]];
const digraphs: readonly RawGroup[] = [["common", "Common Indonesian digraphs", [["ng", "eng", ["ŋ"]], ["ny", "enye", ["ñ"]], ["kh", "kha"], ["sy", "sya"]]]];

const items: CharacterItem[] = [];
function buildGroups(collectionId: string, sectionId: string, groups: readonly RawGroup[]): CharacterGroup[] {
  return groups.map(([groupId, title, units]) => {
    const itemIds = units.map(([glyph, reading, aliases], index) => {
      const id = `${collectionId}-${sectionId}-${groupId}-${index + 1}`;
      items.push({
        id,
        representations: { glyph, reading },
        aliases: aliases?.length ? { reading: [...aliases] } : undefined,
        referenceDetails: [
          { label: collectionId === "digraphs" ? "Digraph name" : "Letter name", value: reading },
          { label: "Pronunciation (IPA)", value: pronunciations[glyph] }
        ]
      });
      return id;
    });
    return { id: `${collectionId}-${sectionId}-${groupId}`, title, itemIds };
  });
}

const alphabet: CharacterCollection = {
  id: "alphabet",
  title: "Indonesian alphabet",
  description: "Learn the 26 Latin letters used in Indonesian spelling.",
  sections: [
    { id: "alphabet-vowels", title: "Vowels", description: "The five vowel letters.", groups: buildGroups("alphabet", "vowels", vowels) },
    { id: "alphabet-consonants", title: "Consonants", description: "Indonesian consonant letters and their names.", groups: buildGroups("alphabet", "consonants", consonants) }
  ]
};

const digraphCollection: CharacterCollection = {
  id: "digraphs",
  title: "Common digraphs",
  description: "Recognize letter pairs that represent common Indonesian sounds.",
  sections: [{ id: "digraphs-main", title: "Digraphs", description: "Common combinations in Indonesian words and loanwords.", groups: buildGroups("digraphs", "main", digraphs) }]
};

export const indonesianCharacterCourse: CharacterCourse = {
  id: "indonesian-writing",
  title: "Alphabet & spelling",
  navLabel: "Alphabet",
  description: "Learn the Indonesian alphabet, then practice the common digraphs ng, ny, kh, and sy.",
  collections: [alphabet, digraphCollection],
  items,
  drillModes: [{ id: "recognition", title: "Read the unit", description: "Type the letter or digraph reading.", promptRepresentationId: "glyph", answerRepresentationId: "reading", answerLabel: "Letter or digraph reading", answerPlaceholder: "Type the reading" }],
  defaultDrillModeId: "recognition",
  sessionSizes: [10, 20, "all"]
};
