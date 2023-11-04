import { readyNostr } from "nip07-awaiter";
import { type UnsignedEvent } from "nostr-tools";

const UPLOAD_ENDPOINT = "https://nostrcheck.me/api/v1/media";

type MediaResult = {
  result: boolean;
  description: string;
  status: string;
  id: string;
  pubkey: string;
  url: string;
  hash: string;
  magnet: string;
  tags: string[];
};

export const uploadImage = async (imageObjectUrl: string) => {
  const nostr = await readyNostr;
  const pubkey = await nostr.getPublicKey();

  const event: UnsignedEvent = {
    kind: 27235,
    tags: [
      ["u", UPLOAD_ENDPOINT],
      ["method", "POST"],
      ["payload", ""],
    ],
    content: "",
    pubkey,
    created_at: Math.floor(Date.now() / 1000),
  };

  const signed = await nostr.signEvent(event);

  console.log(signed);

  const signedBase64 = btoa(JSON.stringify(signed));
  const authorization = `Nostr ${signedBase64}`;

  const formData = new FormData();
  formData.append("mediafile", await (await fetch(imageObjectUrl)).blob());
  formData.append("uploadtype", "media");

  const res = await fetch(UPLOAD_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: authorization,
      Accept: "application/json",
    },
    body: formData,
  });

  if (!res.ok) {
    throw Error("Image upload failed.");
  }

  const resJson: MediaResult = await res.json();
  if (!resJson.result) {
    throw Error("Image upload failed.");
  }

  return resJson.url;
};
