import { ContentsTable } from "@/components/ContentsTable";
import {
  ContentsTarget,
  ContentsTargetSelect,
} from "@/components/ContentsTargetSelect";
import { Content, getContents, getContentsSchema } from "@/services/content";
import { Schema } from "@/services/general/schema";
import { ActionIcon, Button, Flex, Stack, Title } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import {
  useSuspenseInfiniteQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { t } from "i18next";
import { readyNostr } from "nip07-awaiter";
import { Suspense, useState } from "react";
import { useParams } from "react-router-dom";

const nostr = await readyNostr;
const pubkey = await nostr.getPublicKey();

const LIMIT = 30;

export const ContentSchemaPage = () => {
  const [articlesTarget, setArticlesTarget] = useState<ContentsTarget>("all");

  return (
    <>
      <Header
        contentsTargetSelect={
          <ContentsTargetSelect
            target={articlesTarget}
            onChange={setArticlesTarget}
          />
        }
      />
      <Suspense>
        <ContentsList articlesTarget={articlesTarget} />
      </Suspense>
    </>
  );
};

const Header = ({
  contentsTargetSelect,
}: {
  contentsTargetSelect: React.ReactNode;
}) => {
  const { schemaId } = useParams();
  if (!schemaId) {
    throw Error();
  }

  const { data: schema } = useSuspenseQuery<Schema>({
    queryKey: ["schemas", schemaId],
    queryFn: async () => {
      const schema = await getContentsSchema(schemaId);
      if (!schema) {
        throw Error("Schema does not exist");
      }
      return schema;
    },
  });

  return (
    <Stack>
      <Title mb="md">{schema.label}</Title>
      <Flex justify="space-between" align="center">
        {contentsTargetSelect}
        <Button component="a" href={`/contents/${schemaId}/add-content`}>
          + {t("contents.addContent")}
        </Button>
      </Flex>
    </Stack>
  );
};

const ContentsList = ({
  articlesTarget,
}: {
  articlesTarget: ContentsTarget;
}) => {
  const { schemaId } = useParams();
  if (!schemaId) {
    throw Error();
  }

  const { data: schema } = useSuspenseQuery<Schema>({
    queryKey: ["schemas", schemaId],
    queryFn: async () => {
      const schema = await getContentsSchema(schemaId);
      if (!schema) {
        throw Error("Schema does not exist");
      }
      return schema;
    },
  });

  const getKey = (
    previousData: Content | null
  ): [string, ContentsTarget, Content | null, number] => {
    return [`contents/${schema.id}`, articlesTarget, previousData, LIMIT];
  };

  const {
    data: contents,
    isLoading,
    hasPreviousPage,
    hasNextPage,
    fetchPreviousPage,
    fetchNextPage,
  } = useSuspenseInfiniteQuery({
    queryKey: getKey(null),
    queryFn: ({ pageParam }) => {
      const query = { target: articlesTarget };
      const filter = {
        authors:
          schema?.write_rule.rule === "allow_list"
            ? schema?.write_rule.allow_list
            : schema!.write_rule.rule === "only_author"
            ? [pubkey]
            : undefined,
        "#s": schemaId === "articles" ? undefined : [schemaId],
        limit: LIMIT,
        since: pageParam,
      };
      return getContents(query, filter);
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.length < LIMIT) return undefined;
      return lastPage.slice(-1)[0].event.created_at;
    },
    initialPageParam: 0,
  });

  return (
    <>
      <ContentsTable schema={schema} contents={contents?.pages.flat()} />
      <Flex gap="xs" mt="md">
        <ActionIcon
          variant="light"
          disabled={!hasPreviousPage || isLoading}
          onClick={() => fetchPreviousPage()}
        >
          <IconChevronLeft />
        </ActionIcon>
        <ActionIcon
          variant="light"
          disabled={!hasNextPage || isLoading}
          onClick={() => fetchNextPage()}
        >
          <IconChevronRight />
        </ActionIcon>
      </Flex>
    </>
  );
};
