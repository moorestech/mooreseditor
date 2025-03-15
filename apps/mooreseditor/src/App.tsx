import { Suspense, useMemo, useState } from "react";
import * as path from '@tauri-apps/api/path';
import { open } from '@tauri-apps/plugin-dialog';
import { readDir, readTextFile } from '@tauri-apps/plugin-fs';

import reactLogo from "./assets/react.svg";
import "./App.css";
import { loadYamlString } from "./libs/schema/io";
import { AppShell, Button, Group, NavLink } from "@mantine/core";
import { MasterTable } from "./components/MasterTable";

function App() {
  const [projectDir, setProjectDir] = useState<string | null>(null);
  const [schemas, setSchemas] = useState([]);
  const [selectedSchemaId, setSelectedSchemaId] = useState<string | null>(null);

  const selectedSchema = useMemo(() => {
    return schemas.find(schema => schema.id === selectedSchemaId)
  }, [schemas, selectedSchemaId])

  async function openSchemaDir() {
    const openedDir = await open({ directory: true })
    const entryList = await readDir(openedDir)
    setSchemas(await Promise.all(
      entryList
        .filter(entry => entry.isFile)
        .map(entry => entry.name)
        .map(async fileName => {
          const filePath = await path.join(openedDir, fileName)
          const fileContent = await readTextFile(filePath)
          return loadYamlString(fileContent)
        })
    ))
  }

  async function openProjectDir() {
    const openedDir = await open({ directory: true })
    const fileNameList = await readDir(await path.join(openedDir, 'schemas'))
    setProjectDir(openedDir)
  }

  return (
    <AppShell
      header={{ height: 64 }}
      navbar={{
        width: 264,
        breakpoint: 'xs'
      }}
    >
      <AppShell.Header>
        <Group justify='right'>
          <Button onClick={openSchemaDir}>Open Schema</Button>
          <Button onClick={openProjectDir}>Open Project</Button>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar>
        {schemas.map(schema => (
          <NavLink
            key={schema.id}
            label={schema.id}
            active={schema.id === selectedSchemaId}
            onClick={() => setSelectedSchemaId(schema.id)}
          />
        ))}
      </AppShell.Navbar>
      <AppShell.Main>
        {selectedSchema && (
          <MasterTable schema={selectedSchema} />
        )}
      </AppShell.Main>
    </AppShell>
  );
}

export default App;
