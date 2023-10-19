import { Button, Title, Stack, Flex } from "@mantine/core";
import useSWR from "swr";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getContents } from "@/services/content";
import { ContentsTable } from "@/components/ContentsTable";
import {
  ContentsTarget,
  ContentsTargetSelect,
} from "@/components/ContentsTargetSelect";
import { ARTICLES_SCHEMA } from "@/consts";

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
      <ContentsTable schema={ARTICLES_SCHEMA} contents={contents} />
    </Stack>
  );
};
