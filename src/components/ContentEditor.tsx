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
import { FormEvent } from "react";
import { ImageDropzone } from "./ImageDropzone";
import { readyNostr } from "nip07-awaiter";

type ContentEditorProps = {
  schema: Schema;
  content?: Content | ContentInput;
  onPublish: (content: ContentInput) => void;
};

export const ContentEditor = ({
  schema,
  content,
  onPublish,
}: ContentEditorProps) => {
  const { t } = useTranslation();

  const theme = useMantineTheme();

  const editor = useEditor({
    content: "",
    extensions: [
      StarterKit,
      Link,
      Markdown.configure({
        html: false,
      }),
    ],
  });

  const filteredFields = schema.fields.filter(
    ({ userEditable }) => userEditable
  );

  const form = useForm({
    initialValues: {
      id: content?.id || String(Date.now()),
      fields: filteredFields.reduce<{ [key in string]: unknown[] }>(
        (prev, field) => {
          let defaultValue: unknown[];

          if (content?.fields && field.key in content.fields) {
            defaultValue = content.fields[field.key];
          } else {
            switch (field.type.primitive) {
              case "text":
                defaultValue = [""];
                break;
              case "boolean":
                defaultValue = [false];
                break;
              case "date":
                defaultValue = [""];
                break;
              case "image":
                defaultValue = [""];
                break;
              case "number":
                defaultValue = [0];
                break;
              case "url":
                defaultValue = [""];
                break;
              default:
                defaultValue = [];
                break;
            }
          }

          prev[field.key] = defaultValue;
          return prev;
        },
        {}
      ),
    },
  });

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    form.validate();

    const fields: { [key in string]: string[] } = {};

    for (const key of Object.keys(form.values.fields)) {
      fields[key] = form.values.fields[key].map((val) => String(val));
    }

    for (const field of schema.fields) {
      if (field.type.primitive === "updatedAt") {
        fields[field.key] = [String(Math.floor(Date.now() / 1000))];
      } else if (field.type.primitive === "date" && fields[field.key]?.[0]) {
        fields[field.key] = [
          String(Math.floor(new Date(fields[field.key][0]).getTime() / 1000)),
        ];
      }
    }

    const nostr = await readyNostr;
    const pubkey = await nostr.getPublicKey();

    onPublish({
      fields,
      pubkey,
      id: content?.id || form.values.id,
      content: editor?.storage.markdown.getMarkdown() || "",
      isDraft: false,
      sites: [],
    });
  };

  return (
    <form onSubmit={submit}>
      <Stack>
        <TextInput
          label={t("id")}
          required
          withAsterisk
          style={{ maxWidth: "280px" }}
          {...form.getInputProps(`id`)}
          readOnly={!!content}
        />

        {filteredFields.map((field) => {
          const fieldProps = form.getInputProps(`fields.${field.key}`);

          if (!Array.isArray(fieldProps.value)) {
            return <></>;
          }

          if (field.type.primitive === "image") {
            return (
              <Box>
                <Label>{field.label || field.key}</Label>
                <ImageDropzone
                  images={fieldProps.value}
                  onChangeImages={fieldProps.onChange}
                  multiple={field.type.unit === "array"}
                />
              </Box>
            );
          }

          return fieldProps.value.map((_, i) => {
            if (field.type.primitive === "boolean") {
              return (
                <Switch
                  key={field.key}
                  label={field.label || field.key}
                  required={!field.optional}
                  {...form.getInputProps(`fields.${field.key}.${i}`)}
                />
              );
            }

            if (
              field.type.primitive === "date" ||
              field.type.primitive === "time"
            ) {
              return (
                <TextInput
                  key={field.key}
                  label={field.label || field.key}
                  required={!field.optional}
                  withAsterisk={!field.optional}
                  style={{ maxWidth: "200px" }}
                  type={field.type.primitive}
                  {...form.getInputProps(`fields.${field.key}.${i}`)}
                />
              );
            }

            return (
              <TextInput
                key={field.key}
                label={field.label || field.key}
                required={!field.optional}
                withAsterisk={!field.optional}
                type={field.type.primitive}
                style={{ maxWidth: "640px" }}
                {...form.getInputProps(`fields.${field.key}.${i}`)}
              />
            );
          });
        })}
        {schema.content !== "never" && (
          <Box>
            <Label required={schema.content === "required"}>Content</Label>
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
          <Button type="submit">{t("contents.publish")}</Button>
        </Flex>
      </Stack>
    </form>
  );
};

const Label = ({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) => {
  return (
    <Text size="sm" fw={500}>
      {children}{" "}
      {required && (
        <Text span c="red" size="lg">
          *
        </Text>
      )}
    </Text>
  );
};
