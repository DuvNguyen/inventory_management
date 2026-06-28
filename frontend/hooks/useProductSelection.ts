import { useState, useEffect } from 'react';

export function useProductSelection(page: number, search: string) {
  const [isSelectMode, setIsSelectMode] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSelectedIds(new Set());
    }, 0);
    return () => clearTimeout(timeout);
  }, [page, search]);

  const toggleSelectMode = () => {
    setIsSelectMode((prev) => {
      if (prev) {
        setSelectedIds(new Set());
      }
      return !prev;
    });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = (ids: string[]) => {
    setSelectedIds((prev) => {
      const allSelected = ids.length > 0 && ids.every((id) => prev.has(id));
      const next = new Set(prev);
      if (allSelected) {
        // Uncheck all rows on the current page
        ids.forEach((id) => next.delete(id));
      } else {
        // Check all rows on the current page
        ids.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const clearSelections = () => {
    setSelectedIds(new Set());
  };

  return {
    isSelectMode,
    setIsSelectMode,
    selectedIds,
    toggleSelectMode,
    toggleSelect,
    selectAll,
    clearSelections,
  };
}
