import * as SQLite from 'expo-sqlite'
import type { Opportunity } from './types'

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null

async function database() {
  databasePromise ??= SQLite.openDatabaseAsync('erasmuswithus.db')
  const db = await databasePromise
  await db.execAsync('CREATE TABLE IF NOT EXISTS opportunity_cache (cache_key TEXT PRIMARY KEY NOT NULL, payload TEXT NOT NULL, updated_at TEXT NOT NULL);')
  return db
}

export async function cacheOpportunities(key: string, opportunities: Opportunity[]) {
  const db = await database()
  await db.runAsync(
    'INSERT OR REPLACE INTO opportunity_cache (cache_key, payload, updated_at) VALUES (?, ?, ?)',
    key,
    JSON.stringify(opportunities),
    new Date().toISOString(),
  )
}

export async function readCachedOpportunities(key: string) {
  const db = await database()
  const row = await db.getFirstAsync<{ payload: string }>(
    'SELECT payload FROM opportunity_cache WHERE cache_key = ?',
    key,
  )
  if (!row) return null
  try {
    return JSON.parse(row.payload) as Opportunity[]
  } catch {
    return null
  }
}
