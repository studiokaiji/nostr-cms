import {
  getSchema,
  getSchemas,
  Schema,
  type SchemaProperties,
} from "./general/schema";
import { getBasicRelays } from "./relay";
import {
  SimplePool,
  Filter,
  type Event,
  type UnsignedEvent,
} from "nostr-tools";
import {
  ARTICLES_SCHEMA,
  CLIENT,
  CREATED_AT_VARIABLE,
  RESERVED_CONTENT_TAGS,
} from "@/consts";
import { readyNostr } from "nip07-awaiter";

const pool = new SimplePool();

type ContentsQuery = {
  target?: "draft" | "published" | "all";
};

export const getContents = async (
  query: ContentsQuery = {},
  filter: Filter
) => {
  const relays = getBasicRelays();

  const events = await pool.list(relays, [
    {
      ...filter,
      kinds:
        query?.target === "published"
          ? [30023]
          : query?.target === "draft"
          ? [30024]
          : [30023, 30024],
    },
  ]);

  const contents = events
    .map(safeNostrEventToContent)
    .filter((c) => c) as Content[];

  return contents;
};

export const getContentsSchema = async (schemaId: string) => {
  if (schemaId === "articles") {
    return ARTICLES_SCHEMA;
  }
  const schema = await getSchema(schemaId);
  return schema;
};

export const getContent = async (contentId: string) => {
  const relays = getBasicRelays();

  const event = await pool.get(relays, {
    kinds: [30023, 30024],
    "#d": [contentId],
  });

  if (!event) {
    return null;
  }

  const content = safeNostrEventToContent(event);
  return content;
};

export const getAllContentsSchemas = () => getSchemas([], ["h"]);

export type ContentFields = { [key: string]: string[] };
export type Content = {
  id: string;
  fields: ContentFields;
  content: string;
  isDraft: boolean;
  event: Event;
  pubkey: string;
  schemaId?: string;
  sites: string[];
};

export type ContentInput = Omit<Content, "event" | "pubkey">;

export const nostrEventToContent = (event: Event): Content => {
  if (event.kind !== 30023 && event.kind !== 30024) {
    throw Error("Invalid event kind");
  }

  const dTag = event.tags.find((tags) => tags[0] === "d")?.[1];
  if (!dTag) {
    throw Error("Content id(d tag) is not found");
  }
  const schemaId = event.tags.find((tags) => tags[0] === "s")?.[1] || undefined;

  let sites = event.tags.find((tags) => tags[0] === "h")?.slice(1);
  if (!sites || sites.length < 1) {
    sites = ["*"];
  }

  const fields: ContentFields = {};

  for (const tag of event.tags) {
    if (RESERVED_CONTENT_TAGS.includes(tag[0])) {
      continue;
    }

    if (tag[1] === CREATED_AT_VARIABLE) {
      fields[tag[0]] = [String(event.created_at)];
      continue;
    }

    fields[tag[0]] = tag.slice(1);
  }

  return {
    id: dTag,
    fields,
    content: event.content,
    isDraft: event.kind === 30024,
    event,
    pubkey: event.pubkey,
    schemaId,
    sites,
  };
};

export const safeNostrEventToContent = (event: Event): Content | null => {
  try {
    return nostrEventToContent(event);
  } catch {
    return null;
  }
};

export const contentInputToNostrEvent = (
  contentInput: ContentInput,
  pubkey: string
): UnsignedEvent => {
  const tags: string[][] = [];

  tags.push(["d", contentInput.id]);
  tags.push(["client", CLIENT]);

  if (contentInput.schemaId) {
    tags.push(["s", contentInput.schemaId]);
  }

  if (contentInput.sites) {
    tags.push(["h", ...contentInput.sites]);
  }

  Object.entries(contentInput.fields).forEach(([key, value]) => {
    // Convert value to string for tag
    let tagValue: string;
    if (typeof value === "boolean") {
      tagValue = value ? "true" : "false";
    } else if (typeof value === "undefined" || value === null) {
      tagValue = "";
    } else {
      tagValue = String(value);
    }
    tags.push([key, tagValue]);
  });

  return {
    kind: contentInput.isDraft ? 30024 : 30023,
    tags,
    content: contentInput.content,
    created_at: Math.floor(Date.now() / 1000),
    pubkey,
  };
};

export const publishContent = async (contentInput: ContentInput) => {
  const relays = getBasicRelays();
  const nostr = await readyNostr;

  const pubkey = await nostr.getPublicKey();

  const event = contentInputToNostrEvent(contentInput, pubkey);
  const signed = await nostr.signEvent(event);

  await Promise.allSettled(pool.publish(relays, signed));
};

export const removeContent = async (content: Content) => {
  const relays = getBasicRelays();
  const nostr = await readyNostr;

  const pubkey = await nostr.getPublicKey();

  const event: UnsignedEvent = {
    kind: 5,
    content: "",
    tags: [["e", content.event.id]],
    pubkey,
    created_at: Math.floor(Date.now() / 1000),
  };
  const signed = await nostr.signEvent(event);

  await Promise.allSettled(pool.publish(relays, signed));
};

export const autoPopulateDataFromSchema = (schema: SchemaProperties) => {
  try {
    const data: Record<string, unknown> = {};

    const properties = schema.properties as Record<
      string,
      Record<string, unknown>
    >;
    if (!properties) return data;

    const searchProperties = (
      properties: Record<string, Record<string, unknown>>,
      baseKey: string
    ) => {
      for (const key of Object.keys(properties)) {
        const item = properties[key];

        const inputMode = item.input_mode;

        let value: string | number | boolean | object | null | undefined = "";

        switch (inputMode) {
          case "auto_populated_updated_at":
            value = Math.floor(Date.now() / 1000);
            break;
          case "auto_populated_client":
            value = CLIENT;
        }

        if (!value && !item.format) {
          switch (item.type) {
            case "array":
              value = [];
              break;
            case "object":
              value = {};
              break;
            case "string":
              value = "";
              break;
            case "integer":
              value = 0;
              break;
            case "boolean":
              value = false;
              break;
            case "null":
              value = null;
              break;
            default:
              value = "";
          }
        } else if (!value) {
          value = undefined;
        }

        const dataKey = `${baseKey ? `${baseKey}.` : ""}${key}`;
        data[dataKey] = value;

        if (item.properties) {
          // ネストされたプロパティが存在する場合は再帰的に探索
          searchProperties(
            item.properties as Record<string, Record<string, unknown>>,
            key
          );
        }
      }
    };

    searchProperties(properties, "");

    return data;
  } catch (e) {
    return {};
  }
};

type ContentValue = {
  [key in string]:
    | string
    | boolean
    | number
    | Record<string | number, ContentValue>
    | Array<unknown>;
};

export const parseContentValue = (content: Content, schema: Schema) => {
  const contentValue: ContentValue = {};

  for (const [key, property] of Object.entries(
    schema.schema.properties as Record<
      string | number,
      Record<string | number, unknown>
    >
  )) {
    const field = content.fields?.[key];
    if (!field) {
      continue;
    }

    switch (property?.type) {
      case "array" || "object":
        contentValue[key] = field[0];
        break;
      case "integer":
        contentValue[key] = Number(field[0]);
        break;
      case "boolean":
        contentValue[key] = field[0].toLowerCase() === "true";
        break;
      default:
        contentValue[key] = field;
        break;
    }
  }

  if (content.content) {
    contentValue["content"] = content.content;
  }

  return contentValue;
};
