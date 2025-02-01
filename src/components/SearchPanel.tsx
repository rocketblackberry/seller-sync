import { Key } from "react";
import { IoSearchOutline } from "react-icons/io5";
import { Input, Tabs, Tab } from "@nextui-org/react";
import { STATUS_OPTIONS } from "@/constants";
import { SearchCondition } from "@/interfaces";
import { on } from "events";

type SearchPanelProps = {
  condition: SearchCondition;
  onChange: (condition: SearchCondition) => void;
  onSubmit: () => void;
};

export default function SearchPanel({
  condition,
  onChange,
  onSubmit,
}: SearchPanelProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    onChange({ ...condition, [name]: value });
  };

  const handleTabChange = (key: Key): void => {
    onChange({ ...condition, status: key as string });
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
