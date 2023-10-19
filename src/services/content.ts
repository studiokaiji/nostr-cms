import { Filter, SimplePool } from "nostr-tools";
import { getSchema, getSchemas } from "./general/schema";
import { getBasicRelays } from "./relay";
import { type Event, type UnsignedEvent } from "nostr-tools";
import { CLIENT, RESERVED_CONTENT_TAGS } from "@/consts";

const pool = new SimplePool();

type ContentsQuery = {
  target?: "draft" | "published" | "all";
};

export const getContents = async (
  query: ContentsQuery = {},
  filter: Filter = {}
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

export const getAllContentsSchemas = () => getSchemas([], ["s"]);

export type ContentFields = { [key: string]: string[] };
export type Content = {
  id: string;
  fields: ContentFields;
  content: string;
  isDraft: boolean;
  event: Event;
  pubkey: string;
  schemaId: string;
  sites: string[];
};

export type ContentInput = Omit<Content, "event">;

export const nostrEventToContent = (event: Event): Content => {
  if (event.kind !== 30023 && event.kind === 30024) {
    throw Error("Invalid event kind");
  }

  const dTag = event.tags.find((tags) => tags[0] === "d")?.[1];
  if (!dTag) {
    throw Error("Content id(d tag) is not found");
  }
  const schemaId = event.tags.find((tags) => tags[0] === "s")?.[1] || "";

  let sites = event.tags.find((tags) => tags[0] === "o")?.slice(1);
  if (!sites || sites.length < 1) {
    sites = ["*"];
  }

  const fields: ContentFields = {};

  for (const tag of event.tags) {
    if (RESERVED_CONTENT_TAGS.includes(tag[0])) {
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
  contentInput: ContentInput
): UnsignedEvent => {
  const tags: string[][] = [];

  tags.push(["d", contentInput.id]);
  tags.push(["s", contentInput.schemaId]);
  tags.push(["client", CLIENT]);

  if (contentInput.sites) {
    tags.push(["o", ...contentInput.sites]);
  }

  Object.entries(contentInput.fields).forEach(([key, value]) => {
    // Convert value to string for tag
    let tagValue: string;
    if (typeof value === "boolean") {
      tagValue = value ? "true" : "false";
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
    pubkey: contentInput.pubkey,
  };
};

export type WriteContentVariables = {
  content: ContentInput;
};
