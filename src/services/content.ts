import { SimplePool } from "nostr-tools";
import { getSchema, getSchemas } from "./general/schema";
import { getBasicRelays } from "./relay";
import { type Event, type UnsignedEvent } from "nostr-tools";
import {
  ARTICLES_SCHEMA,
  CLIENT,
  CREATED_AT_VARIABLE,
  RESERVED_CONTENT_TAGS,
} from "@/consts";
import { readyNostr } from "nip07-awaiter";
import { FetchFilter, NostrFetcher } from "nostr-fetch";
import { simplePoolAdapter } from "@nostr-fetch/adapter-nostr-tools";

const pool = new SimplePool();
const fetcher = NostrFetcher.withCustomPool(simplePoolAdapter(pool));

type ContentsQuery = {
  target?: "draft" | "published" | "all";
  limit?: number;
  lastEventTimestamp?: number;
};

export const getContents = async (
  query: ContentsQuery = {},
  filter: FetchFilter
) => {
  const relays = getBasicRelays();

  const events = await fetcher.fetchAllEvents(
    relays,
    /* filter */
    {
      ...filter,
      kinds:
        query?.target === "published"
          ? [30023]
          : query?.target === "draft"
          ? [30024]
          : [30023, 30024],
    },
    /* time range filter */
    { since: query.lastEventTimestamp || 0 },
    /* fetch options (optional) */
    { sort: true }
  );

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

  const event = await fetcher.fetchLastEvent(relays, {
    kinds: [30023, 30024],
    "#d": [contentId],
  });

  if (!event) {
    return null;
  }

  const content = safeNostrEventToContent(event);
  return content;
};

export const getAllContentsSchemas = () => getSchemas([], ["o"]);

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

export type ContentInput = Omit<Content, "event">;

export const nostrEventToContent = (event: Event): Content => {
  if (event.kind !== 30023 && event.kind === 30024) {
    throw Error("Invalid event kind");
  }

  const dTag = event.tags.find((tags) => tags[0] === "d")?.[1];
  if (!dTag) {
    throw Error("Content id(d tag) is not found");
  }
  const schemaId = event.tags.find((tags) => tags[0] === "s")?.[1] || undefined;

  let sites = event.tags.find((tags) => tags[0] === "o")?.slice(1);
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
  contentInput: ContentInput
): UnsignedEvent => {
  const tags: string[][] = [];

  tags.push(["d", contentInput.id]);
  tags.push(["client", CLIENT]);

  if (contentInput.schemaId) {
    tags.push(["s", contentInput.schemaId]);
  }

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

export const publishContent = async (contentInput: ContentInput) => {
  const relays = getBasicRelays();
  const nostr = await readyNostr;

  const event = contentInputToNostrEvent(contentInput);
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
    tags: [
      ["e", content.event.id],
      ["a", `30023:${pubkey}:${content.id}`],
      ["a", `30024:${pubkey}:${content.id}`],
    ],
    pubkey,
    created_at: Math.floor(Date.now() / 1000),
  };
  const signed = await nostr.signEvent(event);

  await Promise.allSettled(pool.publish(relays, signed));
};
