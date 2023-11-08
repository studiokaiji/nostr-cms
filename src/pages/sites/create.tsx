import { BackButton } from "@/components/BackButton";
import { ContentEditor } from "@/components/ContentEditor";
import { SITE_SCHEMA } from "@/consts";
import { Flex, Stack, Title } from "@mantine/core";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export const CreateSitePage = () => {
  const { t } = useTranslation();

  const [template, setTemplate] = useState("");

  return (
    <Stack>
      <Flex align="center" gap="xs">
        <BackButton />
        <Title>{t("sites.createNewSite")}</Title>
      </Flex>
      {template ? (
        <div />
      ) : (
        <ContentEditor
          schema={SITE_SCHEMA}
          onPublish={console.log}
          imageDropzone={{
            icon: {
              width: 120,
              height: 120,
            },
          }}
        />
      )}
    </Stack>
  );
};
