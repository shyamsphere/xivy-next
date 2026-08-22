import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260822171012 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "device_model" drop constraint if exists "device_model_brand_id_name_unique";`);
    this.addSql(`alter table if exists "device_model" drop constraint if exists "device_model_handle_unique";`);
    this.addSql(`alter table if exists "device_brand" drop constraint if exists "device_brand_handle_unique";`);
    this.addSql(`create table if not exists "device_brand" ("id" text not null, "name" text not null, "handle" text not null, "logo_url" text null, "rank" integer not null default 0, "is_active" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "device_brand_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_device_brand_handle_unique" ON "device_brand" ("handle") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_device_brand_deleted_at" ON "device_brand" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "device_model" ("id" text not null, "name" text not null, "handle" text not null, "display_name" text null, "release_year" integer null, "aliases" jsonb null, "is_active" boolean not null default true, "brand_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "device_model_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_device_model_handle_unique" ON "device_model" ("handle") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_device_model_brand_id" ON "device_model" ("brand_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_device_model_deleted_at" ON "device_model" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_device_model_brand_id_name_unique" ON "device_model" ("brand_id", "name") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "device_model" add constraint "device_model_brand_id_foreign" foreign key ("brand_id") references "device_brand" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "device_model" drop constraint if exists "device_model_brand_id_foreign";`);

    this.addSql(`drop table if exists "device_brand" cascade;`);

    this.addSql(`drop table if exists "device_model" cascade;`);
  }

}
