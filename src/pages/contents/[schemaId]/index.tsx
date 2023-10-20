import { ContentsTable } from "@/components/ContentsTable";
import {
  ContentsTarget,
  ContentsTargetSelect,
} from "@/components/ContentsTargetSelect";
import { getContents, getContentsSchema } from "@/services/content";
import { Button, Flex, Stack, Title } from "@mantine/core";
import { readyNostr } from "nip07-awaiter";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import useSWR from "swr";

const nostr = await readyNostr;
const pubkey = await nostr.getPublicKey();

export const ContentSchemaPage = () => {
  const { schemaId } = useParams();
  if (!schemaId) {
    throw Error();
  }

  const { data: schema } = useSWR(schemaId, getContentsSchema, {
    keepPreviousData: true,
  });

  const [articlesTarget, setArticlesTarget] = useState<ContentsTarget>("all");

  const { data: contents } = useSWR(
    schema ? [`contents/${schemaId}`, articlesTarget] : null,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ([_url, target]) =>
      getContents(
        { target },
        {
          authors:
            schema!.writeRule.rule === "allowList"
              ? schema?.writeRule.pubkeys
              : schema!.writeRule.rule === "onlyAuthor"
              ? [pubkey]
              : undefined,
          "#s": schemaId === "articles" ? undefined : [schemaId],
        }
      )
  );

  const { t } = useTranslation();

  if (!schema) {
    return <div />;
  }

  return (
    <Stack>
      <Title>{schema.label}</Title>
      <Flex justify="space-between" align="center">
        <ContentsTargetSelect
          target={articlesTarget}
          onChange={setArticlesTarget}
        />
        <Button component="a" href={`/contents/${schemaId}/add-content`}>
          + {t("contents.addContent")}
        </Button>
      </Flex>
      <ContentsTable schema={schema} contents={contents} />
    </Stack>
  );
};
