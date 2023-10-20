import { BackButton } from "@/components/BackButton";
import { Box, Flex, Stack, TextInput, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";

import "@mantine/tiptap/styles.css";

import { RichTextEditor, Link } from "@mantine/tiptap";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";

import { createFormContext, useForm } from "@mantine/form";

Markdown.configure({
  html: false,
});

export const AddContentPage = () => {
  const { t } = useTranslation();

  const editor = useEditor({
    content: "",
    extensions: [StarterKit, Link, Markdown],
  });

  const form = useForm();

  return (
    <Stack>
      <Flex align="center" gap="xs">
        <BackButton />
        <Title>{t("contents.addContent")}</Title>
      </Flex>
      <form>
        <Stack>
          <TextInput label="Title" variant="filled" size="md" />
          <RichTextEditor
            editor={editor}
            styles={{
              root: {
                border: "none",
              },
              toolbar: {
                border: "none",
                padding: 0,
              },
              control: {
                border: "none",
                width: "36px",
                height: "36px",
                fontSize: "35px",
              },
            }}
          >
            <RichTextEditor.Toolbar sticky stickyOffset={60}>
              <RichTextEditor.ControlsGroup>
                <RichTextEditor.Bold />
                <RichTextEditor.Italic />
                <RichTextEditor.Underline />
                <RichTextEditor.Strikethrough />
                <RichTextEditor.ClearFormatting />
                <RichTextEditor.Highlight />
                <RichTextEditor.Code />
              </RichTextEditor.ControlsGroup>

              <RichTextEditor.ControlsGroup>
                <RichTextEditor.H1 />
                <RichTextEditor.H2 />
                <RichTextEditor.H3 />
                <RichTextEditor.H4 />
              </RichTextEditor.ControlsGroup>

              <RichTextEditor.ControlsGroup>
                <RichTextEditor.Blockquote />
                <RichTextEditor.Hr />
                <RichTextEditor.BulletList />
                <RichTextEditor.OrderedList />
                <RichTextEditor.Subscript />
                <RichTextEditor.Superscript />
              </RichTextEditor.ControlsGroup>

              <RichTextEditor.ControlsGroup>
                <RichTextEditor.Link />
                <RichTextEditor.Unlink />
              </RichTextEditor.ControlsGroup>
            </RichTextEditor.Toolbar>

            <RichTextEditor.Content />
          </RichTextEditor>
        </Stack>
      </form>
    </Stack>
  );
};
