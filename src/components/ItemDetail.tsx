"use client";

import ItemDetailForm from "@/components/ItemDetailForm";
import { SUPPLIER_OPTIONS } from "@/constants";
import useItemDetail from "@/hooks/useItemDetail";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";

interface ItemDetailProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function ItemDetail({ isOpen, onOpenChange }: ItemDetailProps) {
  const {
    form,
    isFormValid,
    handleItemChange,
    handleClear,
    handleDelete,
    handleSubmit,
  } = useItemDetail({ onOpenChange });

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
      // isDismissable={false}
      // isKeyboardDismissDisabled={true}
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
                  onPress={handleDelete}
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
