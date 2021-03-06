exports.up = function (knex) 
{
    return knex.schema
        .createTable("users", (table) => 
        {
            table.increments().notNullable();
            table.string("username", 128).unique().notNullable().index();
            table.string("email", 128).unique().notNullable().index();
            table.string("password").notNullable();
            table.string("validationUrl").notNullable();
            table.boolean("validated").defaultTo(false);
            table.boolean("voted").defaultTo(false);
        })
        .createTable("prompts", (table) => 
        {
            table.increments().notNullable();
            table.string("prompt");
            table.boolean("active").defaultTo(false);
            table.boolean("topThree").defaultTo(false);
            table.boolean("voting").defaultTo(false);
            table.boolean("today").defaultTo(false);
        })
        .createTable("submissions", (table) => 
        {
            table.increments().notNullable();
            table.string("image").index();
            table.boolean("flagged").defaultTo(false);
            table.float("score");
            table.integer("rotation").defaultTo(0);
            table
                .integer("prompt_id")
                .unsigned()
                .references("id")
                .inTable("prompts")
                .onDelete("CASCADE");
            table
                .integer("userId")
                .unsigned()
                .references("id")
                .inTable("users")
                .onDelete("CASCADE");
            table.boolean("active").defaultTo(true);
            table.boolean("topThree").defaultTo(false);
            table.boolean("vote").defaultTo(false);
            table.boolean("voting").defaultTo(false);
        });
};

exports.down = function (knex) 
{
    return knex.schema
        .dropTableIfExists("submissions")
        .dropTableIfExists("prompts")
        .dropTableIfExists("users");
};
