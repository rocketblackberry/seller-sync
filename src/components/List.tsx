"use client";

import { useCallback, useEffect, useMemo, useState, Key } from "react";
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
import { IoOpenOutline, IoTrashOutline } from "react-icons/io5";
import dayjs from "dayjs";

interface SortDescriptor {
  column: string | number;
  direction: "ascending" | "descending";
}

type ListProps = {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onLink: (id: string) => void;
};

export default function List({ onEdit, onDelete, onLink }: ListProps) {
  const { exchangeRate } = useExchangeRate();
  const [items, setItems] = useState<Item[]>([]);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "",
    direction: "ascending",
  });

  const columns = [
    {
      key: "image",
      label: "写真",
      className: "w-[80px]",
    },
    {
      key: "itemId",
      label: "ID",
    },
    {
      key: "title",
      label: "タイトル",
      sortable: true,
    },
    {
      key: "price",
      label: "売値",
      sortable: true,
    },
    {
      key: "cost",
      label: "仕入値",
      sortable: true,
    },
    {
      key: "freight",
      label: "送料",
      sortable: true,
    },
    {
      key: "profit",
      label: "利益",
      sortable: true,
    },
    {
      key: "profitRate",
      label: "利益率",
      sortable: true,
    },
    {
      key: "stock",
      label: "在庫数",
      sortable: true,
    },
    {
      key: "view",
      label: "閲覧数",
      sortable: true,
    },
    {
      key: "watch",
      label: "ウォッチ数",
      sortable: true,
    },
    {
      key: "sold",
      label: "販売数",
      sortable: true,
    },
    {
      key: "updatedAt",
      label: "更新日時",
      sortable: true,
    },
    {
      key: "action",
      label: "アクション",
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
        "stock",
        "price",
        "cost",
        "freight",
        "profit",
        "margin",
        "view",
        "watch",
        "sold",
      ];
      const cellContent = (() => {
        switch (key) {
          case "image":
            return (
              <Image
                className="w-[80px] h-[80px]"
                src={item.image || "https://placehold.jp/80x80.png"}
                alt={item.title}
                width={80}
                radius="none"
              />
            );
          case "title":
            return (
              <div
                className="min-w-[200px] cursor-pointer"
                onClick={() => onEdit(item.id.toString())}
              >
                {item.title}
              </div>
            );
          case "stock":
            return item.stock?.toLocaleString("ja-JP") ?? "0";
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
            console.log(
              item.price,
              item.cost,
              item.freight,
              item.fvfRate,
              item.promoteRate,
              exchangeRate
            );
            return calcProfit(
              item.price,
              item.cost,
              item.freight,
              item.fvfRate,
              item.promoteRate,
              exchangeRate || 0
            ).toLocaleString("ja-JP");
          case "profitRate":
            return item.profitRate.toLocaleString("ja-JP");
          case "view":
            return item.view?.toLocaleString("ja-JP") ?? "0";
          case "watch":
            return item.watch?.toLocaleString("ja-JP") ?? "0";
          case "sold":
            return item.sold?.toLocaleString("ja-JP") ?? "0";
          case "updatedAt":
            return dayjs(item.updatedAt).format("YYYY/MM/DD HH:mm");
          case "action":
            return (
              <div className="flex">
                <Button
                  isIconOnly
                  variant="light"
                  onPress={() => onLink(item.id.toString())}
                >
                  <IoOpenOutline />
                </Button>
                <Button
                  isIconOnly
                  variant="light"
                  onPress={() => onDelete(item.id.toString())}
                >
                  <IoTrashOutline />
                </Button>
              </div>
            );
          default:
            return <>{item[key as keyof Item]}</>;
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

  useEffect(() => {
    fetch("/api/items")
      .then((response) => response.json())
      .then((items) => {
        setItems(items);
      });
  }, []);

  const handleSortChange = (descriptor: SortDescriptor) => {
    setSortDescriptor(descriptor);
  };

  return (
    <>
      <Table
        aria-label="Item list"
        sortDescriptor={sortDescriptor}
        onSortChange={handleSortChange}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.key}
              className={column.className}
              allowsSorting={column.sortable}
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={sortedItems}>
          {(item) => (
            <TableRow key={item.id}>
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
