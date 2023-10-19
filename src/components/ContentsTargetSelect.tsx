import { Select } from "@mantine/core";
import { useTranslation } from "react-i18next";

export type ContentsTarget = "all" | "draft" | "published";

type ContentsTargetSelectProps = {
  target: ContentsTarget;
  onChange: (target: ContentsTarget) => void;
};

export const ContentsTargetSelect = ({
  target,
  onChange,
}: ContentsTargetSelectProps) => {
  const { t } = useTranslation();

  return (
    <Select
      data={[
        { label: t("contents.all"), value: "all" },
        { label: t("contents.draft"), value: "draft" },
        { label: t("contents.published"), value: "published" },
      ]}
      value={target}
      onChange={(d) =>
        d ? onChange(d as "all" | "draft" | "published") : null
      }
    />
  );
};
