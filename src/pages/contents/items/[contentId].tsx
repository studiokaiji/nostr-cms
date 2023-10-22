import { BackButton } from "@/components/BackButton";
import { ContentEditor } from "@/components/ContentEditor";
import {
  getContentsSchema,
  ContentInput,
  publishContent,
  getContent,
} from "@/services/content";
import { Stack, Flex, Title } from "@mantine/core";
import useSWR from "swr";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";

export const EditContentPage = () => {
  const { schemaId, contentId } = useParams();
  if (!schemaId || !contentId) {
    throw Error();
  }

  const { data: schema } = useSWR(schemaId, getContentsSchema, {
    keepPreviousData: true,
  });

  const { data: content } = useSWR(
    [schemaId, contentId],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ([_, id]) => getContent(id),
    {
      keepPreviousData: true,
    }
  );

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
      <Flex align="center" gap="xs">
        <BackButton />
        <Title>{t("contents.editContent")}</Title>
      </Flex>
      {schema && content && (
        <ContentEditor schema={schema} content={content} onPublish={publish} />
      )}
    </Stack>
  );
};
