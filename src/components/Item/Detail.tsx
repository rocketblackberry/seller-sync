import React, { ChangeEvent, useEffect, useState } from "react";
import {
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
import { CONDITION } from "@/constants";
import { getFreight, getMargin } from "@/utils";
import { Item as IItem } from "@/interfaces";
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
  const [margin, setMargin] = useState(0);

  useEffect(() => {
    setItemData(item);
  }, [item]);

  useEffect(() => {
    setMargin(getMargin(itemData, exchangeRate));
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
                {/* ID */}
                <section className="w-full flex flex-col gap-4">
                  <h2 className="font-bold">ID</h2>
                  <div className="grid grid-cols-4 gap-4">
                    <Input
                      label="ID"
                      name="ebay_id"
                      value={itemData.ebay_id || ""}
                      onChange={handleItemChange}
                    />
                    <Input
                      label="Source ID"
                      name="source_ebay_id"
                      value={itemData.source_ebay_id || ""}
                      onChange={handleItemChange}
                    />
                  </div>
                </section>

                <Divider />

                {/* PHOTOS & VIDEO */}
                <section className="w-full flex flex-col gap-4">
                  <h2 className="font-bold">PHOTOS & VIDEO</h2>
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
                          <div className="text-sm font-bold">Upload video</div>
                          <div className="text-xs text-gray-500">
                            or drag and drop
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <Divider />

                {/* TITLE */}
                <section className="w-full flex flex-col gap-4">
                  <h2 className="font-bold">TITLE</h2>
                  <Input
                    label="Title"
                    name="title"
                    value={itemData.title || ""}
                    isRequired
                    onChange={handleItemChange}
                  />
                </section>

                <Divider />

                {/* MAKER & NAME */}
                <section className="flex flex-col gap-4 w-full">
                  <h2 className="font-bold">MAKER & NAME</h2>
                  <div className="grid grid-cols-2 w-full gap-4">
                    <Input
                      label="Maker"
                      name="maker"
                      value={itemData.maker || ""}
                      onChange={handleItemChange}
                    />
                    <Input
                      label="Name"
                      name="name"
                      value={itemData.name || ""}
                      onChange={handleItemChange}
                    />
                  </div>
                </section>

                <Divider />

                {/* CATEGORY */}
                <section className="flex flex-col gap-4 w-full">
                  <h2 className="font-bold">CATEGORY</h2>
                  <div className="grid grid-cols-2 w-full gap-4">
                    <Select
                      label="Category"
                      name="category_id"
                      value={itemData.category_id || ""}
                      onChange={handleItemChange}
                    >
                      <SelectItem value="Collectibles">Collectibles</SelectItem>
                    </Select>
                  </div>
                </section>

                <Divider />

                {/* SPECIFICS */}
                <section className="flex flex-col gap-4 w-full">
                  <h2 className="font-bold">SPECIFICS</h2>
                  {new Array(5)
                    .fill({ name: "", value: "" })
                    .map((specific, i) => (
                      <div
                        className="grid grid-cols-2 w-full gap-4"
                        key={`specific_${i}`}
                      >
                        <Input
                          label="Name"
                          name={`name_${i}`}
                          value={specific.name || ""}
                          onChange={handleItemChange}
                        />
                        <Input
                          label="Value"
                          name="{`value_${i}`}"
                          value={specific.value || ""}
                          onChange={handleItemChange}
                        />
                      </div>
                    ))}
                </section>

                <Divider />

                {/* CONDITION */}
                <section className="flex flex-col gap-4 w-full">
                  <h2 className="font-bold">CONDITION</h2>
                  <div className="grid grid-cols-4 w-full gap-4">
                    <Select
                      label="Condition"
                      name="condition"
                      value={itemData.condition || ""}
                      onChange={handleItemChange}
                    >
                      {Object.keys(CONDITION).map((key) => (
                        <SelectItem
                          key={key}
                          value={CONDITION[key as keyof typeof CONDITION]}
                        >
                          {key}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                  <Textarea
                    label="Condition description"
                    name="condition_description"
                    value={itemData.condition_description || ""}
                    onChange={handleItemChange}
                  />
                </section>

                <Divider />

                {/* DESCRIPTION */}
                <section className="flex flex-col gap-4 w-full">
                  <h2 className="font-bold">DESCRIPTION</h2>
                  <Textarea
                    label="Description"
                    name="description"
                    value={itemData.description || ""}
                    onChange={handleItemChange}
                  />
                </section>

                <Divider />

                {/* PRICING */}
                <section className="flex flex-col gap-4 w-full">
                  <h2 className="font-bold">PRICING</h2>
                  <div className="grid grid-cols-4 gap-4">
                    <Input
                      label="Price ($)"
                      name="price"
                      value={itemData.price?.toString() || ""}
                      onChange={handleItemChange}
                    />
                    <Input
                      label="Stock"
                      name="stock"
                      value={itemData.stock?.toString() || ""}
                      onChange={handleItemChange}
                    />
                    <Input
                      label="Margin (&yen;)"
                      name="margin"
                      value={margin.toString()}
                    />
                  </div>
                </section>

                <Divider />

                {/* SHIPPING */}
                <section className="flex w-full flex-col gap-4">
                  <h2 className="font-bold">SHIPPING</h2>
                  <div className="grid grid-cols-4 gap-4">
                    <Input
                      label="Weight (kg)"
                      name="weight"
                      value={Math.trunc(itemData.weight || 0).toString() || ""}
                      type="number"
                      min={0}
                      max={10}
                      step={0.1}
                      size="sm"
                      onChange={handleItemChange}
                    />
                    <Input
                      label="Freight (&yen;)"
                      name="freight"
                      value={itemData.freight?.toString() || ""}
                      size="sm"
                      isReadOnly
                      onChange={handleItemChange}
                    />
                  </div>
                </section>

                <Divider />

                {/* SUPPLIER */}
                <section className="flex flex-col gap-4 w-full">
                  <h2 className="font-bold">SUPPLIER</h2>
                  <Input
                    className="col-span-3 w-full"
                    label="URL"
                    name="supplier_url"
                    value={itemData.supplier_url || ""}
                    size="sm"
                    onChange={handleItemChange}
                  />
                  <div className="grid grid-cols-4 w-full gap-4">
                    <Input
                      label="Cost (&yen;)"
                      name="cost"
                      value={Math.trunc(itemData.cost || 0)?.toString() || ""}
                      type="number"
                      min={0}
                      max={999999}
                      step={1}
                      size="sm"
                      onChange={handleItemChange}
                    />
                  </div>
                </section>

                <Divider />

                {/* PROMOTE */}
                <section className="flex flex-col gap-4 w-full">
                  <h2 className="font-bold">PROMOTE</h2>
                  <div className="grid grid-cols-4 gap-4">
                    <Input
                      label="Promote (%)"
                      name="promote"
                      value={itemData.promote?.toString() || ""}
                      onChange={handleItemChange}
                    />
                  </div>
                </section>
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
