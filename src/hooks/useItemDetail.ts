import { Item, ItemForm } from "@/interfaces";
import {
  calcFreight,
  calcPrice,
  calcProfit,
  formToItem,
  itemToForm,
} from "@/utils";
import { debounce } from "lodash";
import { useCallback, useEffect, useState } from "react";

interface UseItemDetailProps {
  item: Item;
  exchangeRate: number;
  onUpdate: (item: Item) => void;
  onOpenChange: (isOpen: boolean) => void;
}

const useItemDetail = ({
  item,
  exchangeRate,
  onUpdate,
  onOpenChange,
}: UseItemDetailProps) => {
  const [form, setForm] = useState<ItemForm>(itemToForm(item));

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

  const handleItemChange = useCallback((e: any) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleClear = useCallback(() => {
    const resetForm = itemToForm(item);
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
    item,
    setForm,
    debouncedSetPrice,
    debouncedSetProfit,
    debouncedSetFreight,
    exchangeRate,
  ]);

  const handleSubmit = useCallback(async () => {
    try {
      await onUpdate(formToItem(form));
      onOpenChange(false);
      // TODO: トースト出したい
    } catch (error) {
      console.error(`Error saving item:`, error);
    }
  }, [form, onUpdate, onOpenChange]);

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
        exchangeRate,
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
        exchangeRate,
      );
    }
  }, [form.price]);

  useEffect(() => {
    if (form.weight) {
      debouncedSetFreight(form.weight);
    }
  }, [form.weight]);

  const isFormValid = useCallback((): boolean => {
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
  }, [form]);

  return {
    form,
    handleItemChange,
    handleClear,
    handleSubmit,
    isFormValid,
  };
};

export default useItemDetail;
