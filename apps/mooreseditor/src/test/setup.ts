// AI Generated Test Code
import "./mocks/setup-tauri";
import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll, afterAll, beforeEach, vi } from "vitest";

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
// Re-applied before every test so that per-file vi.restoreAllMocks()/resetAllMocks()
// calls cannot strip the mock implementation and break subsequent tests.
const installMatchMedia = () => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

installMatchMedia();
beforeEach(() => {
  installMatchMedia();
});

// Mock IntersectionObserver and ResizeObserver.
// These must be reinstalled before every test because vi.restoreAllMocks()
// can strip mockImplementation from vi.fn() instances that were registered
// globally. The same pattern is used for matchMedia above.
const installObserverMocks = () => {
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
};

installObserverMocks();
beforeEach(() => {
  installObserverMocks();
});

// Suppress console errors in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Warning: ReactDOM.render")
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
