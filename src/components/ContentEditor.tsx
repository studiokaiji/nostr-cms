import { Schema } from "@/services/general/schema";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Stack,
  Flex,
  Switch,
  TextInput,
  Button,
  useMantineTheme,
  Box,
  Text,
} from "@mantine/core";
import { RichTextEditor, Link } from "@mantine/tiptap";
import { useTranslation } from "react-i18next";
import { Markdown } from "tiptap-markdown";
import { useForm } from "@mantine/form";
import { Content, ContentInput } from "@/services/content";
import { useMemo } from "react";

type ContentEditorProps = {
  schema: Schema;
  content?: Content | ContentInput;
  onPublish: (content: ContentInput) => void;
};

export const ContentEditor = ({ schema, content }: ContentEditorProps) => {
  const { t } = useTranslation();

  const theme = useMantineTheme();

  const editor = useEditor({
    content: "",
    extensions: [StarterKit, Link, Markdown],
  });

  const filteredFields = useMemo(
    () => schema.fields.filter(({ userEditable }) => userEditable),
    [schema]
  );

  const form = useForm({
    initialValues: {
      fields: filteredFields.reduce<{ [key in string]: unknown }>(
        (prev, field) => {
          let defaultValue: unknown;

          if (content?.fields && field.key in content.fields) {
            defaultValue = content.fields[field.key];
          } else {
            switch (field.type.primitive) {
              case "text":
                defaultValue = "";
                break;
              case "boolean":
                defaultValue = false;
                break;
              case "date":
                defaultValue = new Date();
                break;
              case "image":
                defaultValue = "";
                break;
              case "number":
                defaultValue = field.optional ? undefined : 0;
                break;
              case "url":
                defaultValue = "";
            }
          }

          if (field.type.unit === "array" && !Array.isArray(defaultValue)) {
            defaultValue = [defaultValue];
          } else if (
            field.type.unit === "single" &&
            Array.isArray(defaultValue)
          ) {
            defaultValue = defaultValue[0];
          }

          prev[field.key] = defaultValue;
          return prev;
        },
        {}
      ),
    },
  });

  return (
    <form>
      <Stack>
        {filteredFields.map((field) => {
          if (field.type.primitive === "boolean") {
            return (
              <Switch
                label={field.label || field.key}
                required={!field.optional}
                {...form.getInputProps(`fields.${field.key}`)}
              />
            );
          }

          if (field.type.primitive === "image") {
            return <></>;
          }

          return (
            <TextInput
              label={field.label || field.key}
              required={!field.optional}
              withAsterisk={!field.optional}
              size="md"
              type={field.type.primitive}
              style={{ maxWidth: "640px" }}
              {...form.getInputProps(`fields.${field.key}`)}
            />
          );
        })}
        {schema.content !== "never" && (
          <Box>
            <Text size="md" fw={500}>
              Content{" "}
              {schema.content === "required" && (
                <Text span c="red" size="lg">
                  *
                </Text>
              )}
            </Text>
            <RichTextEditor
              editor={editor}
              styles={{
                toolbar: {
                  border: "none",
                  padding: 0,
                  background: theme.colors.gray[0],
                },
                controlsGroup: {
                  background: "transparent",
                },
                control: {
                  border: "none",
                  width: "36px",
                  height: "36px",
                  background: "transparent",
                  padding: 0,
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
                  <RichTextEditor.CodeBlock />
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
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.Link />
                  <RichTextEditor.Unlink />
                </RichTextEditor.ControlsGroup>
              </RichTextEditor.Toolbar>

              <RichTextEditor.Content />
            </RichTextEditor>
          </Box>
        )}
        <Flex gap="sm">
          <Button>{t("contents.publish")}</Button>
        </Flex>
      </Stack>
    </form>
  );
};
