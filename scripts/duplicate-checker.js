#!/usr/bin/env node

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  translationsFolder: process.env.TRANSLATIONS_FOLDER || './translations',
  sourceLanguage: process.env.SOURCE_LANGUAGE || 'it',
  outputFile: process.env.DUPLICATES_LOG_FILE || './duplicates-report.json',
  minOccurrences: parseInt(process.env.MIN_DUPLICATE_OCCURRENCES || '2', 10),
  ignoreEmptyValues: process.env.IGNORE_EMPTY_VALUES !== 'false', // default true
  ignoreCaseInComparison: process.env.IGNORE_CASE_IN_COMPARISON === 'true' || false,
  debugMode: process.env.DEBUG_MODE === 'true' || false
};

class DuplicateChecker {
  constructor() {
    this.sourceData = null;
    this.duplicates = {};
    this.stats = {
      totalKeys: 0,
      uniqueValues: 0,
      duplicateValues: 0,
      duplicateGroups: 0
    };
  }

  init() {
    console.log('🔍 Initializing Duplicate Value Checker...');
    console.log(`📁 Source file: ${CONFIG.sourceLanguage}.json`);
    console.log(`📊 Minimum occurrences to flag as duplicate: ${CONFIG.minOccurrences}`);
    console.log(`🔤 Case-sensitive comparison: ${!CONFIG.ignoreCaseInComparison}`);
    console.log(`🚫 Ignore empty values: ${CONFIG.ignoreEmptyValues}`);
    console.log(`📝 Output file: ${CONFIG.outputFile}`);
    console.log(`🐛 Debug mode: ${CONFIG.debugMode ? 'ENABLED' : 'DISABLED'}`);
    
    this.loadSourceData();
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
    
    console.log(`✅ Loaded source data successfully`);
  }

  // Flatten nested JSON to get all key-value pairs with full paths
  flattenObject(obj, prefix = '') {
    const flattened = {};
    
    for (const key in obj) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        Object.assign(flattened, this.flattenObject(obj[key], fullKey));
      } else {
        flattened[fullKey] = obj[key];
      }
    }
    
    return flattened;
  }

  // Normalize value for comparison
  normalizeValue(value) {
    if (typeof value !== 'string') {
      return String(value);
    }
    
    let normalized = value.trim();
    
    if (CONFIG.ignoreCaseInComparison) {
      normalized = normalized.toLowerCase();
    }
    
    return normalized;
  }

  // Check if value should be ignored
  shouldIgnoreValue(value) {
    if (CONFIG.ignoreEmptyValues && (!value || value.trim() === '')) {
      return true;
    }
    
    return false;
  }

  findDuplicates() {
    console.log('\n🔍 Analyzing values for duplicates...');
    
    const flattened = this.flattenObject(this.sourceData);
    const valueMap = new Map(); // normalized value -> array of {key, originalValue}
    
    // Build value map
    for (const [key, value] of Object.entries(flattened)) {
      if (this.shouldIgnoreValue(value)) {
        if (CONFIG.debugMode) {
          console.log(`🚫 DEBUG: Ignoring empty/whitespace value for key "${key}"`);
        }
        continue;
      }
      
      const normalizedValue = this.normalizeValue(value);
      
      if (!valueMap.has(normalizedValue)) {
        valueMap.set(normalizedValue, []);
      }
      
      valueMap.get(normalizedValue).push({
        key: key,
        originalValue: value
      });
      
      if (CONFIG.debugMode) {
        console.log(`🔍 DEBUG: Mapped "${key}" -> "${normalizedValue}"`);
      }
    }
    
    // Find duplicates
    this.stats.totalKeys = Object.keys(flattened).length;
    this.stats.uniqueValues = valueMap.size;
    
    for (const [normalizedValue, occurrences] of valueMap.entries()) {
      if (occurrences.length >= CONFIG.minOccurrences) {
        this.duplicates[normalizedValue] = {
          normalizedValue: normalizedValue,
          occurrenceCount: occurrences.length,
          keys: occurrences.map(occ => occ.key),
          originalValues: [...new Set(occurrences.map(occ => occ.originalValue))], // unique original values
          occurrences: occurrences
        };
        
        this.stats.duplicateGroups++;
        this.stats.duplicateValues += occurrences.length;
        
        if (CONFIG.debugMode) {
          console.log(`🔍 DEBUG: Found duplicate group for "${normalizedValue}" with ${occurrences.length} occurrences`);
        }
      }
    }
  }

  generateReport() {
    const timestamp = new Date().toISOString();
    const duplicateGroups = Object.values(this.duplicates);
    
    // Sort by occurrence count (most duplicated first)
    duplicateGroups.sort((a, b) => b.occurrenceCount - a.occurrenceCount);
    
    const report = {
      metadata: {
        generatedAt: timestamp,
        sourceFile: `${CONFIG.sourceLanguage}.json`,
        translationsFolder: CONFIG.translationsFolder,
        configuration: {
          minOccurrences: CONFIG.minOccurrences,
          ignoreEmptyValues: CONFIG.ignoreEmptyValues,
          ignoreCaseInComparison: CONFIG.ignoreCaseInComparison
        }
      },
      statistics: this.stats,
      summary: {
        totalDuplicateGroups: this.stats.duplicateGroups,
        totalDuplicateKeys: this.stats.duplicateValues,
        totalUniqueValues: this.stats.uniqueValues,
        totalKeys: this.stats.totalKeys,
        duplicatePercentage: ((this.stats.duplicateValues / this.stats.totalKeys) * 100).toFixed(2)
      },
      duplicateGroups: duplicateGroups.map(group => ({
        value: group.normalizedValue,
        occurrenceCount: group.occurrenceCount,
        originalValues: group.originalValues,
        keys: group.keys,
        suggestions: {
          action: "review_and_consolidate",
          note: "Consider if these keys should share the same translation or if they represent different concepts that need distinct translations."
        }
      }))
    };
    
    return report;
  }

  saveReport(report) {
    const outputPath = path.join(process.cwd(), CONFIG.outputFile);
    
    try {
      fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf8');
      console.log(`📄 Report saved to: ${outputPath}`);
    } catch (error) {
      console.error(`❌ Failed to save report: ${error.message}`);
      throw error;
    }
  }

  printSummary(report) {
    console.log('\n📊 DUPLICATE VALUES ANALYSIS SUMMARY');
    console.log('=====================================');
    console.log(`📁 Source: ${report.metadata.sourceFile}`);
    console.log(`🔢 Total translation keys: ${report.summary.totalKeys}`);
    console.log(`🎯 Unique values: ${report.summary.totalUniqueValues}`);
    console.log(`🔄 Duplicate groups found: ${report.summary.totalDuplicateGroups}`);
    console.log(`📝 Keys with duplicate values: ${report.summary.totalDuplicateKeys}`);
    console.log(`📈 Duplication rate: ${report.summary.duplicatePercentage}%`);
    
    if (report.summary.totalDuplicateGroups > 0) {
      console.log('\n🔍 TOP DUPLICATE GROUPS:');
      console.log('========================');
      
      const topGroups = report.duplicateGroups.slice(0, 10);
      
      topGroups.forEach((group, index) => {
        console.log(`\n${index + 1}. "${group.value}" (${group.occurrenceCount} occurrences)`);
        console.log(`   Keys: ${group.keys.slice(0, 5).join(', ')}${group.keys.length > 5 ? ` ... and ${group.keys.length - 5} more` : ''}`);
        
        if (group.originalValues.length > 1) {
          console.log(`   ⚠️  Original values vary: ${group.originalValues.join(' | ')}`);
        }
      });
      
      if (report.duplicateGroups.length > 10) {
        console.log(`\n... and ${report.duplicateGroups.length - 10} more duplicate groups`);
      }
      
      console.log(`\n📄 Full detailed report saved to: ${CONFIG.outputFile}`);
      console.log('\n💡 NEXT STEPS:');
      console.log('   1. Review the generated report file');
      console.log('   2. Identify which duplicates are intentional vs accidental');
      console.log('   3. For accidental duplicates, update your codebase to use a single key');
      console.log('   4. Remove unused keys from the translation file');
      console.log('   5. Re-run this script to verify cleanup');
      
    } else {
      console.log('\n🎉 No duplicate values found! Your translations are clean.');
    }
  }

  async run() {
    try {
      this.init();
      this.findDuplicates();
      
      const report = this.generateReport();
      this.saveReport(report);
      this.printSummary(report);
      
      console.log('\n✅ Duplicate analysis completed successfully!');
      
    } catch (error) {
      console.error('💥 Fatal error:', error.message);
      process.exit(1);
    }
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  const checker = new DuplicateChecker();
  checker.run();
}

export default DuplicateChecker;