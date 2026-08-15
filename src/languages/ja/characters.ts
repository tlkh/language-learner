import type {
  CharacterCollection,
  CharacterCourse,
  CharacterGroup,
  CharacterItem,
  CharacterSection
} from "../types";

type RawUnit = readonly [glyph: string, romanization: string, aliases?: readonly string[]];
type RawGroup = readonly [id: string, title: string, units: readonly RawUnit[]];

const mainHiragana: readonly RawGroup[] = [
  ["a", "A row", [["あ", "a"], ["い", "i"], ["う", "u"], ["え", "e"], ["お", "o"]]],
  ["ka", "K row", [["か", "ka"], ["き", "ki"], ["く", "ku"], ["け", "ke"], ["こ", "ko"]]],
  ["sa", "S row", [["さ", "sa"], ["し", "shi", ["si"]], ["す", "su"], ["せ", "se"], ["そ", "so"]]],
  ["ta", "T row", [["た", "ta"], ["ち", "chi", ["ti"]], ["つ", "tsu", ["tu"]], ["て", "te"], ["と", "to"]]],
  ["na", "N row", [["な", "na"], ["に", "ni"], ["ぬ", "nu"], ["ね", "ne"], ["の", "no"]]],
  ["ha", "H row", [["は", "ha"], ["ひ", "hi"], ["ふ", "fu", ["hu"]], ["へ", "he"], ["ほ", "ho"]]],
  ["ma", "M row", [["ま", "ma"], ["み", "mi"], ["む", "mu"], ["め", "me"], ["も", "mo"]]],
  ["ya", "Y row", [["や", "ya"], ["ゆ", "yu"], ["よ", "yo"]]],
  ["ra", "R row", [["ら", "ra"], ["り", "ri"], ["る", "ru"], ["れ", "re"], ["ろ", "ro"]]],
  ["wa", "W row and N", [["わ", "wa"], ["を", "wo"], ["ん", "n"]]]
];

const dakutenHiragana: readonly RawGroup[] = [
  ["ga", "G row", [["が", "ga"], ["ぎ", "gi"], ["ぐ", "gu"], ["げ", "ge"], ["ご", "go"]]],
  ["za", "Z row", [["ざ", "za"], ["じ", "ji", ["zi"]], ["ず", "zu"], ["ぜ", "ze"], ["ぞ", "zo"]]],
  ["da", "D row", [["だ", "da"], ["ぢ", "di"], ["づ", "du"], ["で", "de"], ["ど", "do"]]],
  ["ba", "B row", [["ば", "ba"], ["び", "bi"], ["ぶ", "bu"], ["べ", "be"], ["ぼ", "bo"]]],
  ["pa", "P row", [["ぱ", "pa"], ["ぴ", "pi"], ["ぷ", "pu"], ["ぺ", "pe"], ["ぽ", "po"]]]
];

const combinationHiragana: readonly RawGroup[] = [
  ["kya", "K combinations", [["きゃ", "kya"], ["きゅ", "kyu"], ["きょ", "kyo"]]],
  ["sha", "S combinations", [["しゃ", "sha", ["sya"]], ["しゅ", "shu", ["syu"]], ["しょ", "sho", ["syo"]]]],
  ["cha", "T combinations", [["ちゃ", "cha", ["tya"]], ["ちゅ", "chu", ["tyu"]], ["ちょ", "cho", ["tyo"]]]],
  ["nya", "N combinations", [["にゃ", "nya"], ["にゅ", "nyu"], ["にょ", "nyo"]]],
  ["hya", "H combinations", [["ひゃ", "hya"], ["ひゅ", "hyu"], ["ひょ", "hyo"]]],
  ["mya", "M combinations", [["みゃ", "mya"], ["みゅ", "myu"], ["みょ", "myo"]]],
  ["rya", "R combinations", [["りゃ", "rya"], ["りゅ", "ryu"], ["りょ", "ryo"]]],
  ["gya", "G combinations", [["ぎゃ", "gya"], ["ぎゅ", "gyu"], ["ぎょ", "gyo"]]],
  ["ja", "J combinations", [["じゃ", "ja", ["jya", "zya"]], ["じゅ", "ju", ["jyu", "zyu"]], ["じょ", "jo", ["jyo", "zyo"]]]],
  ["dya", "D combinations", [["ぢゃ", "dya"], ["ぢゅ", "dyu"], ["ぢょ", "dyo"]]],
  ["bya", "B combinations", [["びゃ", "bya"], ["びゅ", "byu"], ["びょ", "byo"]]],
  ["pya", "P combinations", [["ぴゃ", "pya"], ["ぴゅ", "pyu"], ["ぴょ", "pyo"]]]
];

const katakanaByHiragana = new Map(Array.from(
  "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽゃゅょ"
).map((glyph, index) => [glyph, Array.from(
  "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポャュョ"
)[index]]));

const toKatakana = (glyph: string) => Array.from(glyph).map((character) => katakanaByHiragana.get(character) ?? character).join("");

const katakanaGroups = (groups: readonly RawGroup[]): readonly RawGroup[] => groups.map(([id, title, units]) => [
  id,
  title,
  units.map(([glyph, romanization, aliases]) => [toKatakana(glyph), romanization, aliases])
]);

const items: CharacterItem[] = [];

function buildGroups(collectionId: string, sectionId: string, groups: readonly RawGroup[]): CharacterGroup[] {
  return groups.map(([groupId, title, units]) => {
    const itemIds = units.map(([glyph, romanization, aliases], index) => {
      const id = `${collectionId}-${sectionId}-${groupId}-${index + 1}`;
      items.push({
        id,
        representations: { glyph, romanization },
        aliases: aliases?.length ? { romanization: [...aliases] } : undefined
      });
      return id;
    });
    return { id: `${collectionId}-${sectionId}-${groupId}`, title, itemIds };
  });
}

function buildCollection(
  id: string,
  title: string,
  description: string,
  main: readonly RawGroup[],
  dakuten: readonly RawGroup[],
  combinations: readonly RawGroup[]
): CharacterCollection {
  const sections: CharacterSection[] = [
    {
      id: `${id}-main`,
      title: "Main kana",
      description: "The 46 basic kana used as the foundation for reading Japanese.",
      groups: buildGroups(id, "main", main)
    },
    {
      id: `${id}-dakuten`,
      title: "Dakuten kana",
      description: "Voiced and semi-voiced forms marked with dakuten or handakuten.",
      groups: buildGroups(id, "dakuten", dakuten)
    },
    {
      id: `${id}-combination`,
      title: "Combination kana",
      description: "Contracted sounds made with a kana plus small ya, yu, or yo.",
      groups: buildGroups(id, "combination", combinations)
    }
  ];
  return { id, title, description, sections };
}

const collections: CharacterCollection[] = [
  buildCollection(
    "hiragana",
    "Hiragana",
    "The rounded phonetic script used for grammar, native words, and readings.",
    mainHiragana,
    dakutenHiragana,
    combinationHiragana
  ),
  buildCollection(
    "katakana",
    "Katakana",
    "The angular phonetic script used for loanwords, names, and emphasis.",
    katakanaGroups(mainHiragana),
    katakanaGroups(dakutenHiragana),
    katakanaGroups(combinationHiragana)
  )
];

export const japaneseCharacterCourse: CharacterCourse = {
  id: "kana",
  title: "Kana",
  navLabel: "Kana",
  description: "Learn the shape and reading of hiragana and katakana, then practice the sets you choose.",
  collections,
  items,
  drillModes: [{
    id: "recognition",
    title: "Read kana",
    description: "Type the romaji reading for each kana.",
    promptRepresentationId: "glyph",
    answerRepresentationId: "romanization",
    answerLabel: "Romaji reading",
    answerPlaceholder: "Type romaji"
  }],
  defaultDrillModeId: "recognition",
  sessionSizes: [10, 20, "all"]
};
