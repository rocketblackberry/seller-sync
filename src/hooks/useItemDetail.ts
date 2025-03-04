import { useExchangeRateStore, useItemStore, useItemsStore } from "@/stores";
import { ItemForm } from "@/types";
import {
  calcFreight,
  calcPrice,
  calcProfit,
  formToItem,
  itemToForm,
} from "@/utils";
import { debounce } from "lodash";
import { ChangeEvent, useCallback, useEffect, useState } from "react";

type ItemDetailProps = {
  onOpenChange: (isOpen: boolean) => void;
};

type ItemDetail = {
  form: ItemForm;
  isFormValid: () => boolean;
  handleItemChange: (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  handleClear: () => void;
  handleDelete: () => Promise<void>;
  handleSubmit: () => Promise<void>;
};

export const useItemDetail = ({
  onOpenChange,
}: ItemDetailProps): ItemDetail => {
  const { currentItem, initItem, updateItem } = useItemStore();
  const { deleteItem, updateItemInList } = useItemsStore();
  const { exchangeRate } = useExchangeRateStore();
  const [form, setForm] = useState<ItemForm>(itemToForm(currentItem));

  const debouncedSetPrice = useCallback(
    debounce(
      (cost, freight, profitRate, fvfRate, promoteRate, exchangeRate) => {
        setForm((prevItem) => ({
          ...prevItem,
          price: calcPrice(
            cost,
            freight,
            profitRate,
            fvfRate,
            promoteRate,
            exchangeRate,
          ).toString(),
        }));
      },
      100,
    ),
    [],
  );

  const debouncedSetProfit = useCallback(
    debounce((price, cost, freight, fvfRate, promoteRate, exchangeRate) => {
      setForm((prevItem) => ({
        ...prevItem,
        profit: calcProfit(
          price,
          cost,
          freight,
          fvfRate,
          promoteRate,
          exchangeRate,
        ).toString(),
      }));
    }, 100),
    [],
  );

  const debouncedSetFreight = useCallback(
    debounce((weight) => {
      setForm((prevItem) => ({
        ...prevItem,
        freight: calcFreight(weight).toString(),
      }));
    }, 100),
    [],
  );

  const isFormValid = useCallback((): boolean => {
    return !!(
      form.id &&
      form.seller_id &&
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
  }, [form]);

  const handleItemChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
    },
    [],
  );

  const handleClear = useCallback(() => {
    const resetForm = itemToForm(currentItem);
    setForm(resetForm);
    const { cost, freight, profit_rate, fvf_rate, promote_rate } = resetForm;
    debouncedSetPrice(
      cost,
      freight,
      profit_rate,
      fvf_rate,
      promote_rate,
      exchangeRate,
    );
    debouncedSetProfit(
      resetForm.price,
      cost,
      freight,
      fvf_rate,
      promote_rate,
      exchangeRate,
    );
    debouncedSetFreight(resetForm.weight);
  }, [
    currentItem,
    setForm,
    debouncedSetPrice,
    debouncedSetProfit,
    debouncedSetFreight,
    exchangeRate,
  ]);

  const handleDelete = useCallback(async () => {
    try {
      await deleteItem(form.id);
      await initItem(form.seller_id);
      onOpenChange(false);
    } catch (error) {
      console.error(`Error deleting item:`, error);
    }
  }, [form.id, form.seller_id, deleteItem, initItem, onOpenChange]);

  const handleSubmit = useCallback(async () => {
    try {
      const updatedItem = formToItem(form);
      await updateItem(updatedItem);
      await updateItemInList(updatedItem);
      onOpenChange(false);
      // TODO: トースト出したい
    } catch (error) {
      console.error(`Error saving item:`, error);
    }
  }, [form, updateItem, updateItemInList, onOpenChange]);

  useEffect(() => {
    setForm(itemToForm(currentItem));
  }, [currentItem]);

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
        exchangeRate,
      );
    }
  }, [form, exchangeRate, debouncedSetPrice]);

  useEffect(() => {
    const { price, cost, freight, fvf_rate, promote_rate } = form;
    if (price && cost && freight && fvf_rate && promote_rate && exchangeRate) {
      debouncedSetProfit(
        price,
        cost,
        freight,
        fvf_rate,
        promote_rate,
        exchangeRate,
      );
    }
  }, [form, exchangeRate, debouncedSetProfit]);

  useEffect(() => {
    if (form.weight) {
      debouncedSetFreight(form.weight);
    }
  }, [form, debouncedSetFreight]);

  return {
    form,
    handleItemChange,
    handleClear,
    handleDelete,
    handleSubmit,
    isFormValid,
  };
};

export default useItemDetail;
