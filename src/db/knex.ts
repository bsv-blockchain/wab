import knex, { Knex } from "knex";
import * as path from "path";
import config from "../../knexfile";

const environment = process.env.NODE_ENV || "development";
const knexConfig = (config as any)[environment] as Knex.Config;

export const db = knex(knexConfig);

export async function migrateLatest() {
    await db.migrate.latest({
        directory: path.join(__dirname, "migrations")
    });
}
