import "@mantine/core/styles.css";
import "./i18n/i18n";

import { MantineProvider } from "@mantine/core";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { IndexPage } from "./pages";
import { Suspense } from "react";
import { AppShellFrame } from "./components/AppShellFrame";
import { ContentSchemaPage } from "./pages/contents/[schemaId]";

export default function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MantineProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppShellFrame />}>
              <Route index element={<IndexPage />} />
              <Route path="contents">
                <Route path=":schemaId" element={<ContentSchemaPage />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </MantineProvider>
    </Suspense>
  );
}
