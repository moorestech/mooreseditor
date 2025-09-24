import { useState, useCallback, useEffect, useRef } from "react";

import type { EditingCell } from "../TableView.types";

export function useTableEdit(
  data: any[],
  onDataChange?: (newData: any[]) => void,
) {
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [editValue, setEditValue] = useState<any>(null);
  const editInputRef = useRef<HTMLDivElement>(null);

  const cancelEditing = useCallback(() => {
    setEditingCell(null);
    setEditValue(null);
  }, []);

  const startEditing = useCallback(
    (row: number, column: string) => {
      const value = data[row]?.[column];
      setEditingCell({ row, column });
      setEditValue(value);
    },
    [data],
  );

  const saveEdit = useCallback(() => {
    if (editingCell && onDataChange) {
      const newData = [...data];
      newData[editingCell.row] = {
        ...newData[editingCell.row],
        [editingCell.column]: editValue,
      };
      onDataChange(newData);
    }
    cancelEditing();
  }, [editingCell, editValue, data, onDataChange, cancelEditing]);

  // Handle click outside to save editing
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        editingCell &&
        editInputRef.current &&
        !editInputRef.current.contains(event.target as Node)
      ) {
        saveEdit();
      }
    };

    if (editingCell) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [editingCell, saveEdit]);

  return {
    editingCell,
    editValue,
    setEditValue,
    editInputRef,
    startEditing,
    saveEdit,
    cancelEditing,
  };
}
