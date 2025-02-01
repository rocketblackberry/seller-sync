"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { debounce } from "lodash";
import {
  Button,
  Form,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  SelectItem,
  Textarea,
} from "@nextui-org/react";
import {
  CONDITION_OPTIONS,
  EBAY_EDIT_URL,
  SUPPLIER_OPTIONS,
} from "@/constants";
import useExchangeRate from "@/hooks/useExchangeRate";
import {
  calcPrice,
  calcProfit,
  calcFreight,
  formToItem,
  itemToForm,
} from "@/utils";
import { Item, ItemForm } from "@/interfaces";
import { IoOpenOutline } from "react-icons/io5";

interface ItemDetailProps {
  item: Item;
  isOpen: boolean;
  onDelete: (id: number | undefined) => void;
  onSubmit: (item: Item) => void;
  onOpenChange: (isOpen: boolean) => void;
}

export default function ItemDetail({
  item,
  isOpen,
  onDelete,
  onSubmit,
  onOpenChange,
}: ItemDetailProps) {
  const { exchangeRate } = useExchangeRate();
  const [form, setForm] = useState<ItemForm>(itemToForm(item));

  const debouncedSetPrice = debounce(
    (cost, freight, profitRate, fvfRate, promoteRate, exchangeRate) => {
      setForm((prevItem) => ({
        ...prevItem,
        price: calcPrice(
          cost,
          freight,
          profitRate,
          fvfRate,
          promoteRate,
          exchangeRate
        ).toString(),
      }));
    },
    100
  );

  const debouncedSetProfit = debounce(
    (price, cost, freight, fvfRate, promoteRate, exchangeRate) => {
      setForm((prevItem) => ({
        ...prevItem,
        profit: calcProfit(
          price,
          cost,
          freight,
          fvfRate,
          promoteRate,
          exchangeRate
        ).toString(),
      }));
    },
    100
  );

  const debouncedSetFreight = debounce((weight) => {
    setForm((prevItem) => ({
      ...prevItem,
      freight: calcFreight(weight).toString(),
    }));
  }, 100);

  const isFormValid = (): boolean => {
    return !!(
      form.item_id &&
      form.keyword &&
      form.price &&
      form.cost &&
      form.weight &&
      form.profit_rate &&
      form.fvf_rate &&
      form.promote_rate &&
      form.stock &&
      form.supplier_url
    );
  };

  useEffect(() => {
    setForm(itemToForm(item));
  }, [item]);

  useEffect(() => {
    const { cost, freight, profit_rate, fvf_rate, promote_rate } = form;
    if (
      cost &&
      freight &&
      profit_rate &&
      fvf_rate &&
      promote_rate &&
      exchangeRate
    ) {
      debouncedSetPrice(
        cost,
        freight,
        profit_rate,
        fvf_rate,
        promote_rate,
        exchangeRate
      );
    }
  }, [
    form.cost,
    form.freight,
    form.profit_rate,
    form.fvf_rate,
    form.promote_rate,
    exchangeRate,
  ]);

  useEffect(() => {
    const { price, cost, freight, fvf_rate, promote_rate } = form;
    if (price && cost && freight && fvf_rate && promote_rate && exchangeRate) {
      debouncedSetProfit(
        price,
        cost,
        freight,
        fvf_rate,
        promote_rate,
        exchangeRate
      );
    }
  }, [form.price]);

  useEffect(() => {
    if (form.weight) {
      debouncedSetFreight(form.weight);
    }
  }, [form.weight]);

  /**
   * 仕入先ボタンが押された時
   */
  const handleSupplierClick = (value: string) => {
    const supplier = SUPPLIER_OPTIONS.find(
      (supplier) => supplier.value === value
    );
    if (supplier) {
      window.open(
        supplier.url.replaceAll("$1", encodeURIComponent(form?.keyword || "")),
        "_blank"
      );
    }
  };

  /**
   * アイテムが変更された時
   */
  const handleItemChange = (
    e:
      | ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
      | { target: { name: string; value: string } }
  ) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
  };

  /**
   * クリアボタンが押された時
   */
  const handleClear = () => {
    const resetForm = itemToForm(item);
    setForm(resetForm);
    const { cost, freight, profit_rate, fvf_rate, promote_rate } = resetForm;
    debouncedSetPrice(
      cost,
      freight,
      profit_rate,
      fvf_rate,
      promote_rate,
      exchangeRate
    );
    debouncedSetProfit(
      resetForm.price,
      cost,
      freight,
      fvf_rate,
      promote_rate,
      exchangeRate
    );
    debouncedSetFreight(resetForm.weight);
  };

  /**
   * 保存ボタンが押された時
   */
  const handleSubmit = async (): Promise<void> => {
    try {
      const response = await fetch("/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formToItem(form)),
      });

      if (!response.ok) {
        throw new Error(`Failed to save item`);
      }

      await response.json();
      onOpenChange(false);
    } catch (error) {
      console.error(`Error saving item:`, error);
    }
  };

  return (
    <Modal
      size="5xl"
      scrollBehavior="inside"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>リサーチ</ModalHeader>
            <ModalBody>
              <Form
                className="flex flex-col gap-4"
                onSubmit={(e) => e.preventDefault()}
              >
                <div className="grid grid-cols-5 gap-4 w-full">
                  <Input
                    className="col-span-3"
                    name="title"
                    label="タイトル"
                    value={form.title}
                    placeholder=" "
                    onChange={handleItemChange}
                  />
                  <Select
                    label="状態"
                    name="condition"
                    selectedKeys={[form.condition]}
                    placeholder=" "
                    onChange={handleItemChange}
                  >
                    {CONDITION_OPTIONS.map((condition) => (
                      <SelectItem key={condition.value}>
                        {condition.label}
                      </SelectItem>
                    ))}
                  </Select>
                  <Input
                    isRequired
                    name="item_id"
                    label="ID"
                    value={form.item_id}
                    placeholder=" "
                    variant="bordered"
                    endContent={
                      <a
                        className="flex items-center mb-[3px]"
                        href={EBAY_EDIT_URL.replace("$1", form.item_id)}
                        target="_blank"
                      >
                        <IoOpenOutline />
                      </a>
                    }
                    onChange={handleItemChange}
                  />
                </div>
                <div className="grid grid-cols-5 gap-4 w-full">
                  <Input
                    isRequired
                    className="col-span-3"
                    name="keyword"
                    label="キーワード"
                    value={form.keyword}
                    placeholder=" "
                    variant="bordered"
                    onChange={handleItemChange}
                  />
                  <div className="flex gap-2">
                    {SUPPLIER_OPTIONS.map((supplier) => (
                      <Button
                        isDisabled={!form.keyword}
                        className={`${supplier.color} text-white`}
                        onPress={() => handleSupplierClick(supplier.value)}
                        key={supplier.value}
                      >
                        {supplier.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-4 w-full">
                  <Input
                    isReadOnly
                    isRequired
                    name="price"
                    label="売値"
                    value={form.price}
                    placeholder=" "
                    endContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-default-400 text-small">$</span>
                      </div>
                    }
                    type="number"
                    onChange={handleItemChange}
                  />
                  <Input
                    isRequired
                    name="cost"
                    label="仕入値"
                    value={form.cost}
                    placeholder=" "
                    endContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-default-400 text-small">
                          &yen;
                        </span>
                      </div>
                    }
                    type="number"
                    variant="bordered"
                    onChange={handleItemChange}
                  />
                  <Input
                    isRequired
                    name="weight"
                    label="重量"
                    value={form.weight}
                    min="0"
                    max="10"
                    step="0.1"
                    placeholder=" "
                    endContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-default-400 text-small">kg</span>
                      </div>
                    }
                    type="number"
                    variant="bordered"
                    onChange={handleItemChange}
                  />
                  <Input
                    isReadOnly
                    name="freight"
                    label="送料"
                    value={form.freight}
                    placeholder=" "
                    endContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-default-400 text-small">
                          &yen;
                        </span>
                      </div>
                    }
                    type="number"
                  />
                  <Input
                    isReadOnly
                    name="profit"
                    label="利益"
                    value={form.profit}
                    placeholder=" "
                    endContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-default-400 text-small">
                          &yen;
                        </span>
                      </div>
                    }
                    type="number"
                  />
                  <Input
                    isRequired
                    name="profit_rate"
                    label="利益率"
                    value={form.profit_rate}
                    placeholder=" "
                    endContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-default-400 text-small">%</span>
                      </div>
                    }
                    type="number"
                    onChange={handleItemChange}
                  />
                  <Input
                    isRequired
                    name="fvf_rate"
                    label="FVF率"
                    value={form.fvf_rate}
                    placeholder=" "
                    endContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-default-400 text-small">%</span>
                      </div>
                    }
                    type="number"
                    onChange={handleItemChange}
                  />
                  <Input
                    isRequired
                    name="promote_rate"
                    label="プロモート率"
                    value={form.promote_rate}
                    placeholder=" "
                    endContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-default-400 text-small">%</span>
                      </div>
                    }
                    type="number"
                    onChange={handleItemChange}
                  />
                  <Input
                    isRequired
                    name="stock"
                    label="在庫数"
                    value={form.stock}
                    placeholder=" "
                    endContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-default-400 text-small">個</span>
                      </div>
                    }
                    type="number"
                    onChange={handleItemChange}
                  />
                </div>
                <div className="w-full">
                  <Input
                    isRequired
                    name="supplier_url"
                    label="仕入先URL"
                    value={form.supplier_url}
                    placeholder=" "
                    variant="bordered"
                    endContent={
                      <a
                        className="flex items-center mb-[3px]"
                        href={form.supplier_url}
                        target="_blank"
                      >
                        <IoOpenOutline />
                      </a>
                    }
                    onChange={handleItemChange}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 w-full">
                  <Textarea
                    name="description_ja"
                    label="説明文［日］"
                    value={form.description_ja}
                    placeholder=" "
                    variant="bordered"
                    onChange={handleItemChange}
                  />
                  <Textarea
                    isReadOnly
                    name="description"
                    label="説明文"
                    value={form.description}
                    placeholder=" "
                    onChange={handleItemChange}
                  />
                </div>
              </Form>
            </ModalBody>
            <ModalFooter>
              <div className="flex items-center justify-between w-full">
                <Button
                  isDisabled={!form.id}
                  onPress={() => onDelete(form.id)}
                  variant="bordered"
                  color={form.id ? "danger" : "default"}
                >
                  削除
                </Button>
                <div className="flex items-center gap-4">
                  <Button onPress={handleClear}>クリア</Button>
                  <Button
                    isDisabled={!isFormValid()}
                    color="primary"
                    onPress={handleSubmit}
                  >
                    保存
                  </Button>
                </div>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
