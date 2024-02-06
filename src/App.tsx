import "@mantine/core/styles.css";
import "@mantine/carousel/styles.css";
import "./i18n/i18n";

import { MantineProvider } from "@mantine/core";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { IndexPage } from "./pages";
import { Suspense } from "react";
import { AppShellFrame } from "./components/AppShellFrame";
import { ContentSchemaPage } from "./pages/contents/[schemaId]";
import { AddContentPage } from "./pages/contents/[schemaId]/addContent";
import { EditContentPage } from "./pages/contents/items/[contentId]";

export default function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MantineProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppShellFrame />}>
              <Route index element={<IndexPage />} />
              <Route path="contents">
                <Route path=":schemaId">
                  <Route index element={<ContentSchemaPage />} />
                  <Route path="add-content" element={<AddContentPage />} />
                  <Route
                    path="items/:contentId"
                    element={<EditContentPage />}
                  />
                </Route>
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </MantineProvider>
    </Suspense>
  );
}
