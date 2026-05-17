import React, { useCallback, useEffect, useRef, useState } from "react";

import { ActionIcon, Group, Paper, Text, TextInput, Tooltip } from "@mantine/core";
import {
  IconChevronDown,
  IconChevronUp,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
import Mark from "mark.js";

interface SearchOverlayProps {
  targetRef: React.RefObject<HTMLElement | null>;
  onActiveMatchChange?: (element: HTMLElement | null) => void;
}

const SEARCH_MATCH_CLASS = "mooreseditor-search-match";
const SEARCH_ACTIVE_CLASS = "mooreseditor-search-match-active";
const SEARCH_OVERLAY_SELECTOR = "[data-search-overlay='true']";

function isVisibleTextNode(textNode: Text): boolean {
  for (
    let element = textNode.parentElement;
    element;
    element = element.parentElement
  ) {
    if (
      element.closest(SEARCH_OVERLAY_SELECTOR) ||
      element.hidden ||
      element.getAttribute("aria-hidden") === "true"
    ) {
      return false;
    }

    const style = window.getComputedStyle(element);
    if (style.display === "none" || style.visibility === "hidden") {
      return false;
    }
  }

  return true;
}

function clearMarks(root: HTMLElement | null) {
  if (!root) {
    return;
  }

  new Mark(root).unmark({
    className: SEARCH_MATCH_CLASS,
  });
}

export function SearchOverlay({
  targetRef,
  onActiveMatchChange,
}: SearchOverlayProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [matchElements, setMatchElements] = useState<HTMLElement[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const closeSearch = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setMatchElements([]);
    setActiveIndex(0);
    clearMarks(targetRef.current);
  }, [targetRef]);

  const focusSearchInput = useCallback(() => {
    window.setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
  }, []);

  const moveActiveMatch = useCallback(
    (direction: 1 | -1) => {
      if (matchElements.length === 0) {
        return;
      }

      setActiveIndex(
        (currentIndex) =>
          (currentIndex + direction + matchElements.length) % matchElements.length,
      );
    },
    [matchElements.length],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isFindShortcut =
        (event.metaKey || event.ctrlKey) && event.key.toLocaleLowerCase() === "f";

      if (isFindShortcut) {
        event.preventDefault();
        setIsOpen(true);
        focusSearchInput();
        return;
      }

      if (isOpen && event.key === "Escape") {
        event.preventDefault();
        closeSearch();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeSearch, focusSearchInput, isOpen]);

  useEffect(() => {
    const root = targetRef.current;
    if (!isOpen || !root) {
      return;
    }

    const marker = new Mark(root);
    const trimmedQuery = query.trim();

    marker.unmark({
      className: SEARCH_MATCH_CLASS,
      done: () => {
        if (!trimmedQuery) {
          setMatchElements([]);
          setActiveIndex(0);
          return;
        }

        marker.mark(trimmedQuery, {
          className: SEARCH_MATCH_CLASS,
          separateWordSearch: false,
          exclude: [SEARCH_OVERLAY_SELECTOR],
          filter: (textNode) => isVisibleTextNode(textNode),
          done: () => {
            const nextMatchElements = Array.from(
              root.querySelectorAll<HTMLElement>(`.${SEARCH_MATCH_CLASS}`),
            );
            setMatchElements(nextMatchElements);
            setActiveIndex((currentIndex) =>
              nextMatchElements.length === 0
                ? 0
                : Math.min(currentIndex, nextMatchElements.length - 1),
            );
          },
        });
      },
    });
  }, [isOpen, query, targetRef]);

  useEffect(() => {
    matchElements.forEach((element, index) => {
      element.classList.toggle(SEARCH_ACTIVE_CLASS, index === activeIndex);
    });

    const activeElement = matchElements[activeIndex];
    onActiveMatchChange?.(activeElement ?? null);

    if (activeElement && typeof activeElement.scrollIntoView === "function") {
      activeElement.scrollIntoView({
        block: "center",
        inline: "nearest",
        behavior: "smooth",
      });
    }
  }, [activeIndex, matchElements, onActiveMatchChange]);

  useEffect(() => {
    return () => {
      clearMarks(targetRef.current);
    };
  }, [targetRef]);

  if (!isOpen) {
    return null;
  }

  const trimmedQuery = query.trim();
  const matchStatus =
    trimmedQuery.length === 0
      ? "検索語を入力"
      : matchElements.length === 0
        ? "一致なし"
        : `${activeIndex + 1} / ${matchElements.length}`;

  return (
    <>
      <style>
        {`
          .${SEARCH_MATCH_CLASS} {
            background: rgba(255, 213, 79, 0.65);
            border-radius: 3px;
            color: inherit;
            padding: 0 1px;
          }

          .${SEARCH_ACTIVE_CLASS} {
            background: rgba(255, 143, 0, 0.95);
            outline: 2px solid rgba(230, 81, 0, 0.95);
            outline-offset: 2px;
          }
        `}
      </style>
      <Paper
        data-search-overlay="true"
        shadow="lg"
        radius="md"
        p="xs"
        withBorder
        style={{
          position: "fixed",
          top: 58,
          right: 16,
          zIndex: 2200,
          width: 420,
          maxWidth: "calc(100vw - 32px)",
        }}
      >
        <Group gap="xs" wrap="nowrap">
          <TextInput
            ref={inputRef}
            aria-label="検索"
            leftSection={<IconSearch size={16} />}
            placeholder="画面内を検索"
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                moveActiveMatch(event.shiftKey ? -1 : 1);
              }
            }}
            style={{ flex: 1 }}
          />
          <Text size="sm" c="dimmed" style={{ whiteSpace: "nowrap" }}>
            {matchStatus}
          </Text>
          <Tooltip label="前へ">
            <ActionIcon
              aria-label="前の一致"
              variant="subtle"
              disabled={matchElements.length === 0}
              onClick={() => moveActiveMatch(-1)}
            >
              <IconChevronUp size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="次へ">
            <ActionIcon
              aria-label="次の一致"
              variant="subtle"
              disabled={matchElements.length === 0}
              onClick={() => moveActiveMatch(1)}
            >
              <IconChevronDown size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="閉じる">
            <ActionIcon aria-label="検索を閉じる" variant="subtle" onClick={closeSearch}>
              <IconX size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Paper>
    </>
  );
}
