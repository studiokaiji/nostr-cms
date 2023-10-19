import { Button, Title, Stack, Flex } from "@mantine/core";
import useSWR from "swr";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Schema } from "@/services/general/schema";
import { getContents } from "@/services/content";
import { ContentsTable } from "@/components/ContentsTable";
import {
  ContentsTarget,
  ContentsTargetSelect,
} from "@/components/ContentsTargetSelect";

const schema: Schema = {
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
      optional: false,
    },
    {
      key: "title",
      label: "Title",
      type: {
        unit: "single",
        primitive: "string",
      },
      userEditable: true,
      optional: false,
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
};

export const ArticlesPage = () => {
  const [articlesTarget, setArticlesTarget] = useState<ContentsTarget>("all");

  const { data: contents } = useSWR(
    ["contents/articles", articlesTarget],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ([_url, target]) => getContents({ target })
  );

  const { t } = useTranslation();
  return (
    <Stack>
      <Title>{t("contents.articles")}</Title>
      <Flex justify="space-between" align="center">
        <ContentsTargetSelect
          target={articlesTarget}
          onChange={setArticlesTarget}
        />
        <Button>+ {t("contents.addContent")}</Button>
      </Flex>
      <ContentsTable schema={schema} contents={contents} />
    </Stack>
  );
};
