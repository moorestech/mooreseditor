import '@mantine/core/styles.css';

import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import {AppShell, MantineProvider, Burger, ColorSchemeScript, Table, Input} from "@mantine/core";
import {useDisclosure} from "@mantine/hooks";
import {ParseSchema} from "~/ParseSchema";
export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];

export default function App() {

  const [opened, { toggle }] = useDisclosure(false);

  ParseSchema.Parse();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider>
          <AppShell
              header={{ height: 60 }}
              navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
              padding="md"
          >
            <AppShell.Header>
              <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
              <div>Logo</div>
            </AppShell.Header>

            <AppShell.Navbar p="md">Navbar</AppShell.Navbar>

            <AppShell.Main>
              <Outlet />
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Element position</Table.Th>
                    <Table.Th>Element name</Table.Th>
                    <Table.Th>Symbol</Table.Th>
                    <Table.Th>Atomic mass</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  <Table.Tr key="a">
                    <Table.Td>a</Table.Td>
                    <Table.Td>2</Table.Td>
                    <Table.Td><Input variant="unstyled" placeholder="Input component" style={{ width: '50px' }}/></Table.Td>
                    <Table.Td>4</Table.Td>
                  </Table.Tr>
                </Table.Tbody>
              </Table>
            </AppShell.Main>
          </AppShell>
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </MantineProvider>
      </body>
    </html>
  );
}
