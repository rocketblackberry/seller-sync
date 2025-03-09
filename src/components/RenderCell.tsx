import dayjs from "@/lib/dayjs";
import { Item } from "@/types";
import { calcProfit } from "@/utils";
import { Image } from "@nextui-org/react";

interface RenderCellProps {
  item: Item;
  columnKey: string;
  exchangeRate: number;
}

const RenderCell = ({ item, columnKey, exchangeRate }: RenderCellProps) => {
  const rightAlignKeys = [
    "price",
    "cost",
    "freight",
    "profit",
    "profit_rate",
    "stock",
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
      case "title":
        return <div className="min-w-[300px]">{item.title}</div>;
      case "price":
        return (
          item.price?.toLocaleString("ja-JP", {
            style: "decimal",
            minimumFractionDigits: 2,
          }) ?? "0"
        );
      case "cost":
        return item.cost?.toLocaleString("ja-JP") ?? "0";
      case "freight":
        return item.freight?.toLocaleString("ja-JP") ?? "0";
      case "profit":
        return calcProfit(
          item.price,
          item.cost,
          item.freight,
          item.fvf_rate,
          item.promote_rate,
          exchangeRate || 0,
        ).toLocaleString("ja-JP");
      case "profit_rate":
        return item.profit_rate?.toLocaleString("ja-JP") ?? "0";
      case "stock":
        return item.stock?.toLocaleString("ja-JP") ?? "0";
      case "updated_at":
        return dayjs.utc(item.updated_at).tz().format("YY/MM/DD HH:mm");
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
