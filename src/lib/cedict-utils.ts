import cedict, { CedictEntry as ImportedCedictEntry } from 'cedict-json';

export interface DictionaryEntry {
  traditional: string;
  simplified: string;
  pinyin: string;
  definitions: string[];
}

function convertEntry(entry: ImportedCedictEntry): DictionaryEntry {
  return {
    traditional: entry.traditional,
    simplified: entry.simplified,
    pinyin: entry.pinyin,
    // The cedict-json package uses 'english' for definitions
    definitions: Array.isArray(entry.english) ? entry.english : [entry.english]
  };
}

export async function lookupWord(word: string): Promise<DictionaryEntry | null> {
  try {
    // Load the dictionary entries
    const entries: ImportedCedictEntry[] = cedict;
    
    // Find matching entries (prioritize exact matches)
    const exactMatch = entries.find(
      (entry) => entry.simplified === word || entry.traditional === word
    );

    if (exactMatch) {
      return convertEntry(exactMatch);
    }

    // If no exact match is found for multi-character words,
    // try to find matches for individual characters
    if (word.length > 1) {
      const characters = word.split('');
      const characterEntries = await Promise.all(
        characters.map(async (char) => {
          const match = entries.find(
            (entry) => entry.simplified === char || entry.traditional === char
          );
          return match || null;
        })
      );

      // If we found entries for all characters, combine them
      if (characterEntries.every((entry): entry is ImportedCedictEntry => entry !== null)) {
        return {
          traditional: characterEntries.map(entry => entry.traditional).join(''),
          simplified: characterEntries.map(entry => entry.simplified).join(''),
          pinyin: characterEntries.map(entry => entry.pinyin).join(' '),
          definitions: characterEntries.map(entry => 
            Array.isArray(entry.english) ? entry.english[0] : entry.english
          )
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Error looking up word in CC-CEDICT:', error);
    return null;
  }
}
