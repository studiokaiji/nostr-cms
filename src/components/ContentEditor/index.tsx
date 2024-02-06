import { Schema } from "@/services/general/schema";
import {
  TextInput,
  Button,
  Box,
  Text,
  Select,
  Radio,
  Checkbox,
  PasswordInput,
  Textarea,
  MultiSelect,
  Stack,
} from "@mantine/core";

import { useTranslation } from "react-i18next";
import {
  Content,
  ContentInput,
  autoPopulateDataFromSchema,
  parseContentValue,
} from "@/services/content";
import { useMemo, useState } from "react";
import { ImageDropzone } from "@/components/ImageDropzone";
import { uploadImage } from "@/services/image";

import { RichTextInput } from "@/components/RichTextInput";

import validator from "@rjsf/validator-ajv8";
import Form, { type IChangeEvent } from "@rjsf/core";
import {
  ArrayFieldTitleProps,
  IconButtonProps,
  UiSchema,
  WidgetProps,
} from "@rjsf/utils";

import { atom, useAtom } from "jotai";

import "./index.css";

const isProcessingAtom = atom(false);

type ContentEditorProps = {
  schemaId?: string;
  schema: Schema;
  content?: Content | ContentInput;
  onPublishRequest: (content: ContentInput) => void;
  type: "content" | "site";
};
export const ContentEditor = ({
  schema,
  schemaId,
  content,
  onPublishRequest,
  type,
}: ContentEditorProps) => {
  const { t } = useTranslation();

  const id = useMemo(() => content?.id || crypto.randomUUID(), [content]);

  const [sites, setSites] = useState<string[]>([]);

  const [isProcessing, setIsProcessing] = useAtom(isProcessingAtom);

  const submitHandler = (data: IChangeEvent) => {
    setIsProcessing(true);

    const formData = data.formData;
    const content = formData.content || "";

    const input = {
      id,
      content,
      sites,
      isDraft: false,
      schemaId,
      fields: formData,
    };

    setIsProcessing(false);
    onPublishRequest(input);
  };

  const formData = useMemo(() => {
    const populated = autoPopulateDataFromSchema(schema.schema);
    if (content) {
      const parsed = parseContentValue(content as Content, schema);
      return { ...populated, ...parsed, content: content.content };
    } else {
      return populated;
    }
  }, [schema, content]);

  const formComponent = useMemo(
    () => (
      <Form
        formData={formData}
        schema={schema.schema}
        validator={validator}
        widgets={widgets}
        uiSchema={uiSchema}
        templates={templates}
        onSubmit={submitHandler}
      >
        <Stack align="flex-start">
          {type === "content" && (
            <MultiSelect
              label={t("contents.sites")}
              data={["A", "B", "C"]}
              description={t("contents.sitesDescription")}
              onChange={setSites}
            />
          )}
          <div>
            <Button type="submit" disabled={isProcessing}>
              {t("contents.submit")}
            </Button>
          </div>
        </Stack>
      </Form>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [formData, schema.schema, submitHandler, t]
  );

  return (
    <>
      <TextInput label="ID" value={id} readOnly disabled />
      {formComponent}
    </>
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
    <Text size="sm" fw={500} lh={2}>
      {children}{" "}
      {required && (
        <Text span c="red" size="lg">
          *
        </Text>
      )}
    </Text>
  );
};

const CustomDateWidget = ({
  id,
  onChange,
  value,
  placeholder,
  disabled,
  readonly,
  schema,
}: WidgetProps) => {
  if (schema.input_mode === "hidden") {
    return <></>;
  }

  if (schema.input_mode === "auto_populated_updated_at") {
    return <></>;
  }

  return (
    <TextInput
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readonly}
      type="date"
    />
  );
};

const CustomTimeWidget = ({
  id,
  onChange,
  value,
  placeholder,
  disabled,
  readonly,
  schema,
}: WidgetProps) =>
  schema.input_mode === "hidden" ? (
    <></>
  ) : (
    <TextInput
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readonly}
      type="time"
    />
  );

const CustomDateTimeWidget = ({
  id,
  onChange,
  value,
  placeholder,
  disabled,
  readonly,
  schema,
}: WidgetProps) =>
  schema.input_mode === "hidden" ? (
    <></>
  ) : (
    <TextInput
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readonly}
      type="datetime-local"
    />
  );

const CustomSelectWidget = ({
  id,
  onChange,
  value,
  placeholder,
  disabled,
  readonly,
  options,
  schema,
  label,
}: WidgetProps) =>
  schema.input_mode === "hidden" ? (
    <></>
  ) : (
    <Select
      id={id}
      data={
        options?.enumOptions?.map((option) => ({
          value: option.value,
          label: option.label,
        })) || []
      }
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readonly}
      label={label}
    />
  );

const CustomCheckboxWidget = ({
  id,
  onChange,
  value,
  disabled,
  readonly,
  schema,
}: WidgetProps) =>
  schema.input_mode === "hidden" ? (
    <></>
  ) : (
    <Checkbox
      id={id}
      checked={value}
      onChange={(event) => onChange(event.currentTarget.checked)}
      disabled={disabled}
      readOnly={readonly}
    />
  );

const CustomTextWidget = ({
  id,
  onChange,
  value,
  placeholder,
  schema,
  disabled,
  readonly,
  label,
  required,
}: WidgetProps) => {
  if (schema.input_mode === "hidden") {
    return <></>;
  }

  if (schema.input_mode === "markdown") {
    return (
      <Box>
        <Label required={required}>{label}</Label>
        <RichTextInput id={id} value={value} onChange={onChange} />
      </Box>
    );
  }

  if (schema.input_mode === "textarea") {
    return (
      <Textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readonly}
        label={label}
        required={required}
      />
    );
  }

  if (schema.input_mode?.startsWith("auto_populated")) {
    return <></>;
  }

  return (
    <TextInput
      id={id}
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readonly}
      label={label}
      required={required}
    />
  );
};

const CustomEmailWidget = ({
  id,
  onChange,
  value,
  placeholder,
  disabled,
  readonly,
  schema,
  label,
  required,
}: WidgetProps) =>
  schema.input_mode === "hidden" ? (
    <></>
  ) : (
    <TextInput
      id={id}
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readonly}
      label={label}
      type="email"
      required={required}
    />
  );

const CustomPasswordWidget = ({
  id,
  onChange,
  value,
  placeholder,
  disabled,
  readonly,
  schema,
  label,
  required,
}: WidgetProps) =>
  schema.input_mode === "hidden" ? (
    <></>
  ) : (
    <PasswordInput
      id={id}
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readonly}
      label={label}
      required={required}
    />
  );

const CustomURLWidget = ({
  id,
  onChange,
  value,
  placeholder,
  disabled,
  readonly,
  schema,
  label,
  required,
}: WidgetProps) => {
  const [image, setImage] = useState(value?.[0] || "");
  const [isUploading, setIsUploading] = useAtom(isProcessingAtom);

  const selectImages = async (image: string) => {
    try {
      setImage(image);
      setIsUploading(true);
      const uploaded = await uploadImage(image);
      onChange(uploaded);
    } catch (e) {
      alert(e);
      setImage("");
    } finally {
      setIsUploading(false);
    }
  };

  if (schema.input_mode === "hidden") {
    return <></>;
  }

  if (schema.input_mode === "image_upload") {
    const width = schema.width;
    const height = schema.height;
    return (
      <Box className="relative">
        <Label required={required}>{label}</Label>
        <ImageDropzone
          onChangeImages={(images) =>
            images[0] ? selectImages(images[0]) : null
          }
          images={[image]}
          width={width}
          height={height}
          multiple={false}
        />
        {isUploading && (
          <div className="absolute w-full h-full flex items-center justify-center z-10">
            {isUploading}
          </div>
        )}
      </Box>
    );
  }

  return (
    <TextInput
      id={id}
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readonly}
      label={label}
      required={required}
    />
  );
};

const CustomRadioWidget = ({
  id,
  onChange,
  value,
  placeholder,
  disabled,
  readonly,
  schema,
  label,
  required,
}: WidgetProps) =>
  schema.input_mode === "hidden" ? (
    <></>
  ) : (
    <Radio
      id={id}
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readonly}
      label={label}
      required={required}
    />
  );

const AddButton = (props: IconButtonProps) => {
  const { icon, ...btnProps } = props;
  const { t } = useTranslation();
  return (
    <Button
      leftSection={icon}
      {...btnProps}
      className="content-editor-add-button"
      variant="outline"
    >
      + {t("contents.add")}
    </Button>
  );
};

const RemoveButton = (props: IconButtonProps) => {
  const { icon } = props;
  const { t } = useTranslation();
  return (
    <Button leftSection={icon} {...props} variant="light" color="red">
      {t("contents.remove")}
    </Button>
  );
};

const MoveUpButton = (props: IconButtonProps) => {
  const { icon } = props;
  return (
    <Button leftSection={icon} {...props} variant="light">
      ↑
    </Button>
  );
};

const MoveDownButton = (props: IconButtonProps) => {
  const { icon } = props;
  return (
    <Button leftSection={icon} {...props} variant="light">
      ↓
    </Button>
  );
};

const ArrayFieldTitleTemplate = (props: ArrayFieldTitleProps) => {
  const { title, required } = props;
  return <Label required={required}>{title}</Label>;
};

const widgets = {
  DateWidget: CustomDateWidget,
  TimeWidget: CustomTimeWidget,
  DateTimeWidget: CustomDateTimeWidget,
  SelectWidget: CustomSelectWidget,
  CheckboxWidget: CustomCheckboxWidget,
  TextWidget: CustomTextWidget,
  PasswordWidget: CustomPasswordWidget,
  EmailWidget: CustomEmailWidget,
  URLWidget: CustomURLWidget,
  RadioWidget: CustomRadioWidget,
};

const uiSchema: UiSchema = {
  "ui:globalOptions": {
    label: false,
  },
};

const templates = {
  ButtonTemplates: {
    AddButton,
    RemoveButton,
    MoveUpButton,
    MoveDownButton,
  },
  ArrayFieldTitleTemplate,
};
