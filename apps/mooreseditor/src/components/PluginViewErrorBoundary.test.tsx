import type React from "react";

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  PluginViewContent,
  PluginViewErrorBoundary,
} from "./PluginViewErrorBoundary";

import { render, screen } from "@/test/utils/test-utils";

function ThrowingPluginView(): React.ReactNode {
  throw new Error("plugin exploded");
}

describe("PluginViewErrorBoundary", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders a plugin-scoped fallback when a plugin view throws", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <>
        <PluginViewErrorBoundary pluginId="node-graph" pluginName="Node Graph">
          <ThrowingPluginView />
        </PluginViewErrorBoundary>
        <div>Editor still alive</div>
      </>,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("node-graph");
    expect(screen.getByRole("alert")).toHaveTextContent("plugin exploded");
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
    expect(screen.getByText("Editor still alive")).toBeInTheDocument();
  });

  it("catches errors thrown while invoking a plugin render function", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const renderView = vi.fn(() => {
      throw new Error("render failed");
    });

    render(
      <PluginViewErrorBoundary pluginId="broken-plugin">
        <PluginViewContent renderView={renderView} />
      </PluginViewErrorBoundary>,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("broken-plugin");
    expect(screen.getByRole("alert")).toHaveTextContent("render failed");
  });
});
