import { BackButton } from "@/components/BackButton";
import { Flex, Stack, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";

import { useNavigate, useParams } from "react-router-dom";
import {
  ContentInput,
  getContentsSchema,
  publishContent,
} from "@/services/content";
import { ContentEditor } from "@/components/ContentEditor";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { Schema } from "@/services/general/schema";

import "@mantine/tiptap/styles.css";

export const AddContentPage = () => {
  const { schemaId } = useParams();
  if (!schemaId) {
    throw Error();
  }

  const { data: schema } = useSuspenseQuery<Schema>({
    queryKey: ["schema", schemaId],
    queryFn: async () => {
      const schema = await getContentsSchema(schemaId);
      if (!schema) {
        throw Error("Schema does not exist");
      }
      return schema;
    },
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
      {schema && <ContentEditor schema={schema} onPublishRequest={publish} />}
    </Stack>
  );
};
