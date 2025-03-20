import {
  useExchangeRateStore,
  useItemStore,
  useItemsStore,
  useSellerStore,
} from "@/stores";
import { ItemForm } from "@/types";
import {
  calcFreight,
  calcPrice,
  calcProfit,
  formToItem,
  formatNumeric,
  itemToForm,
} from "@/utils";
import { debounce } from "lodash";
import { ChangeEvent, useCallback, useEffect, useState } from "react";

type ItemDetailProps = {
  onOpenChange: (isOpen: boolean) => void;
};

type ItemDetail = {
  form: ItemForm;
  isSaving: boolean;
  isScraping: boolean;
  isFormValid: () => boolean;
  handleItemChange: (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  handleClear: () => void;
  handleDelete: () => Promise<void>;
  handleScrape: () => Promise<void>;
  handleSubmit: () => Promise<void>;
};

export const useItemDetail = ({
  onOpenChange,
}: ItemDetailProps): ItemDetail => {
  const { currentItem, initItem, updateItem, scrapeItem, exportItem } =
    useItemStore();
  const { deleteItem, updateItemInList } = useItemsStore();
  const { selectedSeller } = useSellerStore();
  const { exchangeRate } = useExchangeRateStore();
  const [form, setForm] = useState<ItemForm>(itemToForm(currentItem));
  const [isSaving, setIsSaving] = useState(false);
  const [isScraping, setIsScraping] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSetPrice = useCallback(
    debounce(
      (cost, freight, profitRate, fvfRate, promoteRate, exchangeRate) => {
        const price =
          cost > 0 &&
          freight &&
          profitRate &&
          fvfRate &&
          promoteRate &&
          exchangeRate
            ? calcPrice(
                cost,
                freight,
                profitRate,
                fvfRate,
                promoteRate,
                exchangeRate,
              ).toString()
            : "0";
        setForm((prevItem) => ({
          ...prevItem,
          price: price,
        }));
      },
      500,
    ),
    [],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSetProfit = useCallback(
    debounce((price, cost, freight, fvfRate, promoteRate, exchangeRate) => {
      const profit =
        price > 0 &&
        cost > 0 &&
        freight &&
        fvfRate &&
        promoteRate &&
        exchangeRate
          ? calcProfit(
              price,
              cost,
              freight,
              fvfRate,
              promoteRate,
              exchangeRate,
            ).toString()
          : "0";
      setForm((prevItem) => ({
        ...prevItem,
        profit: profit,
      }));
    }, 500),
    [],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSetFreight = useCallback(
    debounce((weight) => {
      setForm((prevItem) => ({
        ...prevItem,
        freight: calcFreight(weight).toString(),
      }));
    }, 500),
    [],
  );

  const isFormValid = useCallback((): boolean => {
    return !!(
      (form.id && form.seller_id && parseInt(form.freight) > 0)
      // form.keyword &&
      // form.price &&
      // form.cost &&
      // form.weight &&
      // form.profit_rate &&
      // form.fvf_rate &&
      // form.promote_rate &&
      // form.stock &&
      // form.url
    );
  }, [form]);

  const handleItemChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
      const { name, value } = e.target;
      switch (name) {
        case "cost":
        case "weight":
        case "profit_rate":
        case "stock":
        case "scrape_error":
          setForm((prev) => ({
            ...prev,
            [name]: formatNumeric(value),
          }));
          return;
      }
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

  const handleScrape = useCallback(async () => {
    try {
      setIsScraping(true);
      const now = new Date();
      const updatedItem = formToItem(form);
      updatedItem.updated_at = now;
      await updateItem(updatedItem);
      const scrapeResult = await scrapeItem(form.id);
      if (scrapeResult?.data) {
        await updateItemInList(scrapeResult.data);
      }
      if (scrapeResult?.error) {
        alert(`Scraping failed: ${scrapeResult.error}`);
        return;
      }
      onOpenChange(false);
    } catch (error) {
      console.error(`Error saving item:`, error);
    } finally {
      setIsScraping(false);
    }
  }, [form, updateItem, scrapeItem, updateItemInList, onOpenChange]);

  const handleSubmit = useCallback(async () => {
    try {
      setIsSaving(true);
      const now = new Date();
      const updatedItem = formToItem(form);
      updatedItem.updated_at = now;
      await updateItem(updatedItem);
      await updateItemInList(updatedItem);
      await exportItem(selectedSeller?.seller_id || "", updatedItem.id);
      onOpenChange(false);
    } catch (error) {
      console.error(`Error saving item:`, error);
    } finally {
      setIsSaving(false);
    }
  }, [
    form,
    selectedSeller,
    updateItem,
    updateItemInList,
    exportItem,
    onOpenChange,
  ]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    form.id,
    form.cost,
    form.freight,
    form.profit_rate,
    form.fvf_rate,
    form.promote_rate,
    exchangeRate,
    debouncedSetPrice,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    form.id,
    form.price,
    form.cost,
    form.freight,
    form.fvf_rate,
    form.promote_rate,
    exchangeRate,
    debouncedSetProfit,
  ]);

  useEffect(() => {
    if (form.weight) {
      debouncedSetFreight(form.weight);
    }
  }, [form.id, form.weight, debouncedSetFreight]);

  return {
    form,
    isSaving,
    isScraping,
    handleItemChange,
    handleClear,
    handleDelete,
    handleScrape,
    handleSubmit,
    isFormValid,
  };
};

export default useItemDetail;
