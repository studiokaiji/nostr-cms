import { Schema } from "./services/general/schema";

export const BASIC_RELAYS_KEY = "nostr-cms.basic-relays";
export const HOSTR_RELAYS_KEY = "nostr-cms.hostr-relays";
export const CUSTOM_APP_DATA_RELAYS_KEY = "nostr-cms.app-data-relays";
export const DEFAULT_BASIC_RELAYS = [
  "ws://127.0.0.1:7002",
  // "wss://yabu.me",
  // "wss://relay.damus.io",
  // 'wss://nos.lol',
  // 'wss://relay.snort.social',
];
export const DEFAULT_HOSTR_RELAYS = ["wss://r.hostr.cc"];
export const DEFAULT_CUSTOM_APP_DATA_RELAYS = ["ws://127.0.0.1:7002"];
export const CLIENT = "noscms.pages.dev";
export const RESERVED_CONTENT_TAGS = ["d", "s", "h"];
export const RESERVED_SCHEMA_TAGS = ["d", "title", "t", "articles"];
export const CREATED_AT_VARIABLE = "VAR_CREATED_AT";
export const ARTICLES_SCHEMA: Schema = {
  id: "articles",
  label: "Articles",
  caption: "Normal article's schema",
  type: "",
  kinds: [30023, 30024],
  schema: {
    type: "object",
    properties: {
      image: {
        type: "string",
        format: "uri",
        title: "Image",
        description: "An image URL.",
        input_mode: "image_upload",
      },
      title: {
        type: "string",
        title: "Title",
      },
      summary: {
        type: "string",
        title: "Summary",
      },
      updated_at: {
        type: "integer",
        title: "Updated At",
        input_mode: "auto_populated_updated_at",
      },
      client: {
        type: "string",
        title: "Client",
        input_mode: "auto_populated_client",
      },
      content: {
        type: "string",
        title: "Content",
        input_mode: "markdown",
      },
    },
    required: ["title", "updated_at", "client"],
  },
  write_rule: {
    rule: "only_author",
  },
};
