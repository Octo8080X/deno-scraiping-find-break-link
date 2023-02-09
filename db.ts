import { DB } from "https://deno.land/x/sqlite/mod.ts";

const db = new DB("scraping.db");

db.execute(`
  CREATE TABLE IF NOT EXISTS download_logs (
    url TEXT,
    path TEXT,
    created_at INTEGER 
  )
`);

db.execute(`
  CREATE TABLE IF NOT EXISTS inspection_logs (
    targetUrlPathName TEXT primary key,
    isExist INTEGER,
    created_at INTEGER 
  )
`);

export function insertDownloadLog(url: string, path: string) {
  const timestamp = new Date().getTime();
  db.query(
    "INSERT INTO download_logs (url, path, created_at) VALUES (?, ?, ?)",
    [url, path, timestamp],
  );
}

export function insertInspectEntry(targetUrlPathName: string) {
  const timestamp = new Date().getTime();
  db.query(
    `INSERT OR IGNORE INTO inspection_logs (targetUrlPathName, created_at) VALUES (?, ?)`,
    [targetUrlPathName, timestamp],
  );
}

export function updateInspectLog(targetUrlPathName: string, isExist: 1 | 0) {
  const timestamp = new Date().getTime();
  db.query(
    "UPDATE inspection_logs SET isExist = ? where targetUrlPathName = ?",
    [
      isExist,
      targetUrlPathName,
    ],
  );
}

export function selectUrlNoInspectCount() {
  const result = db.query(
    "SELECT * FROM inspection_logs WHERE isExist is NULL",
  );
  return result.length;
}
export function selectUrlNoInspects() {
  return db.query(
    "SELECT targetUrlPathName FROM inspection_logs WHERE isExist is NULL",
  );
}

export function selectNoExistLinks() {
    return db.query(
      "SELECT targetUrlPathName FROM inspection_logs WHERE isExist is 0",
    );
  }
  

export function closeDb() {
  db.close();
}
