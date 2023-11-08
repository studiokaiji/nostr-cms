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
export const RESERVED_CONTENT_TAGS = ["d", "s", "h"];
export const RESERVED_SCHEMA_TAGS = ["d", "title", "t", "articles"];
export const CREATED_AT_VARIABLE = "VAR_CREATED_AT";
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
      key: "updated_at",
      label: "Updated At",
      type: {
        unit: "single",
        primitive: "updatedAt",
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
export const SITE_SCHEMA: Schema = {
  id: "site",
  label: "Site",
  type: "site",
  fields: [
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
      key: "description",
      label: "Description",
      type: {
        unit: "single",
        primitive: "text",
      },
      userEditable: true,
      optional: true,
    },
    {
      key: "icon",
      label: "Icon",
      type: {
        unit: "single",
        primitive: "image",
      },
      userEditable: true,
      optional: true,
    },
    {
      key: "published",
      label: "Published",
      type: {
        unit: "single",
        primitive: "boolean",
      },
      userEditable: true,
      optional: false,
    },
    {
      key: "design",
      label: "Design",
      type: {
        unit: "single",
        primitive: "selectImageWithText",
        selectable: [
          {
            value: "wakeup",
            label: "Wake Up",
            image:
              "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=720&q=80",
          },
        ],
      },
      userEditable: true,
      optional: false,
    },
    {
      key: "displayComment",
      label: "Display Comment",
      type: {
        unit: "single",
        primitive: "boolean",
      },
      userEditable: true,
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
  content: "never",
};
