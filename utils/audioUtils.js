/**
 * Audio processing and quality heuristics utilities
 */

// Common words to exclude from name detection (Italian, English, Spanish)
const COMMON_WORDS_TO_EXCLUDE = new Set([
  // Italian
  'voglio', 'prenotazione', 'tavolo', 'persone', 'nome', 'alle', 'per',
  'buongiorno', 'buonasera', 'grazie', 'prego', 'vorrei', 'domani', 'oggi', 'stasera',
  // English
  'table', 'booking', 'reservation', 'people', 'person', 'name', 'for', 'at',
  'hello', 'please', 'thank', 'thanks', 'today', 'tomorrow', 'tonight',
  // Spanish
  'mesa', 'reserva', 'personas', 'nombre', 'para', 'hola', 'gracias',
  'por', 'favor', 'hoy', 'mañana', 'noche'
]);

// Number words by language
const NUMBER_WORDS = {
  it: ['uno', 'una', 'due', 'tre', 'quattro', 'cinque', 'sei', 'sette', 'otto', 'nove', 'dieci',
       'undici', 'dodici', 'tredici', 'quattordici', 'quindici', 'sedici', 'diciassette', 'diciotto', 'diciannove', 'venti'],
  en: ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
       'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'],
  es: ['uno', 'una', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez',
       'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve', 'veinte']
};

// Time-related words by language
const TIME_WORDS = {
  it: ['ora', 'ore', 'mezzogiorno', 'mezzanotte', 'mattina', 'pomeriggio', 'sera', 'notte',
       'pranzo', 'cena', 'colazione', 'oggi', 'domani', 'dopodomani', 'stasera', 'alle'],
  en: ['hour', 'hours', 'noon', 'midnight', 'morning', 'afternoon', 'evening', 'night',
       'lunch', 'dinner', 'breakfast', 'today', 'tomorrow', 'tonight', 'at'],
  es: ['hora', 'horas', 'mediodía', 'medianoche', 'mañana', 'tarde', 'noche',
       'almuerzo', 'cena', 'desayuno', 'hoy', 'mañana', 'esta noche', 'a las']
};

/**
 * Calculate confidence score based on various factors
 * @param {Object} params - Parameters for confidence calculation
 * @param {number} params.duration - Recording duration in milliseconds
 * @param {string} params.transcript - Transcribed text
 * @param {number} params.wordCount - Number of words in transcript
 * @param {boolean} params.hasNumbers - Whether transcript contains numbers
 * @param {boolean} params.hasTimes - Whether transcript contains time references
 * @returns {number} Confidence score (0-100)
 */
export const calculateConfidenceScore = ({
  duration,
  transcript,
  wordCount,
  hasNumbers,
  hasTimes
}) => {
  let score = 80; // Higher base score for better starting point
  
  // Duration checks - more lenient
  if (duration < 300) {
    score -= 40; // Too short
  } else if (duration > 40000) {
    score -= 5; // Very long, slight penalty
  } else if (duration >= 800 && duration <= 15000) {
    score += 15; // Optimal duration range
  }
  
  // Word count checks - more generous
  if (wordCount === 0) {
    return 0; // No words detected
  } else if (wordCount < 2) {
    score -= 30; // Too few words
  } else if (wordCount >= 4 && wordCount <= 40) {
    score += 15; // Good word count range
  } else if (wordCount >= 2) {
    score += 5; // At least some words
  }
  
  // Content checks - higher rewards for key information
  if (hasNumbers) {
    score += 10; // Numbers detected (likely party size or time)
  }
  
  if (hasTimes) {
    score += 10; // Time reference detected
  }
  
  // Transcript quality
  if (transcript && transcript.length > 0) {
    const hasProperCapitalization = /[A-Z]/.test(transcript);
    if (hasProperCapitalization) {
      score += 5; // Likely has names
    }
    
    // Bonus for longer, more complete transcripts
    if (transcript.length > 30) {
      score += 5;
    }
  }
  
  // Ensure score is within bounds
  return Math.max(0, Math.min(100, score));
};

/**
 * Detect if transcript contains numbers
 * @param {string} transcript - Transcribed text
 * @returns {boolean}
 */
export const hasNumbers = (transcript) => {
  if (!transcript) return false;
  
  // Check for digits
  if (/\d/.test(transcript)) return true;
  
  // Check for written numbers in all supported languages
  const lowerTranscript = transcript.toLowerCase();
  const allNumberWords = [...NUMBER_WORDS.it, ...NUMBER_WORDS.en, ...NUMBER_WORDS.es];
  
  return allNumberWords.some(word => lowerTranscript.includes(word));
};

/**
 * Detect if transcript contains time references
 * @param {string} transcript - Transcribed text
 * @returns {boolean}
 */
export const hasTimeReferences = (transcript) => {
  if (!transcript) return false;
  
  const lowerTranscript = transcript.toLowerCase();
  
  // Check for time patterns (e.g., "20:30", "8:00", "20.30")
  if (/\d{1,2}[:\.]\d{2}/.test(transcript)) return true;
  
  // Check for time-related words in all supported languages
  const allTimeWords = [...TIME_WORDS.it, ...TIME_WORDS.en, ...TIME_WORDS.es];
  
  return allTimeWords.some(word => lowerTranscript.includes(word));
};

/**
 * Detect if transcript contains name references
 * @param {string} transcript - Transcribed text
 * @returns {boolean}
 */
export const hasNameReferences = (transcript) => {
  if (!transcript) return false;
  
  // Check for capitalized words (likely names), but exclude common words
  const words = transcript.split(/\s+/);
  const capitalizedWords = words.filter(word => {
    if (!/^[A-Z][a-z]+/.test(word)) return false;
    
    // Exclude common words that might be capitalized
    const lowerWord = word.toLowerCase();
    return !COMMON_WORDS_TO_EXCLUDE.has(lowerWord);
  });
  
  return capitalizedWords.length > 0;
};

/**
 * Extract critical tokens from transcript
 * @param {string} transcript - Transcribed text
 * @returns {Object} Extracted tokens
 */
export const extractCriticalTokens = (transcript) => {
  if (!transcript) {
    return {
      numbers: [],
      times: [],
      names: [],
      partySize: null,
      timeSlot: null
    };
  }
  
  const tokens = {
    numbers: [],
    times: [],
    names: [],
    partySize: null,
    timeSlot: null
  };
  
  const lowerTranscript = transcript.toLowerCase();
  
  // All number words mapping (Italian, English, Spanish)
  const allNumberWords = {
    // Italian
    'uno': 1, 'una': 1, 'due': 2, 'tre': 3, 'quattro': 4, 'cinque': 5,
    'sei': 6, 'sette': 7, 'otto': 8, 'nove': 9, 'dieci': 10,
    'undici': 11, 'dodici': 12, 'tredici': 13, 'quattordici': 14, 'quindici': 15,
    'sedici': 16, 'diciassette': 17, 'diciotto': 18, 'diciannove': 19, 'venti': 20,
    // English
    'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
    'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
    'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15,
    'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19, 'twenty': 20,
    // Spanish
    'dos': 2, 'tres': 3, 'cuatro': 4, 'cinco': 5,
    'siete': 7, 'ocho': 8, 'nueve': 9, 'diez': 10,
    'once': 11, 'doce': 12, 'trece': 13, 'catorce': 14, 'quince': 15,
    'dieciséis': 16, 'dieciseis': 16, 'diecisiete': 17, 'dieciocho': 18, 'diecinueve': 19, 'veinte': 20
  };
  
  // Extract time patterns FIRST (to avoid confusing time numbers with party size)
  const timeMatches = transcript.match(/\d{1,2}[:\.]\d{2}/g);
  if (timeMatches && timeMatches.length > 0) {
    tokens.times = timeMatches;
    tokens.timeSlot = timeMatches[0];
  }
  
  // Also check for time words like "alle otto" (at eight), "at eight", "a las ocho"
  if (!tokens.timeSlot) {
    const timeWordPatterns = [
      // Italian: "alle otto" = 20:00, "alle nove" = 21:00, etc.
      /(?:alle|all')\s+(otto|nove|dieci|undici|dodici|tredici|quattordici|quindici|sedici|diciassette|diciotto|diciannove|venti|ventuno|ventidue|ventitre|ventitré)/i,
      // English: "at eight" = 20:00, "at nine" = 21:00, etc.
      /(?:at)\s+(eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|twenty-one|twenty-two|twenty-three)/i,
      // Spanish: "a las ocho" = 20:00, "a las nueve" = 21:00, etc.
      /(?:a las)\s+(ocho|nueve|diez|once|doce|trece|catorce|quince|dieciséis|dieciseis|diecisiete|dieciocho|diecinueve|veinte|veintiuno|veintidós|veintidos|veintitrés|veintitres)/i
    ];
    
    for (const pattern of timeWordPatterns) {
      const match = lowerTranscript.match(pattern);
      if (match) {
        const timeWord = match[1].toLowerCase();
        // Convert time word to 24-hour format (assume dinner time if < 12)
        let hour = allNumberWords[timeWord] || allNumberWords[timeWord.replace('-', '')];
        if (hour && hour >= 8 && hour <= 23) {
          // Already in evening range (8-23)
          tokens.timeSlot = `${hour}:00`;
          tokens.times.push(tokens.timeSlot);
        } else if (hour && hour >= 1 && hour <= 7) {
          // Morning hours, likely meant evening (add 12)
          hour += 12;
          tokens.timeSlot = `${hour}:00`;
          tokens.times.push(tokens.timeSlot);
        }
        break;
      }
    }
  }
  
  // Extract all numbers from transcript
  const numberMatches = transcript.match(/\d+/g);
  if (numberMatches) {
    tokens.numbers = numberMatches.map(n => parseInt(n, 10));
  }
  
  // Find party size - look for number words near party size indicators
  let partySize = null;
  
  // Multi-language patterns for party size
  const partySizePatterns = [
    // Italian: "per due", "quattro persone", "tavolo per 4"
    /(?:per|tavolo per)\s+(\w+)(?:\s+person[ei])?/i,
    /(\w+)\s+person[ei]/i,
    // English: "for two", "four people", "table for 4"
    /(?:for|table for)\s+(\w+)(?:\s+people)?/i,
    /(\w+)\s+people/i,
    // Spanish: "para dos", "cuatro personas", "mesa para 4"
    /(?:para|mesa para)\s+(\w+)(?:\s+personas)?/i,
    /(\w+)\s+personas/i
  ];
  
  for (const pattern of partySizePatterns) {
    const match = transcript.match(pattern);
    if (match) {
      const word = match[1].toLowerCase();
      // Check if it's a number word in any language
      if (allNumberWords[word]) {
        partySize = allNumberWords[word];
        break;
      }
      // Check if it's a digit
      const num = parseInt(word, 10);
      if (!isNaN(num) && num >= 1 && num <= 20) {
        partySize = num;
        break;
      }
    }
  }
  
  // If still no party size, look for small numbers NOT in time expressions
  if (!partySize && tokens.numbers.length > 0) {
    // Filter out numbers that are part of times
    const timeNumbers = new Set();
    if (tokens.timeSlot) {
      const timeParts = tokens.timeSlot.split(/[:\.]/);
      timeParts.forEach(part => timeNumbers.add(parseInt(part, 10)));
    }
    
    const smallNumbers = tokens.numbers.filter(n => 
      n >= 1 && n <= 20 && !timeNumbers.has(n)
    );
    
    if (smallNumbers.length > 0) {
      partySize = smallNumbers[0];
    }
  }
  
  tokens.partySize = partySize;
  
  // Extract capitalized words (potential names), excluding common words
  const words = transcript.split(/\s+/);
  tokens.names = words.filter(word => {
    if (!/^[A-Z][a-z]+/.test(word)) return false;
    
    // Exclude common words that might be capitalized
    const lowerWord = word.toLowerCase();
    return !COMMON_WORDS_TO_EXCLUDE.has(lowerWord);
  });
  
  return tokens;
};

/**
 * Determine if recording needs server recheck
 * @param {number} confidenceScore - Calculated confidence score
 * @param {number} threshold - Minimum confidence threshold (default: 70)
 * @returns {boolean}
 */
export const needsServerRecheck = (confidenceScore, threshold = 70) => {
  return confidenceScore < threshold;
};

/**
 * Format audio duration for display
 * @param {number} milliseconds - Duration in milliseconds
 * @returns {string} Formatted duration (e.g., "0:05", "1:23")
 */
export const formatDuration = (milliseconds) => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Validate transcript has minimum required content
 * @param {string} transcript - Transcribed text
 * @returns {Object} Validation result
 */
export const validateTranscript = (transcript) => {
  const tokens = extractCriticalTokens(transcript);
  const wordCount = transcript ? transcript.split(/\s+/).filter(w => w.length > 0).length : 0;
  
  return {
    isValid: wordCount >= 3,
    hasPartySize: tokens.partySize !== null,
    hasTimeSlot: tokens.timeSlot !== null,
    hasName: tokens.names.length > 0,
    wordCount,
    missingFields: [
      !tokens.partySize && 'party size',
      !tokens.timeSlot && 'time',
      tokens.names.length === 0 && 'name'
    ].filter(Boolean)
  };
};
