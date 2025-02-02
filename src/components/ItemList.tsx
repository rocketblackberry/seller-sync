"use client";

import { useCallback, useMemo, useState, Key } from "react";
import {
  Button,
  Image,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/react";
import { Item } from "@/interfaces";
import { calcProfit } from "@/utils";
import useExchangeRate from "@/hooks/useExchangeRate";
import { IoTrashOutline } from "react-icons/io5";
import dayjs from "dayjs";

interface SortDescriptor {
  column: string | number;
  direction: "ascending" | "descending";
}

type ItemListProps = {
  items: Item[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
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

  const columns = [
    {
      key: "image",
      label: "写真",
      width: "200px",
    },
    {
      key: "title",
      label: "タイトル",
      sortable: true,
      width: "500px",
    },
    {
      key: "price",
      label: "売値",
      sortable: true,
      width: "50px",
    },
    {
      key: "cost",
      label: "仕入値",
      sortable: true,
      width: "50px",
    },
    {
      key: "freight",
      label: "送料",
      sortable: true,
      width: "50px",
    },
    {
      key: "profit",
      label: "利益",
      sortable: true,
      width: "50px",
    },
    {
      key: "profit_rate",
      label: "利益率",
      sortable: true,
      width: "50px",
    },
    {
      key: "stock",
      label: "在庫数",
      sortable: true,
      width: "50px",
    },
    {
      key: "view",
      label: "閲覧数",
      sortable: true,
      width: "50px",
    },
    {
      key: "watch",
      label: "ウォッチ数",
      sortable: true,
      width: "50px",
    },
    {
      key: "sold",
      label: "販売数",
      sortable: true,
      width: "50px",
    },
    {
      key: "updated_at",
      label: "更新日時",
      sortable: true,
      width: "200px",
    },
    {
      key: "action",
      label: "削除",
      width: "50px",
    },
  ];

  const sortedItems: Item[] = useMemo(() => {
    return [...items].sort((a, b) => {
      if (sortDescriptor.column) {
        const aValue = a[sortDescriptor.column as keyof Item];
        const bValue = b[sortDescriptor.column as keyof Item];
        if (aValue !== undefined && bValue !== undefined && aValue < bValue) {
          return sortDescriptor.direction === "ascending" ? -1 : 1;
        }
        if (aValue !== undefined && bValue !== undefined && aValue > bValue) {
          return sortDescriptor.direction === "ascending" ? 1 : -1;
        }
      }
      return 0;
    });
  }, [items, sortDescriptor]);

  const renderCell = useCallback(
    (item: Item, key: string) => {
      const rightAlignKeys = [
        "price",
        "cost",
        "freight",
        "profit",
        "profit_rate",
        "stock",
        "view",
        "watch",
        "sold",
      ];
      const cellContent = (() => {
        switch (key) {
          case "image":
            return (
              <Image
                className="w-[100px] h-[100px] object-contain"
                src={item.image || "https://placehold.jp/100x100.png"}
                alt={item.title}
                width={100}
                height={100}
                radius="none"
              />
            );
          case "title":
            return item.title;
          case "price":
            return item.price.toLocaleString("ja-JP", {
              style: "decimal",
              minimumFractionDigits: 2,
            });
          case "cost":
            return item.cost.toLocaleString("ja-JP");
          case "freight":
            return item.freight.toLocaleString("ja-JP");
          case "profit":
            return calcProfit(
              item.price,
              item.cost,
              item.freight,
              item.fvf_rate,
              item.promote_rate,
              exchangeRate || 0
            ).toLocaleString("ja-JP");
          case "profit_rate":
            return item.profit_rate.toLocaleString("ja-JP") ?? "0";
          case "stock":
            return item.stock?.toLocaleString("ja-JP") ?? "0";
          case "view":
            return item.view?.toLocaleString("ja-JP") ?? "0";
          case "watch":
            return item.watch?.toLocaleString("ja-JP") ?? "0";
          case "sold":
            return item.sold?.toLocaleString("ja-JP") ?? "0";
          case "updated_at":
            return dayjs(item.updated_at).format("YY/MM/DD HH:mm");
          case "action":
            return (
              <div className="flex items-center justify-center">
                <Button
                  isIconOnly
                  variant="light"
                  onPress={() => onDelete(item.id)}
                >
                  <IoTrashOutline />
                </Button>
              </div>
            );
          default:
            const value = item[key as keyof Item];
            return <>{value instanceof Date ? value.toISOString() : value}</>;
        }
      })();

      return (
        <div className={rightAlignKeys.includes(key) ? "text-right" : ""}>
          {cellContent}
        </div>
      );
    },
    [exchangeRate, onEdit, onDelete]
  );

  const handleSortChange = (descriptor: SortDescriptor) => {
    setSortDescriptor(descriptor);
  };

  return (
    <>
      <Table
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
                  {renderCell(item, key as string)}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
}
