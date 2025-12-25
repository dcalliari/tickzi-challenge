import { fileURLToPath } from "node:url";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import * as schema from "../../src/db/schema";

let pool: Pool;
let db: ReturnType<typeof drizzle>;

const TEST_DATABASE_URL =
	process.env.TEST_DATABASE_URL ||
	"postgresql://tickzi_user:tickzi_pass@localhost:5432/tickzi_db_test";

function escapePgIdentifier(identifier: string) {
	return `"${identifier.replaceAll('"', '""')}"`;
}

async function ensureTestDatabaseExists() {
	const url = new URL(TEST_DATABASE_URL);
	const databaseName = url.pathname.replace(/^\//, "");
	if (!databaseName) {
		throw new Error("TEST_DATABASE_URL is missing a database name");
	}

	const adminUrl = new URL(url);
	adminUrl.pathname = "/postgres";

	const adminPool = new Pool({ connectionString: adminUrl.toString() });
	try {
		const existsRes = await adminPool.query(
			"select 1 from pg_database where datname = $1",
			[databaseName],
		);
		if (existsRes.rowCount && existsRes.rowCount > 0) {
			return;
		}

		await adminPool.query(
			`create database ${escapePgIdentifier(databaseName)}`,
		);
	} finally {
		await adminPool.end();
	}
}

async function migrateTestDatabase(dbInstance: ReturnType<typeof drizzle>) {
	await dbInstance.execute('create extension if not exists "pgcrypto"');

	const migrationsFolder = fileURLToPath(
		new URL("../../drizzle", import.meta.url),
	);
	await migrate(dbInstance, { migrationsFolder });
}

export async function setupTestDatabase() {
	await ensureTestDatabaseExists();

	pool = new Pool({
		connectionString: TEST_DATABASE_URL,
	});

	db = drizzle(pool, { schema });
	await migrateTestDatabase(db);
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
