import { Knex } from "knex";

import { TableName } from "../schemas";
import { createOnUpdateTrigger } from "../utils";

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable(TableName.UserSecret))) {
    await knex.schema.createTable(TableName.UserSecret, (t) => {
      t.uuid("id", { primaryKey: true }).defaultTo(knex.fn.uuid());
      t.string("secretType").notNullable();
      t.string("secretName").notNullable();
      t.string("username");
      t.string("password");
      t.string("cardholderName");
      t.string("cardNumber");
      t.string("cardExpirationDate");
      t.string("cardSecurityCode");
      t.string("title");
      t.string("content");
      t.string("additionalNotes");
      t.uuid("userId").notNullable();
      t.uuid("orgId").notNullable();
      t.foreign("userId").references("id").inTable(TableName.Users).onDelete("CASCADE");
      t.foreign("orgId").references("id").inTable(TableName.Organization).onDelete("CASCADE");
      t.timestamps(true, true, true);
    });

    await createOnUpdateTrigger(knex, TableName.UserSecret);
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists(TableName.UserSecret);
}
