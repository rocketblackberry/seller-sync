import {
  CONDITION_OPTIONS,
  EBAY_EDIT_URL,
  SUPPLIER_OPTIONS,
} from "@/constants";
import { ItemForm } from "@/types";
import { Button, Form, Select, SelectItem, Textarea } from "@nextui-org/react";
import { ChangeEvent, FC } from "react";
import { IoOpenOutline } from "react-icons/io5";
import FormInput from "./FormInput";

interface ItemDetailFormProps {
  form: ItemForm;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSupplierClick: (value: string) => void;
}

const ItemDetailForm: FC<ItemDetailFormProps> = ({
  form,
  onChange,
  onSupplierClick,
}) => {
  return (
    <Form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
      <div className="grid w-full grid-cols-5 gap-4">
        <FormInput
          className="col-span-3"
          name="title"
          label="タイトル"
          value={form.title}
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
        <FormInput
          isRequired
          name="item_id"
          label="ID"
          value={form.item_id}
          variant="bordered"
          endContent={
            <a
              className="mb-[3px] flex items-center"
              href={EBAY_EDIT_URL.replace("$1", form.item_id)}
              target="_blank"
            >
              <IoOpenOutline />
            </a>
          }
          onChange={onChange}
        />
      </div>
      <div className="grid w-full grid-cols-5 gap-4">
        <FormInput
          isRequired
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
              className={`${supplier.color} text-white`}
              onPress={() => onSupplierClick(supplier.value)}
              key={supplier.value}
            >
              {supplier.label}
            </Button>
          ))}
        </div>
      </div>
      <div className="grid w-full grid-cols-5 gap-4">
        <FormInput
          isReadOnly
          isRequired
          name="price"
          label="売値"
          value={form.price}
          unit="$"
          type="number"
          onChange={onChange}
        />
        <FormInput
          isRequired
          name="cost"
          label="仕入値"
          value={form.cost}
          unit="&yen;"
          type="number"
          variant="bordered"
          onChange={onChange}
        />
        <FormInput
          isRequired
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
          isRequired
          name="profit_rate"
          label="利益率"
          value={form.profit_rate}
          unit="%"
          type="number"
          onChange={onChange}
        />
        <FormInput
          isRequired
          name="fvf_rate"
          label="FVF率"
          value={form.fvf_rate}
          unit="%"
          type="number"
          onChange={onChange}
        />
        <FormInput
          isRequired
          name="promote_rate"
          label="プロモート率"
          value={form.promote_rate}
          unit="%"
          type="number"
          onChange={onChange}
        />
        <FormInput
          isRequired
          name="stock"
          label="在庫数"
          value={form.stock}
          unit="個"
          type="number"
          onChange={onChange}
        />
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
          label="説明文［日］"
          value={form.description_ja}
          variant="bordered"
          onChange={onChange}
        />
        <Textarea
          isReadOnly
          name="description"
          label="説明文"
          value={form.description}
          onChange={onChange}
        />
      </div>
    </Form>
  );
};

export default ItemDetailForm;
