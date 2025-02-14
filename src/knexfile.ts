import { Knex } from "knex";
import * as path from "path";

const config: { [key: string]: Knex.Config } = {
    development: {
        client: "sqlite3",
        connection: {
            filename: path.resolve(__dirname, "dev.sqlite3")
        },
        useNullAsDefault: true,
        migrations: {
            directory: path.resolve(__dirname, "src/db/migrations")
        }
    },
    test: {
        client: "sqlite3",
        connection: ":memory:",
        useNullAsDefault: true,
        migrations: {
            directory: path.resolve(__dirname, "src/db/migrations")
        }
    }
};

module.exports = config;
export default config;