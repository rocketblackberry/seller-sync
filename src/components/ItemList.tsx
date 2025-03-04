"use client";

import { columns } from "@/components/Columns";
import RenderCell from "@/components/RenderCell";
import useTableSort from "@/hooks/useTableSort";
import {
  useExchangeRateStore,
  useItemsStore,
  useSearchConditionStore,
  useSellerStore,
} from "@/stores";
import { Item } from "@/types";
import {
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import { Key, useEffect, useState } from "react";

interface SortDescriptor {
  column: string | number;
  direction: "ascending" | "descending";
}

type ItemListProps = {
  onClick: (id: string) => void;
};

export default function ItemList({ onClick }: ItemListProps) {
  const { selectedSellerId } = useSellerStore();
  const { items, fetchItems, pagination } = useItemsStore();
  const { condition } = useSearchConditionStore();
  const { exchangeRate } = useExchangeRateStore();
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "",
    direction: "ascending",
  });

  const sortedItems = useTableSort(items, sortDescriptor);

  const handleSortChange = (descriptor: SortDescriptor) => {
    setSortDescriptor(descriptor);
  };

  useEffect(() => {
    if (selectedSellerId) {
      fetchItems(selectedSellerId, condition);
    }
  }, [fetchItems, selectedSellerId, condition]);

  if (exchangeRate === null) {
    return null;
  }

  return (
    <Table
      classNames={{ base: "h-full overflow-auto", table: "min-h-[400px]" }}
      isHeaderSticky
      removeWrapper
      aria-label="Item list"
      selectionMode="single"
      sortDescriptor={sortDescriptor}
      onSortChange={handleSortChange}
      bottomContent={
        <div className="sticky bottom-0 flex w-full justify-center bg-white pt-4">
          <Pagination
            classNames={{ cursor: "bg-black text-white" }}
            page={pagination.currentPage}
            total={pagination.totalPages}
            onChange={(page) => fetchItems(selectedSellerId, condition, page)}
            size="md"
            showControls={true}
          />
        </div>
      }
      bottomContentPlacement="outside"
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
      <TableBody items={sortedItems as Item[]} emptyContent="No items found">
        {(item) => (
          <TableRow
            key={item.id}
            className="cursor-pointer"
            onClick={() => onClick(item.id)}
          >
            {(key: Key) => (
              <TableCell key={key}>
                <RenderCell
                  item={item}
                  columnKey={key as string}
                  exchangeRate={exchangeRate}
                />
              </TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
