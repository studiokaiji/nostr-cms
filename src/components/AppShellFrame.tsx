import {
  AppShell,
  Box,
  Card,
  NavLinkProps,
  NavLink as _NavLink,
} from "@mantine/core";
import { Link, Outlet } from "react-router-dom";
import { LogoWithTextile } from "./LogoWithTextile";
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import { getAllContentsSchemas } from "@/services/content";
import { forwardRef, useEffect } from "react";

const NavLink = forwardRef<
  HTMLAnchorElement,
  NavLinkProps & JSX.IntrinsicElements["a"]
>((props, ref) => (
  <_NavLink
    {...props}
    styles={{
      root: {
        borderRadius: "0.25rem",
      },
      ...props?.styles,
    }}
    ref={ref}
  >
    {props.children}
  </_NavLink>
));

export const AppShellFrame = () => {
  const { t } = useTranslation();
  const { data: schemas } = useSWR("schemas", getAllContentsSchemas, {
    keepPreviousData: true,
    revalidateOnReconnect: false,
    fallbackData: JSON.parse(
      localStorage.getItem("nostrcms.pages.dev-default-schemas") || "[]"
    ),
  });

  useEffect(() => {
    if (schemas) {
      localStorage.setItem(
        "nostrcms.pages.dev-default-schemas",
        JSON.stringify(schemas)
      );
    }
  }, [schemas]);

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
            paddingLeft: "1rem",
          },
        }}
      >
        <Box pt="md" pb="sm">
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
