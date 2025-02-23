"use client";

import { columns } from "@/components/Columns";
import RenderCell from "@/components/RenderCell";
import useExchangeRate from "@/hooks/useExchangeRate";
import useTableSort from "@/hooks/useTableSort";
import { Item } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import { Key, useState } from "react";

interface SortDescriptor {
  column: string | number;
  direction: "ascending" | "descending";
}

type ItemListProps = {
  items: Item[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function ItemList({
  items = [],
  onEdit,
  onDelete,
}: ItemListProps) {
  const { exchangeRate } = useExchangeRate();
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "",
    direction: "ascending",
  });

  const sortedItems = useTableSort(items, sortDescriptor);

  const handleSortChange = (descriptor: SortDescriptor) => {
    setSortDescriptor(descriptor);
  };

  if (exchangeRate === null) {
    return null;
  }

  return (
    <div className="h-full overflow-y-auto p-1">
      <Table
        isHeaderSticky
        aria-label="Item list"
        selectionMode="single"
        sortDescriptor={sortDescriptor}
        onSortChange={handleSortChange}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.key}
              allowsSorting={column.sortable}
              style={{ width: column.width }}
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={sortedItems} emptyContent="No items found">
          {(item) => (
            <TableRow
              key={item.id}
              className="cursor-pointer"
              onClick={() => onEdit(item.id)}
            >
              {(key: Key) => (
                <TableCell key={key}>
                  <RenderCell
                    item={item}
                    columnKey={key as string}
                    exchangeRate={exchangeRate}
                    onDelete={onDelete}
                  />
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
