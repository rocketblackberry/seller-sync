"use client";

import ItemDetailForm from "@/components/ItemDetailForm";
import { SUPPLIER_OPTIONS } from "@/constants";
import useItemDetail from "@/hooks/useItemDetail";
import {
  Button,
  CircularProgress,
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
    isSaving,
    isScraping,
    isFormValid,
    handleItemChange,
    handleClear,
    handleDelete,
    handleScrape,
    handleSubmit,
  } = useItemDetail({ onOpenChange });

  const isProcessing = isSaving || isScraping;

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
      classNames={{ closeButton: "top-[1rem] right-[1rem]" }}
      size="5xl"
      scrollBehavior="inside"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader>商品詳細</ModalHeader>
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
                  isDisabled={isProcessing || !form.id}
                  onPress={handleDelete}
                  variant="bordered"
                  color={form.id ? "danger" : "default"}
                >
                  削除
                </Button>
                <div className="flex items-center gap-4">
                  <Button isDisabled={isProcessing} onPress={handleClear}>
                    クリア
                  </Button>
                  <Button
                    className="flex items-center justify-center bg-black text-white"
                    isDisabled={isProcessing || !isFormValid()}
                    onPress={handleSubmit}
                  >
                    {isSaving ? (
                      <CircularProgress
                        aria-label="保存中"
                        classNames={{ svg: "h-4 w-4", indicator: "text-white" }}
                        size="sm"
                      />
                    ) : (
                      "保存"
                    )}
                  </Button>
                  <Button
                    className="flex items-center justify-center bg-black text-white"
                    isDisabled={isProcessing || !isFormValid() || !form.url}
                    onPress={handleScrape}
                  >
                    {isScraping ? (
                      <CircularProgress
                        aria-label="保存中"
                        classNames={{ svg: "h-4 w-4", indicator: "text-white" }}
                        size="sm"
                      />
                    ) : (
                      "保存／取得"
                    )}
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
