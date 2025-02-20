import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    // USERS table
    await knex.schema.createTable("users", (table) => {
        table.increments("id").primary();
        table.string("presentationKey").notNullable().unique();
        table.timestamps(true, true);
    });

    // AUTH_METHODS table
    await knex.schema.createTable("auth_methods", (table) => {
        table.increments("id").primary();
        table
            .integer("userId")
            .unsigned()
            .references("id")
            .inTable("users")
            .onDelete("CASCADE");
        table.string("methodType").notNullable();
        table.string("config").notNullable();
        table.timestamps(true, true);
    });

    // PAYMENTS table
    await knex.schema.createTable("payments", (table) => {
        table.increments("id").primary();
        table
            .integer("userId")
            .unsigned()
            .references("id")
            .inTable("users")
            .onDelete("CASCADE");
        table.json("paymentData");
        table.timestamps(true, true);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("payments");
    await knex.schema.dropTableIfExists("auth_methods");
    await knex.schema.dropTableIfExists("users");
}
