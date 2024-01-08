import { BackButton } from "@/components/BackButton";
import { Flex, Stack, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";

import "@mantine/tiptap/styles.css";

import useSWR from "swr";
import { useNavigate, useParams } from "react-router-dom";
import {
  ContentInput,
  getContentsSchema,
  publishContent,
} from "@/services/content";
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

  const navigate = useNavigate();

  const publish = async (contentInput: ContentInput) => {
    try {
      await publishContent(contentInput);
      navigate(`/contents/${schemaId}`);
    } catch (e) {
      alert(String(e));
    }
  };

  return (
    <Stack>
      <Stack>
        <Flex align="center" gap="xs">
          <BackButton />
          <Title>{t("contents.addContent")}</Title>
        </Flex>
      </Stack>
      {schema && (
        <ContentEditor
          type="content"
          schema={schema}
          onPublishRequest={publish}
        />
      )}
    </Stack>
  );
};
