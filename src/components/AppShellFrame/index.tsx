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
import { getAllContentsSchemas } from "@/services/content";
import { forwardRef, memo, Suspense } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { Schema } from "@/services/general/schema";
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
          label={t("navigation.contents")}
          defaultOpened
          style={{ fontWeight: 600 }}
        >
          <NavLink label={t("navigation.articles")} href="/contents/articles" />
          <NavLink label={t("navigation.sites")} href="/contents/sites" />
          <Suspense fallback={<div />}>
            <ContentsLink />
          </Suspense>
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

const ContentsLink = memo(() => {
  const { data: schemas } = useSuspenseQuery<Schema[]>({
    queryKey: ["schemas"],
    queryFn: getAllContentsSchemas,
    initialData: JSON.parse(
      localStorage.getItem("nostrcms.pages.dev-default-schemas") || "[]"
    ),
  });

  return (
    <>
      {schemas.map((schema) => (
        <NavLink
          key={schema.id}
          href={`/contents/${schema.id}`}
          label={schema.label}
        />
      ))}
    </>
  );
});
