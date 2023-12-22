import { ContentsTable } from "@/components/ContentsTable";
import {
  ContentsTarget,
  ContentsTargetSelect,
} from "@/components/ContentsTargetSelect";
import { Content, getContents, getContentsSchema } from "@/services/content";
import { Schema } from "@/services/general/schema";
import { ActionIcon, Button, Flex, Stack, Title } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { readyNostr } from "nip07-awaiter";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import useSWR from "swr";
import useSWRInfinite from "swr/infinite";

const nostr = await readyNostr;
const pubkey = await nostr.getPublicKey();

const LIMIT = 30;

export const ContentSchemaPage = () => {
  const { schemaId } = useParams();
  if (!schemaId) {
    throw Error();
  }

  const { data: schema } = useSWR(schemaId, getContentsSchema, {
    keepPreviousData: true,
  });

  const [articlesTarget, setArticlesTarget] = useState<ContentsTarget>("all");

  const getKey = (
    _: number,
    previousData: Content[] | null
  ): [string, Schema, ContentsTarget, Content[] | null, number] | null => {
    if (!schema || (previousData && !previousData.length)) return null;
    return [
      `contents/${schemaId}`,
      schema,
      articlesTarget,
      previousData,
      LIMIT,
    ];
  };

  const {
    data: contents,
    isLoading,
    size,
    setSize,
  } = useSWRInfinite(
    getKey,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ([_url, schema, target, prev, limit]) =>
      getContents(
        { target },
        {
          authors:
            schema.write_rule.rule === "allow_list"
              ? schema?.write_rule.allow_list
              : schema!.write_rule.rule === "only_author"
              ? [pubkey]
              : undefined,
          "#s": schemaId === "articles" ? undefined : [schemaId],
          limit,
          until:
            prev && prev.length
              ? prev.slice(-1)[0].event.created_at
              : undefined,
        }
      )
  );

  const { t } = useTranslation();

  if (!schema || !contents) {
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
      <ContentsTable schema={schema} contents={contents[size - 1]} />
      <Flex gap="xs">
        <ActionIcon
          variant="light"
          disabled={size <= 1 || isLoading}
          onClick={() => setSize((size) => size - 1)}
        >
          <IconChevronLeft />
        </ActionIcon>
        <ActionIcon
          variant="light"
          disabled={contents[size - 1]?.length < LIMIT || isLoading}
          onClick={() => setSize((size) => size + 1)}
        >
          <IconChevronRight />
        </ActionIcon>
      </Flex>
    </Stack>
  );
};
