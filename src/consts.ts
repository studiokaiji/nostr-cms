import { Schema } from "./services/general/schema";

export const BASIC_RELAYS_KEY = "nostr-cms.basic-relays";
export const HOSTR_RELAYS_KEY = "nostr-cms.hostr-relays";
export const CUSTOM_APP_DATA_RELAYS_KEY = "nostr-cms.app-data-relays";
export const DEFAULT_BASIC_RELAYS = [
  "ws://127.0.0.1:7002",
  // 'wss://yabu.me',
  // 'wss://relay.damus.io',
  // 'wss://nos.lol',
  // 'wss://relay.snort.social',
];
export const DEFAULT_HOSTR_RELAYS = ["wss://r.hostr.cc"];
export const DEFAULT_CUSTOM_APP_DATA_RELAYS = ["ws://127.0.0.1:7002"];
export const CLIENT = "noscms.pages.dev";
export const RESERVED_CONTENT_TAGS = ["d", "s", "o"];
export const RESERVED_SCHEMA_TAGS = ["d", "title", "t", "articles"];
export const ARTICLES_SCHEMA: Schema = {
  id: "articles",
  label: "Articles",
  type: "",
  fields: [
    {
      key: "image",
      label: "Image",
      type: {
        unit: "single",
        primitive: "image",
      },
      userEditable: true,
      optional: true,
    },
    {
      key: "title",
      label: "Title",
      type: {
        unit: "single",
        primitive: "text",
      },
      userEditable: true,
      optional: false,
    },
    {
      key: "summary",
      label: "Summary",
      type: {
        unit: "single",
        primitive: "text",
      },
      userEditable: true,
      optional: true,
    },
    {
      key: "published_at",
      label: "Published",
      type: {
        unit: "single",
        primitive: "date",
      },
      userEditable: false,
      optional: false,
    },
    {
      key: "client",
      label: "Client",
      type: {
        unit: "single",
        primitive: "url",
      },
      userEditable: false,
      optional: false,
    },
  ],
  writeRule: {
    rule: "onlyAuthor",
  },
  content: "optional",
};
