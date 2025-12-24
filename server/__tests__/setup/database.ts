import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../../src/db/schema";

let pool: Pool;
let db: ReturnType<typeof drizzle>;

const TEST_DATABASE_URL =
	process.env.TEST_DATABASE_URL ||
	"postgresql://postgres:postgres@localhost:5432/tickzi_db_test";

export async function setupTestDatabase() {
	pool = new Pool({
		connectionString: TEST_DATABASE_URL,
	});

	db = drizzle(pool, { schema });

	await clearDatabase();

	return { pool, db };
}

export async function teardownTestDatabase() {
	if (pool) {
		await pool.end();
	}
}

export async function clearDatabase() {
	if (pool) {
		try {
			await pool.query("TRUNCATE TABLE tickzi.tickets CASCADE");
			await pool.query("TRUNCATE TABLE tickzi.events CASCADE");
			await pool.query("TRUNCATE TABLE tickzi.users CASCADE");
		} catch (error) {
			console.warn("Warning: Could not clear database tables", error);
		}
	}
}
