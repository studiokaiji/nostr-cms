import { BackButton } from "@/components/BackButton";
import { ContentEditor } from "@/components/ContentEditor";
import {
  getContentsSchema,
  ContentInput,
  publishContent,
  getContent,
  removeContent,
} from "@/services/content";
import {
  Stack,
  Flex,
  Title,
  Button,
  Modal,
  Text,
  useMantineTheme,
  Box,
} from "@mantine/core";
import useSWR from "swr";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { IconAlertHexagonFilled, IconTrashX } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";

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

  const remove = async () => {
    try {
      if (!content) return;
      await removeContent(content);
      navigate(`/contents/${schemaId}`);
    } catch (e) {
      alert(String(e));
    }
  };

  return (
    <Stack>
      <Flex align="center" justify="space-between">
        <Flex align="center" gap="xs">
          <BackButton />
          <Title>{t("contents.editContent")}</Title>
        </Flex>
        <RemoveButton remove={remove} />
      </Flex>
      {schema && content && (
        <ContentEditor
          schema={schema}
          content={content}
          type="content"
          onPublishRequest={publish}
        />
      )}
    </Stack>
  );
};

const RemoveButton = ({ remove }: { remove: () => void }) => {
  const { t } = useTranslation();

  const [opened, { open, close }] = useDisclosure(false);

  const theme = useMantineTheme();

  return (
    <>
      <Modal opened={opened} onClose={close} centered withCloseButton={false}>
        <Stack>
          <Box>
            <IconAlertHexagonFilled
              style={{ color: theme.colors.red[7] }}
              size={36}
            />
            <Title order={2}>{t("contents.removeConfirmation")}</Title>
          </Box>
          <Text>{t("contents.removeConfirmationMessage")}</Text>
          <Flex gap="xs">
            <Button color="gray" variant="light" onClick={close}>
              {t("contents.cancel")}
            </Button>
            <Button color="red" onClick={remove}>
              {t("contents.remove")}
            </Button>
          </Flex>
        </Stack>
      </Modal>
      <Button
        color="red"
        variant="light"
        leftSection={<IconTrashX size={18} />}
        onClick={open}
      >
        {t("contents.remove")}
      </Button>
    </>
  );
};
