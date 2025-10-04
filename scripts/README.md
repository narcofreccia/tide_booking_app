# Translation Scripts

This folder contains automation scripts for managing translations in the Tide Booking App.

## 📝 translate-missing.mjs

Automatically translates missing keys in your translation files using OpenAI's GPT models.

### Features

- 🔍 **Auto-detects missing translations** - Compares source language with target languages
- 🧹 **Removes extra keys** - Cleans up keys that don't exist in source language
- 📦 **Chunked processing** - Handles large translation files efficiently
- 🔄 **Fallback support** - Uses English as fallback if translation not found
- 💾 **Auto-saves progress** - Saves after each chunk to prevent data loss
- ⏱️ **Rate limiting** - Prevents API rate limit issues

### Prerequisites

1. **OpenAI API Key** - Get one from [OpenAI Platform](https://platform.openai.com/api-keys)
2. **Node.js** - Version 20.16.0 or higher (already installed)
3. **Dependencies** - Already installed (`openai`, `dotenv`)

### Setup

1. Create a `.env` file in the project root:

```bash
# Required
OPENAI_API_KEY=sk-your-api-key-here

# Optional (defaults shown)
TRANSLATIONS_FOLDER=./translations
SOURCE_LANGUAGE=it
CHUNK_SIZE=10
RATE_LIMIT_DELAY=2000
OPENAI_MODEL=gpt-4o-mini
PROMPT_FILE=./translation-prompt.txt
```

2. Make sure your source language file (`it.json`) is complete and up-to-date

### Usage

Run the translation script:

```bash
# Using npm script (recommended)
npm run translate

# Or directly with node
node scripts/translate-missing.mjs
```

### How It Works

1. **Loads source language** (default: `it.json`)
2. **Discovers target languages** (all other `.json` files in `/translations`)
3. **For each target language:**
   - Finds missing translation keys
   - Removes extra keys not in source
   - Splits missing keys into chunks
   - Translates each chunk using OpenAI
   - Saves immediately after each chunk
4. **Reports completion** with summary

### Configuration Options

| Variable | Default | Description |
|----------|---------|-------------|
| `TRANSLATIONS_FOLDER` | `./translations` | Path to translations folder |
| `SOURCE_LANGUAGE` | `it` | Source language code |
| `CHUNK_SIZE` | `10` | Number of keys per API request |
| `RATE_LIMIT_DELAY` | `2000` | Delay between chunks (ms) |
| `OPENAI_MODEL` | `gpt-4o-mini` | OpenAI model to use |
| `PROMPT_FILE` | `./translation-prompt.txt` | Custom prompt file path |

### Supported Languages

The script supports 50+ languages including:
- English (en), Italian (it), Spanish (es)
- French (fr), German (de), Portuguese (pt)
- And many more...

### Custom Translation Prompt

On first run, a default `translation-prompt.txt` file is created. You can customize it to:
- Change translation tone/style
- Add context-specific instructions
- Modify formatting rules

### Example Output

```
🚀 Initializing Translation Manager...
📁 Source: it.json (Italian)
🌍 Target languages: en (English), es (Spanish)

🔍 Starting translation process...

🌍 Processing en (English)...
✅ en (English): No extra keys found
📊 en (English): Found 15 missing translations
📦 Split into 2 chunks
🔄 Processing chunk 1/2 for en (English)...
✅ Chunk 1/2 completed and saved
⏳ Waiting 2000ms before next chunk...
🔄 Processing chunk 2/2 for en (English)...
✅ Chunk 2/2 completed and saved
🎉 Completed en (English) translation

🎊 All translations completed successfully!
```

### Troubleshooting

**Error: Cannot find module**
- Make sure you're running from project root
- Use `npm run translate` instead of `node translate-missing.js`

**Error: Invalid JSON**
- Check your source language file for syntax errors
- Use a JSON validator to verify file structure

**API Rate Limit**
- Increase `RATE_LIMIT_DELAY` in `.env`
- Reduce `CHUNK_SIZE` for slower processing

**Translation Quality Issues**
- Customize the `translation-prompt.txt` file
- Try a different model (e.g., `gpt-4` for better quality)
- Adjust the temperature in the script (default: 0.3)

### Cost Estimation

Using `gpt-4o-mini`:
- ~$0.15 per 1M input tokens
- ~$0.60 per 1M output tokens
- Typical cost: $0.01-0.05 per 100 translation keys

### Best Practices

1. ✅ **Keep source language complete** - Always update Italian first
2. ✅ **Review translations** - AI translations may need human review
3. ✅ **Use version control** - Commit before running script
4. ✅ **Test after translation** - Verify translations in the app
5. ✅ **Backup regularly** - Script auto-saves but backups are good

### Security Notes

- ⚠️ **Never commit `.env` file** - It contains your API key
- ⚠️ **Add `.env` to `.gitignore`** - Already done in this project
- ⚠️ **Keep API key secret** - Don't share or expose it

---

For issues or questions, check the main project README or contact the development team.
