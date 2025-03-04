import {
  CONDITION_OPTIONS,
  EBAY_EDIT_URL,
  SUPPLIER_OPTIONS,
} from "@/constants";
import { translateText } from "@/lib/deepl";
import { ItemForm } from "@/types";
import {
  Button,
  Form,
  Image,
  Select,
  SelectItem,
  Textarea,
} from "@nextui-org/react";
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
    if (!value) return;

    try {
      const translatedText = await translateText(value);
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
          onChange={onChange}
        />
        <FormInput
          name="id"
          label="ID"
          value={form.id}
          variant="bordered"
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
          onChange={onChange}
        />
        <FormInput
          className="col-span-3"
          name="keyword"
          label="キーワード"
          value={form.keyword}
          variant="bordered"
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
          value={form.price}
          unit="$"
          type="number"
          onChange={onChange}
        />
        <FormInput
          name="cost"
          label="仕入値"
          value={form.cost}
          unit="&yen;"
          type="number"
          variant="bordered"
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
          unit="%"
          type="number"
          variant="bordered"
          onChange={onChange}
        />
        <FormInput
          isReadOnly
          name="fvf_rate"
          label="FVF率"
          value={form.fvf_rate}
          unit="%"
          type="number"
          onChange={onChange}
        />
        <FormInput
          isReadOnly
          name="promote_rate"
          label="プロモート率"
          value={form.promote_rate}
          unit="%"
          type="number"
          onChange={onChange}
        />
        <FormInput
          name="stock"
          label="在庫数"
          value={form.stock}
          unit="個"
          type="number"
          variant="bordered"
          onChange={onChange}
        />
        <Select
          label="状態"
          name="condition"
          selectedKeys={[form.condition]}
          onChange={onChange}
        >
          {CONDITION_OPTIONS.map((condition) => (
            <SelectItem key={condition.value}>{condition.label}</SelectItem>
          ))}
        </Select>
      </div>
      <div className="w-full">
        <FormInput
          isRequired
          name="supplier_url"
          label="仕入先URL"
          value={form.supplier_url}
          variant="bordered"
          endContent={
            <a
              className="mb-[3px] flex items-center"
              href={form.supplier_url}
              target="_blank"
            >
              <IoOpenOutline />
            </a>
          }
          onChange={onChange}
        />
      </div>
      <div className="grid w-full grid-cols-2 gap-4">
        <Textarea
          name="description_ja"
          label="説明文（日本語）"
          value={form.description_ja}
          variant="bordered"
          onChange={onChange}
          onBlur={translateDescription}
        />
        <Textarea
          isReadOnly
          name="description"
          label="説明文"
          value={form.description}
        />
      </div>
    </Form>
  );
};

export default ItemDetailForm;
