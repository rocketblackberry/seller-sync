import React, { ChangeEvent, useEffect, useState } from "react";
import {
  Accordion,
  AccordionItem,
  Button,
  Divider,
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
import { CONDITION_OPTIONS, SUPPLIER_OPTIONS } from "@/constants";
import { getFreight, getMargin, getProfit } from "@/utils";
import { IItem } from "@/interfaces";
import useExchangeRate from "@/hooks/useExchangeRate";
import {
  IoCalculatorOutline,
  IoImagesOutline,
  IoVideocamOutline,
} from "react-icons/io5";

type ItemDetailProps = {
  item: Partial<IItem>;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (itemData: Partial<IItem>) => void;
};

export default function ItemDetail({
  item,
  isOpen,
  onOpenChange,
  onSubmit,
}: ItemDetailProps) {
  const { exchangeRate, loading, error } = useExchangeRate();
  const [itemData, setItemData] = useState<Partial<IItem>>(item);
  const [profit, setProfit] = useState(0);
  const [margin, setMargin] = useState(0);

  useEffect(() => {
    setItemData(item);
  }, [item]);

  useEffect(() => {
    const newProfit = getProfit(itemData, exchangeRate);
    setProfit(newProfit);
    setMargin(getMargin(itemData.price, newProfit));
  }, [itemData.price, itemData.cost, itemData.freight, itemData.promote]);

  useEffect(() => {
    setItemData({ ...itemData, freight: getFreight(itemData.weight || 0) });
  }, [itemData.weight]);

  const handleItemChange = (
    e:
      | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | { target: { name: string; value: string } }
  ) => {
    const { name, value } = e.target;
    setItemData({
      ...itemData,
      [name]: value,
    });
  };

  const handleSubmit = () => {
    onSubmit(itemData);
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
            <ModalHeader>アイテムの{item.id ? "編集" : "作成"}</ModalHeader>
            <ModalBody>
              <Form className="flex flex-col gap-8" onSubmit={handleSubmit}>
                <Accordion
                  selectionMode="multiple"
                  defaultExpandedKeys={[
                    "id",
                    "title",
                    "pricing",
                    "cost",
                    "shipping",
                  ]}
                >
                  {/** ID */}
                  <AccordionItem
                    className="font-bold"
                    classNames={{ content: "flex flex-col gap-4 py-0 mb-4" }}
                    key="id"
                    title="ID"
                  >
                    <div className="grid grid-cols-4 gap-4">
                      <Input
                        label="ID"
                        name="ebay_id"
                        value={itemData.ebay_id || ""}
                        size="sm"
                        onChange={handleItemChange}
                      />
                      <Input
                        label="Source ID"
                        name="source_ebay_id"
                        value={itemData.source_ebay_id || ""}
                        size="sm"
                        onChange={handleItemChange}
                      />
                    </div>
                  </AccordionItem>

                  {/** Photos / Video */}
                  <AccordionItem
                    className="font-bold"
                    classNames={{ content: "flex flex-col gap-4 py-0 mb-4" }}
                    key="photos"
                    title="PHOTOS / VIDEO"
                  >
                    <div className="grid grid-cols-4 gap-4 w-full">
                      <div className="col-span-3 border border-dashed border-gray-300 rounded-large w-full h-48 flex items-center justify-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Button
                            className="rounded-full bg-gray-100"
                            isIconOnly
                            size="lg"
                          >
                            <IoImagesOutline />
                          </Button>
                          <div className="flex flex-col items-center">
                            <div className="text-sm font-bold">
                              Drag and drop files
                            </div>
                            <div className="text-xs text-gray-500">
                              or drag and drop
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="border border-dashed border-gray-300 rounded-large w-full h-48 flex items-center justify-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Button
                            className="rounded-full bg-gray-100"
                            isIconOnly
                            size="lg"
                          >
                            <IoVideocamOutline />
                          </Button>
                          <div className="flex flex-col items-center">
                            <div className="text-sm font-bold">
                              Upload video
                            </div>
                            <div className="text-xs text-gray-500">
                              or drag and drop
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </AccordionItem>

                  {/** Title */}
                  <AccordionItem
                    className="font-bold"
                    classNames={{ content: "flex flex-col gap-4 py-0 mb-4" }}
                    key="title"
                    title="TITLE"
                  >
                    <div>
                      <Input
                        label="Title"
                        name="title"
                        value={itemData.title || ""}
                        isRequired
                        onChange={handleItemChange}
                      />
                    </div>
                  </AccordionItem>

                  {/** Name */}
                  <AccordionItem
                    className="font-bold"
                    classNames={{ content: "flex flex-col gap-4 py-0 mb-4" }}
                    key="maker"
                    title="NAME"
                  >
                    <div className="grid grid-cols-3 gap-4">
                      <Input
                        label="Maker"
                        name="maker"
                        value={itemData.maker || ""}
                        size="sm"
                        onChange={handleItemChange}
                      />
                      <Input
                        label="Series"
                        name="series"
                        value={itemData.series || ""}
                        size="sm"
                        onChange={handleItemChange}
                      />
                      <Input
                        label="Name"
                        name="name"
                        value={itemData.name || ""}
                        size="sm"
                        onChange={handleItemChange}
                      />
                    </div>
                  </AccordionItem>

                  {/** Category */}
                  <AccordionItem
                    className="font-bold"
                    classNames={{ content: "flex flex-col gap-4 py-0 mb-4" }}
                    key="category"
                    title="CATEGORY"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <Select
                        label="Category"
                        name="category_id"
                        value={itemData.category_id || ""}
                        size="sm"
                        onChange={handleItemChange}
                      >
                        <SelectItem value="Collectibles">
                          Collectibles
                        </SelectItem>
                      </Select>
                    </div>
                  </AccordionItem>

                  {/** Specifics */}
                  <AccordionItem
                    className="font-bold"
                    classNames={{ content: "flex flex-col gap-4 py-0 mb-4" }}
                    key="specifics"
                    title="SPECIFICS"
                  >
                    {new Array(5)
                      .fill({ name: "", value: "" })
                      .map((specific, i) => (
                        <div
                          className="grid grid-cols-2 gap-4"
                          key={`specific_${i}`}
                        >
                          <Input
                            label="Name"
                            name={`name_${i}`}
                            value={specific.name || ""}
                            size="sm"
                            onChange={handleItemChange}
                          />
                          <Input
                            label="Value"
                            name="{`value_${i}`}"
                            value={specific.value || ""}
                            size="sm"
                            onChange={handleItemChange}
                          />
                        </div>
                      ))}
                  </AccordionItem>

                  {/** Condition */}
                  <AccordionItem
                    className="font-bold"
                    classNames={{ content: "flex flex-col gap-4 py-0 mb-4" }}
                    key="condition"
                    title="CONDITION"
                  >
                    <div className="grid grid-cols-4 gap-4">
                      <Select
                        label="Condition"
                        name="condition"
                        value={itemData.condition || ""}
                        size="sm"
                        onChange={handleItemChange}
                      >
                        {CONDITION_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <Textarea
                        label="Condition description"
                        name="condition_description"
                        value={itemData.condition_description || ""}
                        size="sm"
                        onChange={handleItemChange}
                      />
                    </div>
                  </AccordionItem>

                  {/** Description */}
                  <AccordionItem
                    className="font-bold"
                    classNames={{ content: "flex flex-col gap-4 py-0 mb-4" }}
                    key="description"
                    title="DESCRIPTION"
                  >
                    <div>
                      <Textarea
                        label="Description"
                        name="description"
                        value={itemData.description || ""}
                        size="sm"
                        onChange={handleItemChange}
                      />
                    </div>
                  </AccordionItem>

                  {/** Pricing */}
                  <AccordionItem
                    className="font-bold"
                    classNames={{ content: "flex flex-col gap-4 py-0 mb-4" }}
                    key="pricing"
                    title="PRICING"
                  >
                    <div className="grid grid-cols-4 gap-4">
                      <Input
                        label="Price ($)"
                        name="price"
                        value={itemData.price?.toString() || ""}
                        size="sm"
                        onChange={handleItemChange}
                      />
                      <Input
                        label="Stock"
                        name="stock"
                        value={itemData.stock?.toString() || ""}
                        size="sm"
                        onChange={handleItemChange}
                      />
                      <Input
                        classNames={{
                          inputWrapper: "border-b-1",
                        }}
                        label="Profit (&yen;)"
                        name="profit"
                        value={profit.toString()}
                        size="sm"
                        isReadOnly
                        variant="underlined"
                      />
                      <Input
                        classNames={{
                          inputWrapper: "border-b-1",
                        }}
                        label="Margin (%)"
                        name="margin"
                        value={margin.toString()}
                        size="sm"
                        isReadOnly
                        variant="underlined"
                      />
                    </div>
                  </AccordionItem>

                  {/** Cost */}
                  <AccordionItem
                    className="font-bold"
                    classNames={{ content: "flex flex-col gap-4 py-0 mb-4" }}
                    key="cost"
                    title="COST"
                  >
                    <div className="grid grid-cols-4 gap-4">
                      <Select
                        label="Supplier"
                        name="supplier"
                        value={itemData.supplier || ""}
                        size="sm"
                        onChange={handleItemChange}
                      >
                        {SUPPLIER_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </Select>
                      <Input
                        className="col-span-3"
                        label="URL"
                        name="supplier_url"
                        value={itemData.supplier_url || ""}
                        type="url"
                        size="sm"
                        onChange={handleItemChange}
                      />
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      <Input
                        label="Cost (&yen;)"
                        name="cost"
                        value={itemData.cost?.toString() || ""}
                        size="sm"
                        onChange={handleItemChange}
                      />
                    </div>
                  </AccordionItem>

                  {/** Shipping */}
                  <AccordionItem
                    className="font-bold"
                    classNames={{ content: "flex flex-col gap-4 py-0 mb-4" }}
                    key="shipping"
                    title="SHIPPING"
                  >
                    <div className="grid grid-cols-4 gap-4">
                      <Input
                        label="Weight (kg)"
                        name="weight"
                        value={
                          Math.trunc(itemData.weight || 0).toString() || ""
                        }
                        size="sm"
                        onChange={handleItemChange}
                      />
                      <Input
                        classNames={{
                          inputWrapper: "border-b-1",
                        }}
                        label="Freight (&yen;)"
                        name="freight"
                        value={itemData.freight?.toString() || ""}
                        size="sm"
                        isReadOnly
                        variant="underlined"
                        onChange={handleItemChange}
                      />
                    </div>
                  </AccordionItem>

                  {/** Promote */}
                  <AccordionItem
                    className="font-bold"
                    classNames={{ content: "flex flex-col gap-4 py-0 mb-4" }}
                    key="promote"
                    title="PROMOTE"
                  >
                    <div className="grid grid-cols-4 gap-4">
                      <Input
                        label="Promote (%)"
                        name="promote"
                        value={itemData.promote?.toString() || ""}
                        size="sm"
                        onChange={handleItemChange}
                      />
                    </div>
                  </AccordionItem>
                </Accordion>
              </Form>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                閉じる
              </Button>
              <Button color="primary" onPress={handleSubmit}>
                保存
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
