import { AppShell, Burger, NavLink } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Link, Outlet } from "@remix-run/react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import schemaConfig from '~/schema/_config'

export const loader = () => {
  return typedjson({
    schemas: schemaConfig.schemas
  })
}

export default function RootLayout() {
  const { schemas } = useTypedLoaderData()
  const [opened, { toggle }] = useDisclosure(false);
  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
        <div>Logo</div>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        {Object.entries(schemas).map(([schemaId, schema]: [string, any]) => (
          <NavLink component={Link} to={`/schema/${schemaId}`} label={schema.name} />
        ))}
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>

  )
}
