"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { debounce } from "lodash";
import {
  Button,
  Form,
  Input,
  Modal,
  ModalProps,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
} from "@nextui-org/react";
import { SUPPLIER_LIST } from "@/constants";
import useExchangeRate from "@/hooks/useExchangeRate";
import { calcPrice, calcProfit, calcMargin, calcFreight } from "@/utils";
import { IItem2, SubItem } from "@/interfaces";

const defaultItem: SubItem = {
  id: "",
  item_id: "",
  keyword: "",
  price: "",
  cost: "",
  weight: "1.0",
  freight: "",
  profit: "",
  margin: "10",
  url: "",
  description_ja: "",
  description_en: "",
};

interface ResearchProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function Research({ isOpen, onOpenChange }: ResearchProps) {
  const { exchangeRate } = useExchangeRate();
  const [item, setItem] = useState<SubItem>(defaultItem);
  const [isFormValid, setIsFormValid] = useState(false);

  const debouncedSetPrice = debounce((cost, freight, margin, exchangeRate) => {
    console.log("debouncedSetPrice", cost, freight, margin, exchangeRate);
    setItem((prevItem) => ({
      ...prevItem,
      price: calcPrice(
        parseInt(cost),
        parseInt(freight),
        parseFloat(margin),
        exchangeRate
      ).toString(),
    }));
  }, 500);

  const debouncedSetProfit = debounce((price, cost, freight, exchangeRate) => {
    setItem((prevItem) => ({
      ...prevItem,
      profit: calcProfit(price, cost, freight, exchangeRate).toString(),
    }));
  }, 500);

  const debouncedSetMargin = debounce((price, cost, freight, exchangeRate) => {
    setItem((prevItem) => ({
      ...prevItem,
      margin: calcMargin(price, cost, freight, exchangeRate).toString(),
    }));
  }, 500);

  const debouncedSetFreight = debounce((weight) => {
    setItem((prevItem) => ({
      ...prevItem,
      freight: calcFreight(parseFloat(weight)).toString(),
    }));
  }, 500);

  useEffect(() => {
    if (item.cost && item.freight && item.margin && exchangeRate) {
      debouncedSetPrice(item.cost, item.freight, item.margin, exchangeRate);
    }
  }, [item.cost, item.freight, item.margin, exchangeRate]);

  useEffect(() => {
    if (item.price && item.cost && item.freight && exchangeRate) {
      debouncedSetProfit(item.price, item.cost, item.freight, exchangeRate);
      // debouncedSetMargin(item.price, item.cost, item.freight, exchangeRate);
    }
  }, [item.price, item.cost, item.freight, exchangeRate]);

  useEffect(() => {
    if (item.weight) {
      debouncedSetFreight(item.weight);
    }
  }, [item.weight]);

  useEffect(() => {
    const isValid = !!(
      item.keyword &&
      item.price &&
      item.cost &&
      item.weight &&
      item.margin &&
      item.url
    );
    setIsFormValid(isValid);
  }, [item]);

  const handleSupplierClick = (value: string) => {
    const supplier = SUPPLIER_LIST.find((supplier) => supplier.value === value);

    if (supplier) {
      window.open(
        supplier.url.replaceAll("$1", encodeURIComponent(item?.keyword || "")),
        "_blank"
      );
    }
  };

  const handleItemChange = (
    e:
      | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
      const response = await fetch("/api/items2", {
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
                <div className="grid grid-cols-4 gap-4 w-full">
                  <Input
                    name="itemId"
                    label="Item ID"
                    value={item.id}
                    placeholder=" "
                    onChange={handleItemChange}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 w-full">
                  <Input
                    isRequired
                    name="keyword"
                    label="キーワード"
                    value={item.keyword}
                    placeholder=" "
                    onChange={handleItemChange}
                  />
                  <div className="flex gap-2">
                    {SUPPLIER_LIST.map((supplier) => (
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
                <div className="grid grid-cols-6 gap-4 w-full">
                  <Input
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
                    variant="bordered"
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
                    variant="bordered"
                  />
                  <Input
                    isRequired
                    name="margin"
                    label="利益率"
                    value={item.margin}
                    placeholder=" "
                    endContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-default-400 text-small">%</span>
                      </div>
                    }
                    type="number"
                    onChange={handleItemChange}
                  />
                </div>
                <div className="w-full">
                  <Input
                    isRequired
                    name="url"
                    label="URL"
                    value={item.url}
                    placeholder=" "
                    onChange={handleItemChange}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 w-full">
                  <Textarea
                    name="description_ja"
                    label="説明文［日］"
                    value={item.description_ja}
                    placeholder=" "
                    onChange={handleItemChange}
                  />
                  <Textarea
                    isReadOnly
                    name="description_en"
                    label="説明文［英］"
                    value={item.description_en}
                    placeholder=" "
                    variant="bordered"
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
