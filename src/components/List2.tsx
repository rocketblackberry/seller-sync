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
import { IItem2 } from "@/interfaces";
import { calcProfit } from "@/utils";
import useExchangeRate from "@/hooks/useExchangeRate";
import { IoOpenOutline, IoTrashOutline } from "react-icons/io5";
import dayjs from "dayjs";

interface SortDescriptor {
  column: string | number;
  direction: "ascending" | "descending";
}

type ItemListProps = {
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onLink: (id: number) => void;
};

export default function List({ onEdit, onDelete, onLink }: ItemListProps) {
  const { exchangeRate } = useExchangeRate();
  const [items, setItems] = useState<IItem2[]>([]);
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
      key: "title",
      label: "タイトル",
      sortable: true,
    },
    {
      key: "stock",
      label: "在庫数",
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
      key: "margin",
      label: "利益率",
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
      key: "keyword",
      label: "キーワード",
      sortable: true,
    },
    {
      key: "updated_at",
      label: "更新日時",
      sortable: true,
    },
    {
      key: "action",
      label: "アクション",
    },
  ];

  const sortedItems: IItem2[] = useMemo(() => {
    return [...items].sort((a, b) => {
      if (sortDescriptor.column) {
        const aValue = a[sortDescriptor.column as keyof IItem2];
        const bValue = b[sortDescriptor.column as keyof IItem2];
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
    (item: IItem2, key: string) => {
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
                className="min-w-[200px]"
                onClick={() => onEdit(item.id || -1)}
              >
                {item.title}
              </div>
            );
          case "stock":
            return item.stock?.toLocaleString("ja-JP") || "-";
          case "price":
            return item.price.toLocaleString("ja-JP", {
              style: "decimal",
              minimumFractionDigits: 2,
            });
          case "cost":
            return Math.round(item.cost || 0).toLocaleString("ja-JP");
          case "freight":
            return Math.round(item.freight || 0).toLocaleString("ja-JP");
          case "profit":
            return calcProfit(
              item.price,
              item.cost,
              item.freight,
              exchangeRate || 0
            ).toLocaleString("ja-JP");
          case "margin":
            return (0).toLocaleString("ja-JP");
          case "view":
          case "watch":
          case "sold":
            return item.view?.toLocaleString("ja-JP") ?? "0";
          case "updated_at":
            return dayjs(item.updated_at).format("YYYY/MM/DD HH:mm");
          case "action":
            return (
              <div className="flex">
                <Button
                  isIconOnly
                  variant="light"
                  onPress={() => onLink(item.id || -1)}
                >
                  <IoOpenOutline />
                </Button>
                <Button
                  isIconOnly
                  variant="light"
                  onPress={() => onDelete(item.id || -1)}
                >
                  <IoTrashOutline />
                </Button>
              </div>
            );
          default:
            return <>{item[key as keyof IItem2]}</>;
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
    fetch("/api/items2")
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
