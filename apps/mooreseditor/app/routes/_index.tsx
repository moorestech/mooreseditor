import type { MetaFunction } from "@remix-run/node";
import {Button} from "@mantine/core";
import {useLoaderData} from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  const loadedData = useLoaderData()
  return (
      <form method={'post'}>
      </form>
  );
}
