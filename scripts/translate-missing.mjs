#!/usr/bin/env node

import 'dotenv/config'; // Load .env file
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  translationsFolder: process.env.TRANSLATIONS_FOLDER || './translations',
  sourceLanguage: process.env.SOURCE_LANGUAGE || 'it',
  chunkSize: parseInt(process.env.CHUNK_SIZE || '10', 10),
  rateLimitDelay: parseInt(process.env.RATE_LIMIT_DELAY || '2000', 10),
  openaiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  promptFile: process.env.PROMPT_FILE || './translation-prompt.txt'
};

// Language code to full language name mapping
const LANGUAGE_NAMES = {
  'en': 'English',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'it': 'Italian',
  'pt': 'Portuguese',
  'ru': 'Russian',
  'ja': 'Japanese',
  'ko': 'Korean',
  'zh': 'Chinese',
  'ar': 'Arabic',
  'hi': 'Hindi',
  'nl': 'Dutch',
  'sv': 'Swedish',
  'da': 'Danish',
  'no': 'Norwegian',
  'fi': 'Finnish',
  'pl': 'Polish',
  'tr': 'Turkish',
  'cs': 'Czech',
  'hu': 'Hungarian',
  'ro': 'Romanian',
  'bg': 'Bulgarian',
  'hr': 'Croatian',
  'sk': 'Slovak',
  'sl': 'Slovenian',
  'et': 'Estonian',
  'lv': 'Latvian',
  'lt': 'Lithuanian',
  'el': 'Greek',
  'he': 'Hebrew',
  'th': 'Thai',
  'vi': 'Vietnamese',
  'id': 'Indonesian',
  'ms': 'Malay',
  'tl': 'Filipino',
  'uk': 'Ukrainian',
  'be': 'Belarusian',
  'ka': 'Georgian',
  'hy': 'Armenian',
  'az': 'Azerbaijani',
  'kk': 'Kazakh',
  'ky': 'Kyrgyz',
  'uz': 'Uzbek',
  'mn': 'Mongolian',
  'ne': 'Nepali',
  'si': 'Sinhala',
  'my': 'Myanmar',
  'km': 'Khmer',
  'lo': 'Lao',
  'am': 'Amharic',
  'sw': 'Swahili',
  'zu': 'Zulu',
  'af': 'Afrikaans',
  'sq': 'Albanian',
  'eu': 'Basque',
  'ca': 'Catalan',
  'cy': 'Welsh',
  'ga': 'Irish',
  'is': 'Icelandic',
  'mt': 'Maltese',
  'mk': 'Macedonian',
  'sr': 'Serbian',
  'bs': 'Bosnian',
  'me': 'Montenegrin'
};

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

class TranslationManager {
  constructor() {
    this.sourceData = null;
    this.targetLanguages = [];
    this.translationPrompt = '';
  }

  async init() {
    console.log('🚀 Initializing Translation Manager...');
    
    // Load prompt
    this.loadPrompt();
    
    // Load source language file
    this.loadSourceData();
    
    // Discover target language files
    this.discoverTargetLanguages();
    
    console.log(`📁 Source: ${CONFIG.sourceLanguage}.json (${this.getLanguageName(CONFIG.sourceLanguage)})`);
    console.log(`🌍 Target languages: ${this.targetLanguages.map(lang => `${lang} (${this.getLanguageName(lang)})`).join(', ')}`);
  }

  getLanguageName(languageCode) {
    return LANGUAGE_NAMES[languageCode] || languageCode.toUpperCase();
  }

  loadPrompt() {
    const promptPath = path.join(process.cwd(), CONFIG.promptFile);
    
    if (!fs.existsSync(promptPath)) {
      // Create default prompt file
      const defaultPrompt = `You are a professional translator. Translate the provided JSON object from the source language to the target language.

IMPORTANT RULES:
1. Maintain the exact same JSON structure and keys
2. Only translate the VALUES, never the KEYS
3. Preserve any placeholders like {{variable}}, {0}, %s, etc.
4. Keep HTML tags intact if present
5. Maintain the same tone and context
6. Return ONLY valid JSON, no explanations or additional text

Source Language: {{SOURCE_LANGUAGE}}
Target Language: {{TARGET_LANGUAGE}}

JSON to translate:
{{JSON_DATA}}`;

      fs.writeFileSync(promptPath, defaultPrompt, 'utf8');
      console.log(`📝 Created default prompt file: ${CONFIG.promptFile}`);
    }
    
    this.translationPrompt = fs.readFileSync(promptPath, 'utf8');
  }

  loadSourceData() {
    const sourcePath = path.join(process.cwd(), CONFIG.translationsFolder, `${CONFIG.sourceLanguage}.json`);
    
    if (!fs.existsSync(sourcePath)) {
      throw new Error(`Source file not found: ${sourcePath}`);
    }
    
    const rawContent = fs.readFileSync(sourcePath, 'utf8').trim();
    
    if (rawContent.length === 0) {
      throw new Error(`Source file ${CONFIG.sourceLanguage}.json is empty`);
    }
    
    try {
      this.sourceData = JSON.parse(rawContent);
    } catch (error) {
      throw new Error(`Invalid JSON in source file ${CONFIG.sourceLanguage}.json: ${error.message}`);
    }
    
    console.log(`✅ Loaded source data with ${this.countKeys(this.sourceData)} keys`);
  }

  discoverTargetLanguages() {
    const translationsPath = path.join(process.cwd(), CONFIG.translationsFolder);
    
    if (!fs.existsSync(translationsPath)) {
      throw new Error(`Translations folder not found: ${translationsPath}`);
    }
    
    const files = fs.readdirSync(translationsPath);
    
    this.targetLanguages = files
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace('.json', ''))
      .filter(lang => lang !== CONFIG.sourceLanguage);

    // Warn about unknown language codes
    this.targetLanguages.forEach(lang => {
      if (!LANGUAGE_NAMES[lang]) {
        console.warn(`⚠️  Unknown language code: ${lang} - will use code as-is`);
      }
    });
  }

  countKeys(obj, count = 0) {
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        count = this.countKeys(obj[key], count);
      } else {
        count++;
      }
    }
    return count;
  }

  findMissingKeys(source, target, prefix = '') {
    const missing = {};
    
    for (const key in source) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof source[key] === 'object' && source[key] !== null) {
        if (!target[key] || typeof target[key] !== 'object') {
          missing[key] = source[key];
        } else {
          const nestedMissing = this.findMissingKeys(source[key], target[key], fullKey);
          if (Object.keys(nestedMissing).length > 0) {
            missing[key] = nestedMissing;
          }
        }
      } else {
        if (!(key in target)) {
          missing[key] = source[key];
        }
      }
    }
    
    return missing;
  }

  findExtraKeys(source, target, prefix = '') {
    const extraKeys = [];
    
    for (const key in target) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof target[key] === 'object' && target[key] !== null) {
        if (!source[key] || typeof source[key] !== 'object') {
          // Entire object is extra
          extraKeys.push(fullKey);
        } else {
          // Check nested keys
          const nestedExtraKeys = this.findExtraKeys(source[key], target[key], fullKey);
          extraKeys.push(...nestedExtraKeys);
        }
      } else {
        if (!(key in source)) {
          extraKeys.push(fullKey);
        }
      }
    }
    
    return extraKeys;
  }

  removeExtraKeys(source, target) {
    const cleaned = {};
    
    for (const key in target) {
      if (key in source) {
        if (typeof source[key] === 'object' && source[key] !== null && 
            typeof target[key] === 'object' && target[key] !== null) {
          // Recursively clean nested objects
          const cleanedNested = this.removeExtraKeys(source[key], target[key]);
          if (Object.keys(cleanedNested).length > 0) {
            cleaned[key] = cleanedNested;
          }
        } else {
          // Keep the value if key exists in source
          cleaned[key] = target[key];
        }
      }
      // Skip keys that don't exist in source (extra keys)
    }
    
    return cleaned;
  }

  flattenObject(obj, prefix = '') {
    const flattened = {};
    
    for (const key in obj) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        Object.assign(flattened, this.flattenObject(obj[key], newKey));
      } else {
        flattened[newKey] = obj[key];
      }
    }
    
    return flattened;
  }

  unflattenObject(flattened) {
    const result = {};
    
    for (const key in flattened) {
      const keys = key.split('.');
      let current = result;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = flattened[key];
    }
    
    return result;
  }

  createChunks(obj, chunkSize) {
    const flattened = this.flattenObject(obj);
    const entries = Object.entries(flattened);
    const chunks = [];
    
    for (let i = 0; i < entries.length; i += chunkSize) {
      const chunk = {};
      const chunkEntries = entries.slice(i, i + chunkSize);
      
      for (const [key, value] of chunkEntries) {
        chunk[key] = value;
      }
      
      chunks.push(chunk);
    }
    
    return chunks;
  }

  async translateChunk(chunk, targetLanguageCode) {
    const sourceLanguageName = this.getLanguageName(CONFIG.sourceLanguage);
    const targetLanguageName = this.getLanguageName(targetLanguageCode);
    
    const prompt = this.translationPrompt
      .replace('{{SOURCE_LANGUAGE}}', sourceLanguageName)
      .replace('{{TARGET_LANGUAGE}}', targetLanguageName)
      .replace('{{JSON_DATA}}', JSON.stringify(chunk, null, 2));

    try {
      const response = await openai.chat.completions.create({
        model: CONFIG.openaiModel,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });

      const translatedText = response.choices[0].message.content.trim();
      
      // Try to parse as JSON
      let translatedChunk;
      try {
        // Remove potential markdown code blocks
        const cleanedText = translatedText.replace(/```json\n?|\n?```/g, '');
        translatedChunk = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error('❌ Failed to parse LLM response as JSON:', parseError.message);
        console.error('Raw response:', translatedText);
        throw new Error('Invalid JSON response from LLM');
      }

      return translatedChunk;
    } catch (error) {
      console.error('❌ Translation API error:', error.message);
      throw error;
    }
  }

  deepMerge(target, source) {
    const result = { ...target };
    
    for (const key in source) {
      if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
        if (typeof result[key] === 'object' && result[key] !== null && !Array.isArray(result[key])) {
          result[key] = this.deepMerge(result[key], source[key]);
        } else {
          result[key] = source[key];
        }
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  loadTargetData(targetPath, targetLanguageCode) {
    let targetData = {};
    
    if (fs.existsSync(targetPath)) {
      const rawContent = fs.readFileSync(targetPath, 'utf8').trim();
      
      if (rawContent.length === 0) {
        console.warn(`⚠️  ${targetLanguageCode}.json is empty, treating as {}`);
        targetData = {};
      } else {
        try {
          targetData = JSON.parse(rawContent);
        } catch (error) {
          console.error(`❌ Invalid JSON in ${targetLanguageCode}.json: ${error.message}`);
          console.warn(`⚠️  Treating ${targetLanguageCode}.json as empty object to continue processing`);
          targetData = {};
        }
      }
    } else {
      console.log(`📄 ${targetLanguageCode}.json doesn't exist, will create new file`);
    }
    
    return targetData;
  }

  async processLanguage(targetLanguageCode) {
    const targetLanguageName = this.getLanguageName(targetLanguageCode);
    console.log(`\n🌍 Processing ${targetLanguageCode} (${targetLanguageName})...`);
    
    const targetPath = path.join(process.cwd(), CONFIG.translationsFolder, `${targetLanguageCode}.json`);
    
    // Load existing target data or create empty object (with safe handling)
    let targetData = this.loadTargetData(targetPath, targetLanguageCode);
    
    // Check for and remove extra keys before translation
    const extraKeys = this.findExtraKeys(this.sourceData, targetData);
    if (extraKeys.length > 0) {
      console.log(`🧹 ${targetLanguageCode} (${targetLanguageName}): Found ${extraKeys.length} extra keys to remove:`);
      extraKeys.forEach(key => console.log(`   - ${key}`));
      
      // Remove extra keys
      const cleanedTargetData = this.removeExtraKeys(this.sourceData, targetData);
      
      // Save cleaned data
      fs.writeFileSync(targetPath, JSON.stringify(cleanedTargetData, null, 2), 'utf8');
      console.log(`✅ ${targetLanguageCode} (${targetLanguageName}): Removed extra keys and saved cleaned file`);
      
      // Update targetData to use cleaned version
      targetData = cleanedTargetData;
    } else {
      console.log(`✅ ${targetLanguageCode} (${targetLanguageName}): No extra keys found`);
    }
    
    // Find missing keys
    const missingKeys = this.findMissingKeys(this.sourceData, targetData);
    const missingCount = this.countKeys(missingKeys);
    
    if (missingCount === 0) {
      console.log(`✅ ${targetLanguageCode} (${targetLanguageName}): No missing translations`);
      return;
    }
    
    console.log(`📊 ${targetLanguageCode} (${targetLanguageName}): Found ${missingCount} missing translations`);
    
    // Create chunks
    const chunks = this.createChunks(missingKeys, CONFIG.chunkSize);
    console.log(`📦 Split into ${chunks.length} chunks`);
    
    let updatedTargetData = { ...targetData };
    
    // Process each chunk
    for (let i = 0; i < chunks.length; i++) {
      console.log(`🔄 Processing chunk ${i + 1}/${chunks.length} for ${targetLanguageCode} (${targetLanguageName})...`);
      
      try {
        // Translate chunk
        const translatedChunk = await this.translateChunk(chunks[i], targetLanguageCode);
        
        // Convert back to nested structure
        const nestedTranslation = this.unflattenObject(translatedChunk);
        
        // Merge with existing target data
        updatedTargetData = this.deepMerge(updatedTargetData, nestedTranslation);
        
        // Save immediately after each chunk (safety measure)
        fs.writeFileSync(targetPath, JSON.stringify(updatedTargetData, null, 2), 'utf8');
        
        console.log(`✅ Chunk ${i + 1}/${chunks.length} completed and saved`);
        
        // Rate limiting delay
        if (i < chunks.length - 1) {
          console.log(`⏳ Waiting ${CONFIG.rateLimitDelay}ms before next chunk...`);
          await new Promise(resolve => setTimeout(resolve, CONFIG.rateLimitDelay));
        }
        
      } catch (error) {
        console.error(`❌ Failed to process chunk ${i + 1} for ${targetLanguageCode} (${targetLanguageName}):`, error.message);
        // Continue with next chunk instead of failing completely
        continue;
      }
    }
    
    console.log(`🎉 Completed ${targetLanguageCode} (${targetLanguageName}) translation`);
  }

  async run() {
    try {
      await this.init();
      
      console.log('\n🔍 Starting translation process...');
      
      for (const targetLanguageCode of this.targetLanguages) {
        await this.processLanguage(targetLanguageCode);
      }
      
      console.log('\n🎊 All translations completed successfully!');
      
    } catch (error) {
      console.error('💥 Fatal error:', error.message);
      process.exit(1);
    }
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  const manager = new TranslationManager();
  manager.run();
}

export default TranslationManager;