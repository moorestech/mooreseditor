import React from "react";
import ReactDOM from "react-dom/client";

import { MantineProvider } from '@mantine/core';

import App from "./App";
import { ProjectProvider } from "./contexts/ProjectContext";

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <MantineProvider>
      <ProjectProvider>
        <App />
      </ProjectProvider>
    </MantineProvider>
  </React.StrictMode>,
);
