"use client";

import { useMemo, useState, useEffect, Key } from "react";
import {
  Checkbox,
  Image,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/react";
import { IItem } from "@/interfaces";
import { getProfit } from "@/utils";
import useExchangeRate from "@/hooks/useExchangeRate";

interface SortDescriptor {
  column: string | number;
  direction: "ascending" | "descending";
}

type ItemListProps = {
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
};

export default function ItemList({ onEdit, onDelete }: ItemListProps) {
  const { exchangeRate } = useExchangeRate();
  const [items, setItems] = useState<IItem[]>([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "",
    direction: "ascending",
  });

  const columns = [
    {
      key: "check",
      label: (
        <Checkbox
          isSelected={isAllSelected}
          onChange={(e) => handleAllCheckboxChange(e.target.checked)}
        />
      ),
    },
    {
      key: "image",
      label: "Photo",
    },
    {
      key: "title",
      label: "Title",
      sortable: true,
    },
    {
      key: "price",
      label: "Price ($)",
      sortable: true,
    },
    {
      key: "stock",
      label: "Stock",
      sortable: true,
    },
    {
      key: "cost",
      label: "Cost (¥)",
      sortable: true,
    },
    {
      key: "freight",
      label: "Freight (¥)",
      sortable: true,
    },
    {
      key: "profit",
      label: "Profit (¥)",
      sortable: true,
    },
    {
      key: "margin",
      label: "Margin (%)",
      sortable: true,
    },
    {
      key: "view",
      label: "View",
      sortable: true,
    },
    {
      key: "watch",
      label: "Watch",
      sortable: true,
    },
    {
      key: "sold",
      label: "Sold",
      sortable: true,
    },
    {
      key: "supplier",
      label: "Supplier",
      sortable: true,
    },
    {
      key: "search",
      label: "Search",
    },
  ];

  const sortedItems: IItem[] = useMemo(() => {
    return [...items].sort((a, b) => {
      if (sortDescriptor.column) {
        const aValue = a[sortDescriptor.column as keyof IItem];
        const bValue = b[sortDescriptor.column as keyof IItem];
        if (aValue < bValue) {
          return sortDescriptor.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortDescriptor.direction === "ascending" ? 1 : -1;
        }
      }
      return 0;
    });
  }, [items, sortDescriptor]);

  const renderCell = (item: IItem, key: string) => {
    switch (key) {
      case "check":
        return (
          <Checkbox
            isSelected={item.selected}
            onChange={(e) => handleCheckboxChange(item.id, e.target.checked)}
          />
        );
      case "image":
        return item.images?.map((image, i) => (
          <Image
            key={i}
            src={image}
            alt={item.title}
            width={50}
            radius="none"
          />
        ));
      case "title":
        return <div onClick={() => onEdit(item.id || -1)}>{item.title}</div>;
      case "price":
        return item.price.toLocaleString("ja-JP", {
          style: "decimal",
          minimumFractionDigits: 2,
        });
      case "cost":
        return Math.trunc(item.cost || 0).toLocaleString("ja-JP");
      case "freight":
        return Math.trunc(item.freight || 0).toLocaleString("ja-JP");
      case "profit":
        return getProfit(item, exchangeRate).toLocaleString("ja-JP");
      case "margin":
        return (0).toLocaleString("ja-JP");
      default:
        return <>{item[key as keyof IItem]}</>;
    }
  };

  useEffect(() => {
    fetch("/api/items")
      .then((response) => response.json())
      .then((items) => {
        setItems(items.map((item: IItem) => ({ ...item, selected: false })));
      });
  }, []);

  const handleSortChange = (descriptor: SortDescriptor) => {
    setSortDescriptor(descriptor);
  };

  const handleAllCheckboxChange = (checked: boolean) => {
    setIsAllSelected(checked);
    setItems(items.map((item) => ({ ...item, selected: checked })));
  };

  const handleCheckboxChange = (id: number, checked: boolean) => {
    const newItems = items.map((item) => {
      return item.id === id ? { ...item, selected: checked } : item;
    });
    setItems(newItems);
    setIsAllSelected(newItems.every((item) => item.selected));
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
            <TableColumn key={column.key} allowsSorting={column.sortable}>
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={sortedItems}>
          {(item) => (
            <TableRow key={item.id}>
              {(key: Key) => (
                <TableCell>{renderCell(item, key as string)}</TableCell>
              )}
            </TableRow>
          )}
          {/* sortedData.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <Checkbox
                  isSelected={item.selected}
                  onChange={(e) =>
                    handleCheckboxChange(item.id, e.target.checked)
                  }
                />
              </TableCell>
              <TableCell>
                {item.images.map((image, i) => (
                  <Image
                    key={i}
                    src={image}
                    alt={item.title}
                    width={50}
                    radius="none"
                  />
                ))}
              </TableCell>
              <TableCell>
                <a href="">{item.title}</a>
              </TableCell>
              <TableCell>{item.view}</TableCell>
              <TableCell>{item.watch}</TableCell>
              <TableCell>{item.sold}</TableCell>
              <TableCell>{item.stock}</TableCell>
              <TableCell>
                {item.price.toLocaleString("ja-JP", {
                  style: "decimal",
                  minimumFractionDigits: 2,
                })}
              </TableCell>
              <TableCell>{item.cost.toLocaleString("ja-JP")}</TableCell>
              <TableCell>{item.freight.toLocaleString("ja-JP")}</TableCell>
              <TableCell>0</TableCell>
              <TableCell>0</TableCell>
              <TableCell>
                <a
                  className="whitespace-nowrap"
                  href={item.supplierUrl}
                  target="_blank"
                >
                  {item.supplier}
                </a>
              </TableCell>
              <TableCell>
                <div>
                  <div className="whitespace-nowrap">
                    {item.maker} {item.name}
                  </div>
                  <div className="flex gap-1">
                    <Avatar
                      className="w-4 h-4 bg-green-500 cursor-pointer"
                      name="G"
                      onClick={onOpen}
                    />
                    <a href="">
                      <Avatar className="w-4 h-4 bg-orange-500" name="A" />
                    </a>
                    <a href="">
                      <Avatar className="w-4 h-4 bg-blue-400" name="メ" />
                    </a>
                    <a href="">
                      <Avatar className="w-4 h-4 bg-red-500" name="Y" />
                    </a>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          )) */}
        </TableBody>
      </Table>
    </>
  );
}
