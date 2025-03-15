import {
  CONDITION_OPTIONS,
  EBAY_EDIT_URL,
  SUPPLIER_OPTIONS,
} from "@/constants";
import { translateText } from "@/lib/deepl";
import { ItemForm } from "@/types";
import { formatFloat } from "@/utils";
import { Button, Form, Image, Textarea } from "@nextui-org/react";
import dayjs from "dayjs";
import { ChangeEvent, FocusEvent } from "react";
import { IoOpenOutline } from "react-icons/io5";
import FormInput from "./FormInput";

interface ItemDetailFormProps {
  form: ItemForm;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSupplierClick: (value: string) => void;
}

const ItemDetailForm = ({
  form,
  onChange,
  onSupplierClick,
}: ItemDetailFormProps) => {
  const translateDescription = async (e: FocusEvent<HTMLInputElement>) => {
    const { value } = e.target;

    try {
      const translatedText = value ? await translateText(value) : "";
      const event = {
        target: {
          name: "description",
          value: translatedText,
        },
      } as ChangeEvent<HTMLInputElement>;

      onChange(event);
    } catch (error) {
      console.error("Translation error:", error);
    }
  };

  return (
    <Form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
      <div className="grid w-full grid-cols-6 gap-4">
        <div className="row-span-2 flex flex-col items-start">
          <Image
            className="max-h-[120px] max-w-[120px] object-contain"
            src={form.image || "https://placehold.jp/80x80.png"}
            alt={form.title}
            radius="none"
          />
        </div>
        <FormInput
          isReadOnly
          className="col-span-4"
          name="title"
          label="タイトル"
          value={form.title}
        />
        <FormInput
          name="id"
          label="ID"
          value={form.id}
          variant="bordered"
          pattern="^[0-9]*$"
          maxLength={20}
          endContent={
            form.id ? (
              <a
                className="mb-[3px] flex items-center"
                href={EBAY_EDIT_URL.replace("$1", form.id)}
                target="_blank"
              >
                <IoOpenOutline />
              </a>
            ) : null
          }
          onFocus={(e) => e.target.select()}
          onChange={(e) => {
            if (/^\d*$/.test(e.target.value)) {
              onChange(e);
            }
          }}
        />
        <FormInput
          className="col-span-3"
          name="keyword"
          label="キーワード"
          value={form.keyword}
          maxLength={255}
          variant="bordered"
          onFocus={(e) => e.target.select()}
          onChange={onChange}
        />
        <div className="flex gap-2">
          {SUPPLIER_OPTIONS.map((supplier) => (
            <Button
              isDisabled={!form.keyword}
              size="sm"
              className={`${supplier.color} text-white`}
              onPress={() => onSupplierClick(supplier.value)}
              key={supplier.value}
            >
              {supplier.label}
            </Button>
          ))}
        </div>
      </div>
      <div className="grid w-full grid-cols-6 gap-4">
        <FormInput
          isReadOnly
          name="price"
          label="売値"
          value={formatFloat(form.price, 2)}
          unit="$"
          type="number"
        />
        <FormInput
          name="cost"
          label="仕入値"
          value={form.cost}
          defaultValue="0"
          min="0"
          max="999999"
          unit="&yen;"
          type="number"
          variant="bordered"
          onFocus={(e) => e.target.select()}
          onChange={onChange}
        />
        <FormInput
          name="weight"
          label="重量"
          value={form.weight}
          min="0"
          max="10"
          step="0.1"
          unit="kg"
          type="number"
          variant="bordered"
          onFocus={(e) => e.target.select()}
          onChange={onChange}
        />
        <FormInput
          isReadOnly
          name="freight"
          label="送料"
          value={form.freight}
          unit="&yen;"
          type="number"
        />
        <FormInput
          isReadOnly
          name="profit"
          label="利益"
          value={form.profit}
          unit="&yen;"
          type="number"
        />
        <FormInput
          name="profit_rate"
          label="利益率"
          value={form.profit_rate}
          min="0"
          max="100"
          step="0.1"
          unit="%"
          type="number"
          variant="bordered"
          onFocus={(e) => e.target.select()}
          onChange={onChange}
        />
        <FormInput
          isReadOnly
          name="fvf_rate"
          label="FVF率"
          value={formatFloat(form.fvf_rate)}
          unit="%"
          type="number"
        />
        <FormInput
          isReadOnly
          name="promote_rate"
          label="プロモート率"
          value={formatFloat(form.promote_rate)}
          unit="%"
          type="number"
        />
        <FormInput
          name="stock"
          label="在庫数"
          value={form.stock}
          min="0"
          max="99"
          unit="個"
          type="number"
          variant="bordered"
          onFocus={(e) => e.target.select()}
          onChange={onChange}
        />
        <FormInput
          isReadOnly
          name="condition"
          label="状態"
          value={
            CONDITION_OPTIONS.find(
              (condition) => condition.value === form.condition,
            )?.label
          }
        />
        <FormInput
          name="scrape_error"
          label="エラー"
          value={form.scrape_error}
          min="0"
          max="99"
          unit="回"
          type="number"
          variant="bordered"
          onFocus={(e) => e.target.select()}
          onChange={onChange}
        />
      </div>
      <div className="w-full">
        <FormInput
          name="url"
          label="仕入先URL"
          value={form.url}
          type="url"
          variant="bordered"
          endContent={
            <a
              className="mb-[3px] flex items-center"
              href={form.url}
              target="_blank"
            >
              <IoOpenOutline />
            </a>
          }
          onFocus={(e) => e.target.select()}
          onChange={onChange}
        />
      </div>
      <div className="grid w-full grid-cols-2 gap-4">
        <Textarea
          name="description_ja"
          label="説明文（日本語）"
          value={form.description_ja}
          variant="bordered"
          onFocus={(e) => e.target.select()}
          onChange={onChange}
          onBlur={translateDescription}
        />
        <Textarea
          isReadOnly
          name="description"
          label="説明文"
          value={form.description}
          onFocus={(e) => e.target.select()}
        />
      </div>
      <div className="flex w-full gap-4 text-xs">
        <span>
          （取得）
          {form.imported_at
            ? dayjs.utc(form.imported_at).tz().format("YYYY/MM/DD H:mm")
            : "-"}
        </span>
        <span>
          （調査）
          {form.scraped_at
            ? dayjs.utc(form.scraped_at).tz().format("YYYY/MM/DD H:mm")
            : "-"}
        </span>
        <span>
          （同期）
          {form.synced_at
            ? dayjs.utc(form.synced_at).tz().format("YYYY/MM/DD H:mm")
            : "-"}
        </span>
        <span>
          （作成）
          {form.created_at
            ? dayjs.utc(form.created_at).tz().format("YYYY/MM/DD H:mm")
            : "-"}
        </span>
        <span>
          （更新）
          {form.updated_at
            ? dayjs.utc(form.updated_at).tz().format("YYYY-MM-DD H:mm")
            : "-"}
        </span>
      </div>
    </Form>
  );
};

export default ItemDetailForm;
