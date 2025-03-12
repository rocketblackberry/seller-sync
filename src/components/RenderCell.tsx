import dayjs from "@/lib/dayjs";
import { Item } from "@/types";
import { Image, Tooltip } from "@nextui-org/react";

interface RenderCellProps {
  item: Item;
  columnKey: string;
}

const RenderCell = ({ item, columnKey }: RenderCellProps) => {
  const rightAlignKeys = [
    "price",
    "cost",
    "weight",
    "profit",
    "profit_rate",
    "stock",
    "error",
  ];

  const cellContent = (() => {
    switch (columnKey) {
      case "image":
        return (
          <div className="min-w-[80px]">
            <Image
              className="z-0 h-[80px] w-[80px] object-contain"
              src={item.image || "https://placehold.jp/80x80.png"}
              alt={item.title}
              width={80}
              height={80}
              radius="none"
            />
          </div>
        );
      case "id":
        return item.id;
      case "title":
        return (
          <div className="flex min-w-[300px] flex-col gap-1">
            <span>{item.title}</span>
            {item.keyword && (
              <span className="text-xs text-gray-500">{item.keyword}</span>
            )}
          </div>
        );
      case "price":
        return item.price > 0
          ? item.price?.toLocaleString("ja-JP", {
              style: "decimal",
              minimumFractionDigits: 2,
            })
          : "0";
      case "cost":
        return item.cost?.toLocaleString("ja-JP") ?? "0";
      case "weight":
        return (
          <Tooltip content={item.freight?.toLocaleString("ja-JP") ?? "0"}>
            {item.weight?.toLocaleString("ja-JP") ?? "0"}
          </Tooltip>
        );
      case "profit":
        return item.profit.toLocaleString("ja-JP") ?? "0";
      case "profit_rate":
        return item.profit_rate > 0
          ? item.profit_rate?.toLocaleString("ja-JP", {
              style: "decimal",
              minimumFractionDigits: 1,
            })
          : "0";
      case "stock":
        return item.stock?.toLocaleString("ja-JP") ?? "0";
      case "error":
        return item.scrape_error?.toLocaleString("ja-JP") ?? "0";
      case "imported_at":
        return item.imported_at
          ? dayjs.utc(item.imported_at).tz().format("YYYY/MM/DD HH:mm")
          : "-";
      case "scraped_at":
        return item.scraped_at
          ? dayjs.utc(item.scraped_at).tz().format("YYYY/MM/DD HH:mm")
          : "-";
      case "synced_at":
        return item.synced_at
          ? dayjs.utc(item.synced_at).tz().format("YYYY/MM/DD HH:mm")
          : "-";
      default:
        const value = item[columnKey as keyof Item];
        return <>{value instanceof Date ? value.toISOString() : value}</>;
    }
  })();

  return (
    <div className={rightAlignKeys.includes(columnKey) ? "text-right" : ""}>
      {cellContent}
    </div>
  );
};

export default RenderCell;
