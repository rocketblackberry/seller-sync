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
  FVF_RATE,
  PROMOTE_RATE,
  SUPPLIER_OPTIONS,
} from "@/constants";
import useExchangeRate from "@/hooks/useExchangeRate";
import { calcPrice, calcProfit, calcFreight } from "@/utils";
import { ItemField } from "@/interfaces";
import { IoOpenOutline } from "react-icons/io5";

const defaultItem: ItemField = {
  id: "",
  item_id: "",
  keyword: "",
  title: "",
  condition: "used",
  description: "",
  description_ja: "",
  supplier_url: "",
  price: "",
  cost: "",
  weight: "1.0",
  freight: "",
  profit: "",
  profit_rate: "10",
  fvf_rate: FVF_RATE.toString(),
  promote_rate: PROMOTE_RATE.toString(),
  stock: "1",
  status: "draft",
};

interface DetailProps {
  itemId: string | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function Detail({ itemId, isOpen, onOpenChange }: DetailProps) {
  const { exchangeRate } = useExchangeRate();
  const [item, setItem] = useState<ItemField>(defaultItem);
  const [isFormValid, setIsFormValid] = useState(false);

  const debouncedSetPrice = debounce(
    (cost, freight, profitRate, fvfRate, promoteRate, exchangeRate) => {
      setItem((prevItem) => ({
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
    (price, cost, freight, fvfRate, promoRate, exchangeRate) => {
      setItem((prevItem) => ({
        ...prevItem,
        profit: calcProfit(
          price,
          cost,
          freight,
          fvfRate,
          promoRate,
          exchangeRate
        ).toString(),
      }));
    },
    100
  );

  const debouncedSetFreight = debounce((weight) => {
    setItem((prevItem) => ({
      ...prevItem,
      freight: calcFreight(weight).toString(),
    }));
  }, 100);

  useEffect(() => {
    if (itemId) {
      fetch(`/api/items/${itemId}`)
        .then((response) => response.json())
        .then((data) => {
          setItem(data);
        })
        .catch((error) => {
          console.error("Error fetching item:", error);
        });
    } else {
      setItem(defaultItem);
    }
  }, [itemId]);

  useEffect(() => {
    const { cost, freight, profit_rate, fvf_rate, promote_rate } = item;
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
    item.cost,
    item.freight,
    item.profit_rate,
    item.fvf_rate,
    item.promote_rate,
    exchangeRate,
  ]);

  useEffect(() => {
    const { price, cost, freight, fvf_rate, promote_rate } = item;
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
  }, [item.price]);

  useEffect(() => {
    if (item.weight) {
      debouncedSetFreight(item.weight);
    }
  }, [item.weight]);

  useEffect(() => {
    const isValid = !!(
      item.item_id &&
      item.keyword &&
      item.cost &&
      item.weight &&
      item.profit_rate &&
      item.fvf_rate &&
      item.promote_rate &&
      item.stock &&
      item.supplier_url
    );
    setIsFormValid(isValid);
  }, [item]);

  const handleSupplierClick = (value: string) => {
    const supplier = SUPPLIER_OPTIONS.find(
      (supplier) => supplier.value === value
    );
    if (supplier) {
      window.open(
        supplier.url.replaceAll("$1", encodeURIComponent(item?.keyword || "")),
        "_blank"
      );
    }
  };

  const handleItemChange = (
    e:
      | ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
      | { target: { name: string; value: string } }
  ) => {
    const { name, value } = e.target;
    setItem({
      ...item,
      [name]: value,
    });
  };

  const handleClear = () => {
    setItem(defaultItem);
  };

  const handleSubmit = async (): Promise<void> => {
    try {
      const response = await fetch("/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(item),
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
                    value={item.title}
                    placeholder=" "
                    onChange={handleItemChange}
                  />
                  <Select
                    label="状態"
                    name="condition"
                    selectedKeys={[item.condition]}
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
                    value={item.item_id}
                    placeholder=" "
                    variant="bordered"
                    endContent={
                      <a
                        className="flex items-center mb-[3px]"
                        href={EBAY_EDIT_URL.replace("$1", item.item_id)}
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
                    value={item.keyword}
                    placeholder=" "
                    variant="bordered"
                    onChange={handleItemChange}
                  />
                  <div className="flex gap-2">
                    {SUPPLIER_OPTIONS.map((supplier) => (
                      <Button
                        isDisabled={!item.keyword}
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
                    value={item.price}
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
                    value={item.cost}
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
                    value={item.weight}
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
                    value={item.freight}
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
                    value={item.profit}
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
                    value={item.profit_rate}
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
                    value={item.fvf_rate}
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
                    value={item.promote_rate}
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
                    value={item.stock}
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
                    value={item.supplier_url}
                    placeholder=" "
                    variant="bordered"
                    onChange={handleItemChange}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 w-full">
                  <Textarea
                    name="description_ja"
                    label="説明文［日］"
                    value={item.description_ja}
                    placeholder=" "
                    variant="bordered"
                    onChange={handleItemChange}
                  />
                  <Textarea
                    isReadOnly
                    name="description"
                    label="説明文"
                    value={item.description}
                    placeholder=" "
                    onChange={handleItemChange}
                  />
                </div>
              </Form>
            </ModalBody>
            <ModalFooter>
              <Button onPress={handleClear}>クリア</Button>
              <Button isDisabled={!isFormValid} onPress={handleSubmit}>
                保存
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
