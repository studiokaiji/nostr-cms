import { AppShell, Box, Card, NavLink } from "@mantine/core";
import { Link, Outlet } from "react-router-dom";
import { LogoWithTextile } from "./LogoWithTextile";
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import { getAllContentsSchemas } from "@/services/content";

export const AppShellFrame = () => {
  const { t } = useTranslation();
  const { data: schemas } = useSWR("schemas", getAllContentsSchemas);

  return (
    <AppShell
      navbar={{ width: 240, breakpoint: "sm", collapsed: { mobile: false } }}
      padding="md"
    >
      <AppShell.Navbar
        styles={{
          navbar: {
            border: "none",
            background: "none",
          },
        }}
      >
        <Box p="md">
          <Link to="/">
            <LogoWithTextile height={34} />
          </Link>
        </Box>
        <NavLink
          label={t("navigation.sites")}
          defaultOpened
          style={{ fontWeight: 600 }}
        >
          <NavLink label="SiteA" />
        </NavLink>
        <NavLink
          label={t("navigation.contents")}
          defaultOpened
          style={{ fontWeight: 600 }}
        >
          <NavLink label={t("navigation.articles")} href="/contents/articles" />
          {schemas?.map((schema) => (
            <NavLink
              key={schema.id}
              href={`/contents/${schema.id}`}
              label={schema.label}
            />
          ))}
        </NavLink>

        <NavLink
          label={t("navigation.assets")}
          disabled
          style={{ fontWeight: 600 }}
        ></NavLink>
      </AppShell.Navbar>

      <AppShell.Main style={{ width: "100%" }}>
        <Card
          radius="xl"
          p="xl"
          style={{
            minHeight: "calc(100dvh - 2rem)",
          }}
        >
          <Outlet />
        </Card>
      </AppShell.Main>
    </AppShell>
  );
};
