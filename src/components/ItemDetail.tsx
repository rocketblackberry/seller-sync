"use client";

import ItemDetailForm from "@/components/ItemDetailForm";
import { SUPPLIER_OPTIONS } from "@/constants";
import useExchangeRate from "@/hooks/useExchangeRate";
import useItemDetail from "@/hooks/useItemDetail";
import { Item } from "@/types";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";

interface ItemDetailProps {
  item: Item;
  isOpen: boolean;
  onDelete: (id: number) => void;
  onUpdate: (item: Item) => void;
  onOpenChange: (isOpen: boolean) => void;
}

export default function ItemDetail({
  item,
  isOpen,
  onDelete,
  onUpdate,
  onOpenChange,
}: ItemDetailProps) {
  const { exchangeRate } = useExchangeRate();
  const { form, handleItemChange, handleClear, handleSubmit, isFormValid } =
    useItemDetail({
      item,
      exchangeRate: exchangeRate ?? 0,
      onUpdate,
      onOpenChange,
    });

  const handleSupplierClick = (value: string) => {
    const supplier = SUPPLIER_OPTIONS.find(
      (supplier) => supplier.value === value,
    );
    if (supplier) {
      window.open(
        supplier.url.replaceAll("$1", encodeURIComponent(form?.keyword || "")),
        "_blank",
      );
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
        {() => (
          <>
            <ModalHeader>リサーチ</ModalHeader>
            <ModalBody>
              <ItemDetailForm
                form={form}
                onChange={handleItemChange}
                onSupplierClick={handleSupplierClick}
              />
            </ModalBody>
            <ModalFooter>
              <div className="flex w-full items-center justify-between">
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
                    className="bg-black text-white"
                    isDisabled={!isFormValid()}
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
