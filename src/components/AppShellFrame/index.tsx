import {
  AppShell,
  Box,
  Card,
  NavLinkProps,
  NavLink as _NavLink,
} from "@mantine/core";
import { Link, Outlet } from "react-router-dom";
import { Logo } from "../Logo";
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import { getAllContentsSchemas } from "@/services/content";
import { forwardRef, useEffect } from "react";
import "./index.module.css";

const NavLink = forwardRef<
  HTMLAnchorElement,
  NavLinkProps & JSX.IntrinsicElements["a"]
>((props, ref) => (
  <_NavLink
    {...props}
    styles={{
      root: {},
      ...props?.styles,
    }}
    ref={ref}
    px="md"
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
      navbar={{
        width: 240,
        breakpoint: "sm",
        collapsed: { mobile: false },
      }}
    >
      <AppShell.Navbar
        styles={{
          navbar: {
            border: "none",
            background: "none",
            paddingRight: 0,
          },
        }}
      >
        <Box p="md">
          <Link to="/">
            <Logo width={36} height={36} />
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

      <AppShell.Main style={{ width: "100%" }} pt="md" pr="md">
        <Card
          radius="xl"
          p={0}
          style={{
            height: "calc(100dvh - 2rem)",
          }}
        >
          <Box
            p="xl"
            style={{
              overflowX: "scroll",
              overflowY: "scroll",
            }}
          >
            <Outlet />
          </Box>
        </Card>
      </AppShell.Main>
    </AppShell>
  );
};
