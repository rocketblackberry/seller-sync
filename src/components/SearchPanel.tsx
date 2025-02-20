import { STATUS_OPTIONS } from "@/constants";
import { SearchCondition, Status } from "@/types";
import { Input, Tab, Tabs } from "@nextui-org/react";
import { Key } from "react";
import { IoSearchOutline } from "react-icons/io5";

type SearchPanelProps = {
  condition: SearchCondition;
  onChange: (condition: SearchCondition) => void;
};

export default function SearchPanel({ condition, onChange }: SearchPanelProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    onChange({ ...condition, [name]: value });
  };

  const handleTabChange = (key: Key): void => {
    onChange({ ...condition, status: key as Status });
  };

  return (
    <div className="flex gap-4">
      <Input
        isClearable
        name="keyword"
        value={condition?.keyword}
        onChange={handleInputChange}
        placeholder="キーワード"
        startContent={<IoSearchOutline />}
        onClear={() =>
          handleInputChange({
            target: { name: "keyword", value: "" },
          } as unknown as React.ChangeEvent<HTMLInputElement>)
        }
      />
      <Tabs selectedKey={condition?.status} onSelectionChange={handleTabChange}>
        {STATUS_OPTIONS.map((status) => (
          <Tab key={status.value} title={status.label} />
        ))}
      </Tabs>
    </div>
  );
}
