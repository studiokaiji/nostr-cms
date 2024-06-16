import { Content } from "@/services/content";
import { Schema } from "@/services/general/schema";
import { ActionIcon, Badge, Image, Table } from "@mantine/core";
import { IconEdit } from "@tabler/icons-react";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

type ContentsProps = {
  schema: Schema;
  contents?: Content[];
  onDeleteRequest?: () => void;
  onEditRequest?: () => void;
};

export const ContentsTable = ({ schema, contents }: ContentsProps) => {
  const { i18n, t } = useTranslation();

  const filteredSchemaList = useMemo(() => {
    return Object.entries(schema.schema.properties).filter(
      ([key]) => key && key !== "content"
    );
  }, [schema]);

  const rows: React.ReactNode[] = useMemo(() => {
    if (!contents) return [];

    const returnRows: React.ReactNode[] = [];

    for (const content of contents) {
      const rowChildren: React.ReactNode[] = [
        <Badge
          color={content.isDraft ? "gray" : "teal"}
          variant="light"
          defaultChecked
        >
          {content.isDraft ? t("contents.draft") : t("contents.published")}
        </Badge>,
      ];

      const dataKeys = filteredSchemaList.map(([k]) => k);

      for (const key of dataKeys) {
        const dataSchema = schema.schema.properties[key] as Record<
          string,
          unknown
        >;
        const data = content.fields?.[key];

        if (!data || !data.length) {
          rowChildren.push(<span />);
          continue;
        }

        if (
          dataSchema.format === "uri" &&
          dataSchema.input_mode === "image_upload"
        ) {
          rowChildren.push(
            <Image
              radius="sm"
              width="auto"
              style={{ width: "auto" }}
              height={50}
              fit="contain"
              src={data[0]}
            />
          );
        } else if (
          dataSchema.type === "integer" &&
          dataSchema.input_mode === "auto_populated_updated_at"
        ) {
          const parsedData = [
            new Date(Number(data[0]) * 1000).toLocaleDateString(i18n.language),
          ];
          rowChildren.push(parsedData);
        } else {
          const isOverflowed = data[0].length > 80;
          const sliced = data[0].slice(0, 80);
          const text = `${sliced}${isOverflowed ? "..." : ""}`;
          rowChildren.push(text);
        }
      }

      rowChildren.push(
        <ActionIcon
          component="a"
          href={`/contents/${schema.id}/items/${content.id}`}
          variant="light"
          size="lg"
        >
          <IconEdit size={20} />
        </ActionIcon>
      );

      returnRows.push(
        rowChildren.map((child, i) => (
          <Table.Td key={`table-td-${returnRows.length}.${i}`}>
            {child}
          </Table.Td>
        ))
      );
    }

    return returnRows;
  }, [contents, filteredSchemaList, i18n.language, schema, t]);

  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          {[
            t("contents.status"),
            ...filteredSchemaList.map(([key, p]) => {
              if (p && typeof p === "object") {
                if ("title" in p && p.title) {
                  return p.title;
                }
                if ("label" in p && p.label) {
                  return p.label;
                }
              }
              return key;
            }),
          ].map((column) => (
            <Table.Th
              key={String(column)}
              style={{ whiteSpace: "nowrap", lineHeight: 3 }}
            >
              {String(column)}
            </Table.Th>
          ))}
        </Table.Tr>
      </Table.Thead>
      {contents && rows.length ? (
        <Table.Tbody>
          {rows.map((row, i) => (
            <Table.Tr key={`contents-${i}`}>{row}</Table.Tr>
          ))}
        </Table.Tbody>
      ) : (
        <></>
      )}
    </Table>
  );
};
