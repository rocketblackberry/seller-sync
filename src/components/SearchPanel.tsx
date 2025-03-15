import { STATUS_OPTIONS } from "@/constants";
import { useDebounce } from "@/hooks/useDebounce";
import { SearchCondition, Status } from "@/types";
import { Input, Tab, Tabs } from "@nextui-org/react";
import { Key, useEffect, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";

type SearchPanelProps = {
  condition: SearchCondition;
  onChange: (condition: SearchCondition) => void;
};

export default function SearchPanel({ condition, onChange }: SearchPanelProps) {
  const [keyword, setKeyword] = useState<string>(condition.keyword);
  const debouncedKeyword = useDebounce(keyword, 500);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { value } = e.target;
    setKeyword(value);
  };

  const handleTabChange = (key: Key): void => {
    onChange({ ...condition, status: key as Status });
  };

  useEffect(() => {
    onChange({ ...condition, keyword: debouncedKeyword });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedKeyword]);

  return (
    <div className="flex gap-4">
      <Input
        isClearable
        name="keyword"
        value={keyword}
        onChange={handleInputChange}
        placeholder="キーワード"
        startContent={<IoSearchOutline />}
        onFocus={(e) => e.target.select()}
        onClear={() => setKeyword("")}
      />
      <Tabs selectedKey={condition?.status} onSelectionChange={handleTabChange}>
        {STATUS_OPTIONS.map((status) => (
          <Tab key={status.value} title={status.label} />
        ))}
      </Tabs>
    </div>
  );
}
