import { Content } from "@/services/content";
import { Schema } from "@/services/general/schema";
import { Anchor, Badge, Image, Table } from "@mantine/core";
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

  const columns = useMemo(
    () => [
      t("contents.status"),
      ...schema.fields.map(({ label, key }) => label || key),
    ],
    [t, schema.fields]
  );
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

      for (const field of schema.fields) {
        try {
          const data = content.fields?.[field.key];
          if (!data || !data.length) {
            rowChildren.push(<span />);
            continue;
          }

          const unit = field.type.unit;
          const primitive = field.type.primitive;

          let parsedData = data;

          if (primitive === "date") {
            try {
              parsedData = data.map((val) =>
                new Date(Number(val) * 1000).toLocaleDateString(i18n.language)
              );
            } catch (e) {
              console.error(e);
            }
          }

          if (
            primitive === "string" ||
            primitive === "number" ||
            primitive === "boolean"
          ) {
            if (unit === "array") {
              rowChildren.push(parsedData.join(", "));
            } else {
              rowChildren.push(parsedData[0]);
            }
          } else {
            if (primitive === "image") {
              rowChildren.push(
                <Image
                  radius="sm"
                  width="auto"
                  style={{ width: "auto" }}
                  height={50}
                  fit="contain"
                  src={parsedData[0]}
                />
              );
            } else if (primitive === "url") {
              if (unit === "array") {
                parsedData.map((data) => (
                  <Anchor href={data} target="_blank" />
                ));
              } else {
                let url = parsedData[0];
                if (!url.startsWith("http://") && !url.startsWith("https://")) {
                  url = "https://" + url;
                }
                rowChildren.push(
                  <Anchor href={url} target="_blank">
                    {parsedData[0]}
                  </Anchor>
                );
              }
            }
          }
        } catch (e) {
          console.error(e);
          continue;
        }
      }

      returnRows.push(
        rowChildren.map((child, i) => (
          <Table.Td key={`table-td-${returnRows.length}.${i}`}>
            {child}
          </Table.Td>
        ))
      );
    }

    return returnRows;
  }, [contents, i18n.language, schema.fields, t]);

  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          {columns.map((column) => (
            <Table.Th key={column}>{column}</Table.Th>
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
