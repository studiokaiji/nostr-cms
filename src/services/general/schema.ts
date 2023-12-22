import { SimplePool, type Event } from "nostr-tools";
import { getCustomAppDataRelays } from "../relay";
import { readyNostr } from "nip07-awaiter";
import { safeParseJson } from "@/utils/safeParseJson";

const pool = new SimplePool();

export const getSchemas = async (types?: string[], ignoreTypes?: string[]) => {
  const relays = getCustomAppDataRelays();

  const nostr = await readyNostr;
  const pubkey = await nostr.getPublicKey();

  const events = await pool.list(relays, [
    {
      kinds: [1064, 1065],
      authors: [pubkey],
      "#g": ["schema"],
    },
  ]);

  const validEvents = events.filter(({ tags }) => {
    const type = tags.find(([key]) => key === "type");
    if (!type) {
      return false;
    }

    if (ignoreTypes && ignoreTypes.includes(type[1])) {
      return false;
    }

    if (types) {
      if (types.includes(type[1])) {
        return true;
      }
      return false;
    }

    return true;
  });

  const schemas: Schema[] = [];
  validEvents.forEach((ev) => {
    try {
      schemas.push(eventToSchema(ev));
    } catch (e) {
      e;
    }
  });

  return schemas;
};

export const getSchema = async (id: string): Promise<Schema | null> => {
  const relays = getCustomAppDataRelays();

  const event = await pool.get(relays, {
    ids: [id],
    kinds: [1064, 1065],
    "#g": ["schema"],
  });

  if (!event) {
    return null;
  }

  try {
    return eventToSchema(event);
  } catch (e) {
    return null;
  }
};

const eventToSchema = (event: Event) => {
  const schema: Partial<Schema> = {};

  event.tags.forEach((tag) => {
    const [key, value] = tag;

    if (key === "g" && value !== "schema") {
      throw Error("Invalid Schema");
    }

    switch (key) {
      case "type":
        schema.type = value;
        break;
      case "label":
        schema.label = value;
        break;
      case "write_rule":
        isValidWriteRule(value)
          ? (schema.write_rule = {
              rule: value,
              allow_list:
                value === "allow_list" && tag.length > 2 ? tag.slice(2) : [],
            })
          : null;
        break;
      case "kinds":
        schema.kinds = tag.slice(1).map((k) => parseInt(k));
        break;
      case "caption":
        schema.caption = value;
        break;
    }
  });

  schema.type ??= "";
  schema.label ??= "";
  schema.write_rule ??= {
    rule: "only_author",
    allow_list: [],
  };
  schema.caption ??= "";

  const parsed = safeParseJson(atob(event.content));
  if (!isValidSchemaContent(parsed)) {
    throw Error("Invalid Schema");
  }
  schema.schema = parsed;

  return schema as Schema;
};

export const addSchema = async (schema: Omit<Schema, "id">) => {
  const relays = getCustomAppDataRelays();

  const nostr = await readyNostr;
  const pubkey = await nostr.getPublicKey();

  const tags = [
    ["type", schema.type],
    ["label", schema.label],
    [
      "write_rule",
      schema.write_rule.rule,
      ...(schema.write_rule.allow_list || []),
    ],
    ["kinds", ...schema.kinds.map(String)],
    ["caption", schema.caption || ""],
    ["g", "schema"],
  ];
  const ev = {
    tags,
    pubkey,
    content: btoa(JSON.stringify(schema.schema)),
    kind: 1064,
    created_at: Math.floor(Date.now() / 1000),
  };

  const signed = await nostr.signEvent(ev);

  await Promise.allSettled(pool.publish(relays, signed));
};

export type WriteRule = "only_author" | "allow_list" | "all";

export type Schema = {
  id: string;
  label: string;
  kinds: number[];
  write_rule: {
    rule: WriteRule;
    allow_list?: string[];
  };
  type: string;
  caption: string;
  schema: SchemaProperties;
};

export type SchemaProperties = Record<string | number, unknown>;

export type RawSchemaContent = {
  type: "object";
  properties: SchemaProperties;
};

const isValidWriteRule = (str: unknown): str is WriteRule => {
  return str === "only_author" || str === "allow_list" || str === "all";
};

const isValidSchemaContent = (
  schemaContent: unknown
): schemaContent is RawSchemaContent => {
  const c = schemaContent as RawSchemaContent;
  return c?.type === "object" && !!c?.properties;
};
