import dayjs from "@/lib/dayjs";
import { Item } from "@/types";
import { calcProfit } from "@/utils";
import { Button, Image } from "@nextui-org/react";
import { FC } from "react";
import { IoTrashOutline } from "react-icons/io5";

interface RenderCellProps {
  item: Item;
  columnKey: string;
  exchangeRate: number;
  onDelete: (id: string) => void;
}

const RenderCell: FC<RenderCellProps> = ({
  item,
  columnKey,
  exchangeRate,
  onDelete,
}) => {
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
    switch (columnKey) {
      case "image":
        return (
          <Image
            className="h-[100px] w-[100px] object-contain"
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
      case "view":
        return item.view?.toLocaleString("ja-JP") ?? "0";
      case "watch":
        return item.watch?.toLocaleString("ja-JP") ?? "0";
      case "sold":
        return item.sold?.toLocaleString("ja-JP") ?? "0";
      case "updated_at":
        return dayjs.utc(item.updated_at).tz().format("YY/MM/DD HH:mm");
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
