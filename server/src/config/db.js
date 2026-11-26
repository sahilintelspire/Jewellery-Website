import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import mysql from 'mysql2/promise';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SERVER_ROOT = path.resolve(__dirname, '..', '..');

let activeDialect = 'sqlite';
let sqliteDb = null;
let mysqlPool = null;

/**
 * Normalize rows from node:sqlite (null-prototype objects) into standard JS objects.
 */
function normalizeRow(row) {
  return row ? { ...row } : null;
}

function normalizeRows(rows) {
  return Array.isArray(rows) ? rows.map((r) => ({ ...r })) : [];
}

/**
 * Determine configured SQL dialect ('mysql' or 'sqlite').
 */
export function getDialect() {
  return activeDialect;
}

/**
 * Initialize database connection (MySQL pool or local Node SQLite file).
 */
export async function initDatabase() {
  const requestedClient = (process.env.DB_CLIENT || 'sqlite').toLowerCase().trim();

  if (requestedClient === 'mysql') {
    const host = process.env.MYSQL_HOST || '127.0.0.1';
    const port = Number(process.env.MYSQL_PORT || 3306);
    const user = process.env.MYSQL_USER || 'root';
    const password = process.env.MYSQL_PASSWORD || '';
    const database = process.env.MYSQL_DATABASE || 'aura_jewels';

    const bootstrapConn = await mysql.createConnection({ host, port, user, password });
    await bootstrapConn.query(
      `CREATE DATABASE IF NOT EXISTS \`${database.replace(/`/g, '')}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    await bootstrapConn.end();

    mysqlPool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      charset: 'utf8mb4'
    });

    await mysqlPool.query('SELECT 1');
    activeDialect = 'mysql';
    return activeDialect;
  }

  const dataDir = path.join(SERVER_ROOT, 'data');
  fs.mkdirSync(dataDir, { recursive: true });
  const dbPath = path.join(dataDir, 'aura_jewels.db');

  sqliteDb = new DatabaseSync(dbPath);
  sqliteDb.exec('PRAGMA journal_mode = WAL;');
  sqliteDb.exec('PRAGMA foreign_keys = ON;');
  activeDialect = 'sqlite';
  return activeDialect;
}

/**
 * Execute a SELECT query and return an array of plain objects.
 */
export async function query(sql, params = []) {
  if (activeDialect === 'mysql') {
    const [rows] = await mysqlPool.execute(sql, params);
    return Array.isArray(rows) ? rows : [];
  }
  const stmt = sqliteDb.prepare(sql);
  return normalizeRows(stmt.all(...params));
}

/**
 * Execute a SELECT query and return the first matching row or null.
 */
export async function queryOne(sql, params = []) {
  if (activeDialect === 'mysql') {
    const [rows] = await mysqlPool.execute(sql, params);
    return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
  }
  const stmt = sqliteDb.prepare(sql);
  return normalizeRow(stmt.get(...params));
}

/**
 * Execute an INSERT, UPDATE, or DELETE statement.
 */
export async function execute(sql, params = []) {
  if (activeDialect === 'mysql') {
    const [result] = await mysqlPool.execute(sql, params);
    return {
      insertId: result?.insertId ? Number(result.insertId) : null,
      affectedRows: Number(result?.affectedRows || 0)
    };
  }
  const stmt = sqliteDb.prepare(sql);
  const info = stmt.run(...params);
  return {
    insertId: info?.lastInsertRowid ? Number(info.lastInsertRowid) : null,
    affectedRows: Number(info?.changes || 0)
  };
}

/**
 * Execute DDL or multi-statement SQL script (used during initialization).
 */
export async function execRaw(sql) {
  if (activeDialect === 'mysql') {
    const conn = await mysqlPool.getConnection();
    try {
      const statements = sql
        .split(';')
        .map((s) => s.trim())
        .filter(Boolean);
      for (const statement of statements) {
        await conn.query(statement);
      }
    } finally {
      conn.release();
    }
    return;
  }
  sqliteDb.exec(sql);
}

/**
 * Run a transactional unit of work with commit/rollback guarantees.
 */
export async function withTransaction(callback) {
  if (activeDialect === 'mysql') {
    const conn = await mysqlPool.getConnection();
    await conn.beginTransaction();
    const tx = {
      async query(sql, params = []) {
        const [rows] = await conn.execute(sql, params);
        return Array.isArray(rows) ? rows : [];
      },
      async queryOne(sql, params = []) {
        const [rows] = await conn.execute(sql, params);
        return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
      },
      async execute(sql, params = []) {
        const [result] = await conn.execute(sql, params);
        return {
          insertId: result?.insertId ? Number(result.insertId) : null,
          affectedRows: Number(result?.affectedRows || 0)
        };
      }
    };
    try {
      const result = await callback(tx);
      await conn.commit();
      return result;
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  sqliteDb.exec('BEGIN IMMEDIATE;');
  const tx = { query, queryOne, execute };
  try {
    const result = await callback(tx);
    sqliteDb.exec('COMMIT;');
    return result;
  } catch (error) {
    sqliteDb.exec('ROLLBACK;');
    throw error;
  }
}

/**
 * Upsert a site setting across SQLite and MySQL safely.
 */
export async function upsertSiteSetting(key, value) {
  const stringVal = typeof value === 'string' ? value : JSON.stringify(value);
  if (activeDialect === 'mysql') {
    await execute(
      `INSERT INTO site_settings (setting_key, setting_value)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = CURRENT_TIMESTAMP`,
      [key, stringVal]
    );
  } else {
    await execute(
      `INSERT INTO site_settings (setting_key, setting_value)
       VALUES (?, ?)
       ON CONFLICT(setting_key) DO UPDATE SET setting_value = excluded.setting_value, updated_at = CURRENT_TIMESTAMP`,
      [key, stringVal]
    );
  }
}

export async function closeDatabase() {
  if (mysqlPool) {
    await mysqlPool.end();
    mysqlPool = null;
  }
  if (sqliteDb) {
    sqliteDb.close();
    sqliteDb = null;
  }
}
