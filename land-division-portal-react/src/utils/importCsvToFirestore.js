const fs = require('fs');
const { parse } = require('csv-parse');
const { db } = require('./firebase-admin'); // Ensure this is your admin SDK instance
const { doc, collection, writeBatch } = require('firebase/firestore');

function tokenizeName(name) {
  if (!name) return [];
  const normalized = name.toLowerCase().replace(/[^\w\s]/g, " ");
  const tokens = normalized.split(/\s+/).filter(token => token.length > 0);
  const stopWords = ["llc", "inc", "ltd", "corp", "and", "&", "the"];
  return tokens.filter(token => !stopWords.includes(token));
}

async function importCsvToFirestore(dryRun = false, limit = Infinity) {
  const BATCH_SIZE = 500;
  let batch = writeBatch(db);
  let counter = 0;
  let totalProcessed = 0;

  console.log(dryRun ? 'Running in dry-run mode...' : 'Running in LIVE mode...');

  const parser = fs
    .createReadStream('./data/ParcelInfo - ParcelInfo.csv')
    .pipe(parse({
      columns: true,
      skip_empty_lines: true
    }));

  for await (const record of parser) {
    if (totalProcessed >= limit) break;
    // Clean up headers: remove text before and including the first '.'
    const cleanedRecord = {};
    for (const key in record) {
      const cleanKey = key.includes('.') ? key.substring(key.indexOf('.') + 1) : key;
      cleanedRecord[cleanKey] = record[key];
    }
    // Process the owner name field for tokens
    const ownerField = 'ownername1';
    cleanedRecord.searchTokens = tokenizeName(cleanedRecord[ownerField]);

    if (!dryRun) {
      const docId = cleanedRecord['pnum'];
      const docRef = doc(collection(db, 'parcels'), docId);
      batch.set(docRef, cleanedRecord);
      counter++;
    }
    totalProcessed++;
    if (!dryRun && counter >= BATCH_SIZE) {
      console.log(`Committing batch of ${counter} records...`);
      await batch.commit();
      batch = writeBatch(db);
      counter = 0;
    }
  }

  if (!dryRun && counter > 0) {
    console.log(`Committing final batch of ${counter} records...`);
    await batch.commit();
  }

  console.log(`Processed ${totalProcessed} records${dryRun ? ' (dry run)' : ''}`);
}

const isDryRun = process.argv.includes('--dry-run');
const limitArg = process.argv.find(arg => arg.startsWith('--limit='));
const recordLimit = limitArg ? parseInt(limitArg.split('=')[1], 10) : Infinity;

importCsvToFirestore(isDryRun, recordLimit).catch(console.error);
