import { useMantineTheme } from "@mantine/core";
import { RichTextEditor, Link } from "@mantine/tiptap";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";
import { Markdown } from "tiptap-markdown";

export const RichTextInput = (props: {
  id?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (markdown: string) => void;
}) => {
  const theme = useMantineTheme();

  const editor = useEditor({
    content: props.value
      ? props.value
      : props.defaultValue
      ? String(props.defaultValue)
      : undefined,
    extensions: [
      StarterKit,
      Link,
      Markdown.configure({
        html: false,
      }),
    ],
  });

  useEffect(() => {
    if (!editor) return;

    const callback = ({ editor }: any) => {
      const md = editor?.storage.markdown.getMarkdown();
      if (props.onChange) props.onChange(md);
    };
    editor.on("update", (e) => {
      return callback(e);
    });
    return () => {
      editor.off("update", callback);
    };
  }, [editor, props.onChange]);

  return (
    <RichTextEditor
      defaultValue={props.defaultValue}
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
  );
};
