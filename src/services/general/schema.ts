import { SimplePool, type Event } from "nostr-tools";
import { getCustomAppDataRelays } from "../relay";
import { readyNostr } from "nip07-awaiter";
import { safeParseJson } from "@/utils/safeParseJson";
import { RJSFSchema } from "@rjsf/utils";

const pool = new SimplePool();

export const getSchemas = async (types?: string[], ignoreTypes?: string[]) => {
  const relays = getCustomAppDataRelays();

  const nostr = await readyNostr;
  const pubkey = await nostr.getPublicKey();

  const events = await pool.list(relays, [
    {
      kinds: [10113],
      authors: [pubkey],
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
    kinds: [10113],
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
    ["k", ...schema.kinds.map(String)],
    ["caption", schema.caption || ""],
  ];
  const ev = {
    tags,
    pubkey,
    content: btoa(JSON.stringify(schema.schema)),
    kind: 10113,
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
  schema: SchemaContent;
};

export type SchemaProperties = Omit<RJSFSchema, "title" | "description">;

export type SchemaContent = {
  type: "object";
  properties: SchemaProperties;
  required: string[];
};

const isValidWriteRule = (str: unknown): str is WriteRule => {
  return str === "only_author" || str === "allow_list" || str === "all";
};

const isValidSchemaContent = (
  schemaContent: unknown
): schemaContent is SchemaContent => {
  const c = schemaContent as SchemaContent;
  return c?.type === "object" && !!c?.properties && !!c?.required;
};
