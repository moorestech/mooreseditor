import { AppShell, Burger, Button, Group, NavLink } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Link, Outlet } from "@remix-run/react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import schemaConfig from '~/_config'
import {useEditorContext} from "~/hooks/useEditorContext";

export const loader = () => {
  return typedjson({
    schemas: schemaConfig.schemas
  })
}

export default function RootLayout() {
  const { schemas } = useTypedLoaderData()
  const [opened, { toggle }] = useDisclosure(false);
  const context = useEditorContext();
  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 180, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group justify='space-between' p={'sm'}>
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <div>Logo</div>
          </Group>
          <Button onClick={() => context.masterDirectory.selectDirectory()}>Open</Button>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        {Object.entries(schemas).map(([schemaId, schema]: [string, any]) => (
          <NavLink key={schemaId} component={Link} to={`/schema/${schemaId}`} label={schema.name} />
        ))}
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet context={{ context }} />
      </AppShell.Main>
    </AppShell>

  )
}
