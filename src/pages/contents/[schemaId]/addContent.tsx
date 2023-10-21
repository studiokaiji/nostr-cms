import { BackButton } from "@/components/BackButton";
import { Flex, Stack, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";

import "@mantine/tiptap/styles.css";

import useSWR from "swr";
import { useParams } from "react-router-dom";
import { getContentsSchema, publishContent } from "@/services/content";
import { ContentEditor } from "@/components/ContentEditor";

export const AddContentPage = () => {
  const { schemaId } = useParams();
  if (!schemaId) {
    throw Error();
  }

  const { data: schema } = useSWR(schemaId, getContentsSchema, {
    keepPreviousData: true,
  });

  const { t } = useTranslation();

  return (
    <Stack>
      <Stack>
        <Flex align="center" gap="xs">
          <BackButton />
          <Title>{t("contents.addContent")}</Title>
        </Flex>
      </Stack>
      {schema && <ContentEditor schema={schema} onPublish={publishContent} />}
    </Stack>
  );
};
