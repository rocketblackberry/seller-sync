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
  FVF_RATE,
  PROMOTE_RATE,
  SUPPLIER_OPTIONS,
} from "@/constants";
import useExchangeRate from "@/hooks/useExchangeRate";
import { calcPrice, calcProfit, calcProfitRate, calcFreight } from "@/utils";
import { ItemField } from "@/interfaces";

const defaultItem: ItemField = {
  id: "",
  itemId: "",
  keyword: "",
  title: "",
  condition: "used",
  description: "",
  descriptionJa: "",
  supplierUrl: "",
  price: "",
  cost: "",
  weight: "1.0",
  freight: "",
  profit: "",
  profitRate: "10",
  fvfRate: FVF_RATE.toString(),
  promoteRate: PROMOTE_RATE.toString(),
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

  const debouncedSetProfitRate = debounce(
    (price, cost, freight, fvfRate, promoteRate, exchangeRate) => {
      setItem((prevItem) => ({
        ...prevItem,
        profitRate: calcProfitRate(
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
    const { cost, freight, profitRate, fvfRate, promoteRate } = item;
    if (
      cost &&
      freight &&
      profitRate &&
      fvfRate &&
      promoteRate &&
      exchangeRate
    ) {
      debouncedSetPrice(
        cost,
        freight,
        profitRate,
        fvfRate,
        promoteRate,
        exchangeRate
      );
    }
  }, [
    item.cost,
    item.freight,
    item.profitRate,
    item.fvfRate,
    item.promoteRate,
    exchangeRate,
  ]);

  useEffect(() => {
    const { price, cost, freight, fvfRate, promoteRate } = item;
    if (price && cost && freight && fvfRate && promoteRate && exchangeRate) {
      debouncedSetProfit(
        price,
        cost,
        freight,
        fvfRate,
        promoteRate,
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
      item.itemId &&
      item.keyword &&
      item.price &&
      item.cost &&
      item.weight &&
      item.profitRate &&
      item.fvfRate &&
      item.promoteRate &&
      item.stock &&
      item.supplierUrl
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
                    value={item.condition}
                    placeholder=" "
                    onChange={handleItemChange}
                  >
                    {CONDITION_OPTIONS.map((condition) => (
                      <SelectItem value={condition.value} key={condition.value}>
                        {condition.label}
                      </SelectItem>
                    ))}
                  </Select>
                  <Input
                    isRequired
                    name="itemId"
                    label="ID"
                    value={item.itemId}
                    placeholder=" "
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
                    variant="bordered"
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
                    name="profitRate"
                    label="利益率"
                    value={item.profitRate}
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
                    name="fvfRate"
                    label="FVF率"
                    value={item.fvfRate}
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
                    name="promoteRate"
                    label="プロモート率"
                    value={item.promoteRate}
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
                    name="supplierUrl"
                    label="仕入先URL"
                    value={item.supplierUrl}
                    placeholder=" "
                    onChange={handleItemChange}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 w-full">
                  <Textarea
                    isReadOnly
                    name="description"
                    label="説明文"
                    value={item.description}
                    placeholder=" "
                    variant="bordered"
                    onChange={handleItemChange}
                  />
                  <Textarea
                    name="descriptionJa"
                    label="説明文［日］"
                    value={item.descriptionJa}
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
