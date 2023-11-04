import { SimplePool, type Event } from "nostr-tools";
import { CLIENT, RESERVED_SCHEMA_TAGS } from "@/consts";
import { getCustomAppDataRelays } from "../relay";
import { readyNostr } from "nip07-awaiter";
import { getTable, getSingle, upsertTableOrCreate } from "nostr-key-value";
import { safeParseJson } from "@/utils/safeParseJson";
import { z } from "zod";

const TABLE_KEY = `${CLIENT}/schemas`;

const pool = new SimplePool();

export const getSchemas = async (types?: string[], ignoreTypes?: string[]) => {
  const relays = getCustomAppDataRelays();

  const nostr = await readyNostr;
  const pubkey = await nostr.getPublicKey();

  const table = await getTable(relays, pubkey, TABLE_KEY);
  if (!table) {
    return [];
  }

  let schemas = nostrEventToSchemas(table);
  if (!schemas) {
    return [];
  }

  if (types && types.length) {
    schemas = schemas.filter((schema) => types.includes(schema.type));
  }

  if (ignoreTypes && ignoreTypes.length) {
    schemas = schemas.filter((schema) => !ignoreTypes.includes(schema.type));
  }

  return schemas;
};

export const getSchema = async (schemaId: string) => {
  const relays = getCustomAppDataRelays();

  const nostr = await readyNostr;
  const pubkey = await nostr.getPublicKey();

  const strSchema = await getSingle(relays, pubkey, TABLE_KEY, schemaId);
  if (!strSchema) {
    throw Error("Schema doe not exist.");
  }

  const schema = parseSchema(strSchema, schemaId, pubkey);
  return schema;
};

export const addSchema = async (schema: Schema) => {
  const relays = getCustomAppDataRelays();

  const nostr = await readyNostr;
  const pubkey = await nostr.getPublicKey();

  const tableEv = await upsertTableOrCreate(
    relays,
    pubkey,
    TABLE_KEY,
    "Nostr CMS Schema",
    [],
    [
      [
        schema.id,
        JSON.stringify({
          label: schema.label,
          fields: schema.fields,
          writeRule: schema.writeRule,
          type: schema.type,
          content: schema.content,
        }),
      ],
    ]
  );
  if (tableEv) {
    const signed = await nostr.signEvent(tableEv);
    pool.publish(relays, signed);
  }
};

export type WriteRule = "onlyAuthor" | "allowList" | "all";

export type Schema = {
  id: string;
} & z.infer<typeof schemaRawValueType>;

export const nostrEventToSchemas = (event: Event) => {
  const { tags: rawTags, pubkey } = event;

  const tags = rawTags.filter(
    (tags) => !RESERVED_SCHEMA_TAGS.includes(tags[0])
  );

  const schemas: Schema[] = [];

  for (const tag of tags) {
    const id = tag[0];
    const rawValue = tag[1];

    const parsed = schemaRawValueType.safeParse(safeParseJson(rawValue));
    if (!parsed.success) {
      return null;
    }

    const schema = {
      id,
      pubkey,
      ...parsed.data,
    };

    schemas.push(schema);
  }

  return schemas;
};

export const parseSchema = (str: string, id: string, pubkey: string) => {
  const parsed = schemaRawValueType.safeParse(safeParseJson(str));
  if (!parsed.success) {
    return null;
  }

  const schema = {
    id,
    pubkey,
    ...parsed.data,
  };

  return schema;
};

export type SchemaField = z.infer<typeof schemaRawValueFieldType>;

const schemaRawValueFieldType = z.object({
  key: z.string(),
  label: z.string().optional(),
  type: z.object({
    unit: z.union([z.literal("single"), z.literal("array")]),
    primitive: z.union([
      z.literal("text"),
      z.literal("number"),
      z.literal("boolean"),
      z.literal("date"),
      z.literal("time"),
      z.literal("url"),
      z.literal("image"),
      z.literal("updatedAt"),
      z.literal("selectText"),
      z.literal("selectImageWithText"),
    ]),
    selectable: z
      .array(
        z.object({
          value: z.string(),
          label: z.string().optional(),
          image: z.string().optional(),
        })
      )
      .optional(),
  }),
  userEditable: z.boolean().optional().default(true),
  optional: z.boolean().optional().default(false),
});

const schemaRawValueType = z.object({
  label: z.string(),
  fields: z.array(schemaRawValueFieldType),
  content: z
    .union([z.literal("required"), z.literal("optional"), z.literal("never")])
    .optional()
    .default("optional"),
  writeRule: z.object({
    rule: z.union([
      z.literal("onlyAuthor"),
      z.literal("allowList"),
      z.literal("all"),
    ]),
    pubkeys: z.array(z.string()).optional(),
  }),
  type: z.string(),
});
