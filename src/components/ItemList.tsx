"use client";

import { columns } from "@/components/Columns";
import RenderCell from "@/components/RenderCell";
import {
  useItemsStore,
  useSearchConditionStore,
  useSellerStore,
} from "@/stores";
import {
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import { SortDescriptor } from "@react-types/shared";
import { Key, useEffect, useState } from "react";

type ItemListProps = {
  onClick: (id: string) => void;
};

export default function ItemList({ onClick }: ItemListProps) {
  const { selectedSellerId } = useSellerStore();
  const { items, fetchItems, pagination } = useItemsStore();
  const { condition } = useSearchConditionStore();
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "created_at",
    direction: "descending",
  });

  const handleSortChange = (descriptor: SortDescriptor) => {
    setSortDescriptor(descriptor);
    if (selectedSellerId) {
      fetchItems(
        selectedSellerId,
        condition,
        descriptor.column as string,
        descriptor.direction,
      );
    }
  };

  useEffect(() => {
    if (selectedSellerId) {
      fetchItems(
        selectedSellerId,
        condition,
        sortDescriptor.column as string,
        sortDescriptor.direction,
      );
    }
  }, [fetchItems, selectedSellerId, condition, sortDescriptor]);

  return (
    <Table
      classNames={{ base: "h-full overflow-auto", table: "min-h-[200px]" }}
      isHeaderSticky
      removeWrapper
      aria-label="Item list"
      // selectionMode="single"
      sortDescriptor={sortDescriptor}
      onSortChange={handleSortChange}
      bottomContent={
        <div className="sticky bottom-0 grid w-full grid-cols-4 gap-4 bg-white pt-4">
          <div className="flex items-center text-sm">
            {`${pagination.totalItems.toLocaleString("ja-JP") ?? "0"} / ${pagination.availableItems?.toLocaleString("ja-JP") ?? "0"} / ${pagination.notAvailableItems?.toLocaleString("ja-JP") ?? "0"} items`}
          </div>
          <div className="col-span-2 flex items-center justify-center">
            <Pagination
              classNames={{ cursor: "bg-black text-white" }}
              page={pagination.currentPage}
              total={pagination.totalPages}
              onChange={(page) =>
                fetchItems(
                  selectedSellerId,
                  condition,
                  sortDescriptor.column as string,
                  sortDescriptor.direction,
                  page,
                )
              }
              size="md"
              showControls={true}
            />
          </div>
        </div>
      }
      bottomContentPlacement="outside"
    >
      <TableHeader columns={columns}>
        {(column) => (
          <TableColumn
            key={column.key}
            allowsSorting={column.sortable}
            align={
              column.align === "center"
                ? "center"
                : column.align === "right"
                  ? "end"
                  : "start"
            }
          >
            {column.label}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody items={items} emptyContent="No items found">
        {(item) => (
          <TableRow
            key={item.id}
            className={`cursor-pointer border-b ${
              item.scrape_error > 0
                ? "bg-red-50"
                : item.stock === 0
                  ? "bg-gray-100"
                  : ""
            }`}
            onClick={() => onClick(item.id)}
          >
            {(key: Key) => (
              <TableCell key={key}>
                <RenderCell item={item} columnKey={key as string} />
              </TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
