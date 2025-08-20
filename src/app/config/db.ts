import { Pool, QueryResult } from 'pg';

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'plantation_db',
  password: process.env.DB_PASSWORD || '',
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Test the connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export { pool };

// // Define a generic query function with proper typing
// export const query = <T = any>(text: string, params?: unknown[]): Promise<QueryResult<T>> => {
//   return pool.query<T>(text, params);
// };

// Alternatively, if you want to be more specific about the row type:
export const query = <T extends Record<string, unknown> = Record<string, unknown>>(
  text: string, 
  params?: unknown[]
): Promise<QueryResult<T>> => {
  return pool.query<T>(text, params);
};