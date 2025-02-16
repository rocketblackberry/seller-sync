import { useMemo } from "react";

interface SortDescriptor {
  column: string | number;
  direction: "ascending" | "descending";
}

const useTableSort = <T>(
  items: T[],
  sortDescriptor: SortDescriptor,
) => {
  const sortedItems = useMemo(() => {
    const { column, direction } = sortDescriptor;
    if (!column) return items;

    return [...items].sort((a: T, b: T) => {
      const first = a[column as keyof T];
      const second = b[column as keyof T];

      if (first < second) {
        return direction === "ascending" ? -1 : 1;
      }

      if (first > second) {
        return direction === "ascending" ? 1 : -1;
      }

      return 0;
    });
  }, [items, sortDescriptor]);

  return sortedItems;
};

export default useTableSort;
