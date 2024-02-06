import { type UnsignedEvent, SimplePool } from "nostr-tools";
import { readyNostr } from "nip07-awaiter";

export type SiteSettings = {
  id: string;
  title: string;
  description: string;
  icon: string;
  displayOnlyAssignedContents: boolean;
  theme: string; // naddr
};

const pool = new SimplePool();

const idToDTag = (id: string) => `site-settings.${id}`;

export const setSite = async ({
  id,
  theme,
  title,
  description,
  icon,
  displayOnlyAssignedContents,
}: SiteSettings) => {
  const signer = await readyNostr;

  const ev: UnsignedEvent = {
    kind: 30078,
    tags: [
      ["d", idToDTag(id)],
      ["title", title],
      ["description", description],
      ["icon", icon],
      ["theme", theme],
      ["display_only_assigned_contents", String(displayOnlyAssignedContents)],
    ],
    content: "",
    pubkey: await signer.getPublicKey(),
    created_at: Math.floor(Date.now() / 1000),
  };

  const signed = await signer.signEvent(ev);
};

export const createSite = setSite;
