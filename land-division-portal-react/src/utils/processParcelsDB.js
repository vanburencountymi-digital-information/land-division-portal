const fs = require('fs');
const { parse } = require('csv-parse');
const { stringify } = require('csv-stringify');

// Define stop words that won't help search for business names.
const stopWords = ["llc", "inc", "ltd", "corp", "and", "&", "the"];

/**
 * Tokenizes an owner name:
 *  - Lowercases the string.
 *  - Removes punctuation.
 *  - Splits the string on whitespace.
 *  - Filters out stop words.
 *
 * @param {string} name - The owner name to tokenize.
 * @returns {Array<string>} - Array of tokens.
 */
function tokenizeName(name) {
  if (!name) return [];
  // Convert to lowercase and remove punctuation
  const normalized = name.toLowerCase().replace(/[^\w\s]/g, " ");
  // Split into tokens by whitespace and filter out empty strings
  let tokens = normalized.split(/\s+/).filter(token => token.length > 0);
  // Remove stop words
  tokens = tokens.filter(token => !stopWords.includes(token));
  return tokens;
}

const inputFile = './data/ParcelInfo - ParcelInfo.csv';
const outputFile = './data/ParcelInfo_updated.csv';

// Create a read stream and pipe it to the CSV parser
const parser = fs
  .createReadStream(inputFile)
  .pipe(parse({
    columns: true,        // Use the first row as header keys
    skip_empty_lines: true
  }));

// Create a stringifier to generate the output CSV
const stringifier = stringify({
  header: true
});

// Pipe the output of the stringifier to a write stream for the new CSV file
stringifier.pipe(fs.createWriteStream(outputFile));

// Process each record from the CSV
parser.on('data', (record) => {
  const newRecord = {};

  // Clean header keys: remove everything before and including the first '.' if it exists.
  Object.keys(record).forEach(key => {
    const cleanKey = key.includes('.') ? key.substring(key.indexOf('.') + 1) : key;
    newRecord[cleanKey] = record[key];
  });

  // Tokenize the owner name field.
  const ownerNameField = 'ownername1'; // Adjust if your cleaned header is different
  const ownerName = newRecord[ownerNameField];
  const tokens = tokenizeName(ownerName);

  // Add a new field "searchTokens" as a list of tokens
  newRecord['searchTokens'] = tokens;

  // Write the updated record to the output CSV.
  stringifier.write(newRecord);
});

parser.on('end', () => {
  stringifier.end();
  console.log('Processing complete. Updated CSV saved to:', outputFile);
});

parser.on('error', (err) => {
  console.error('Error parsing CSV:', err);
});
