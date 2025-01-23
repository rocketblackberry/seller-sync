"use client";

import { Tabs, Tab as NextUITab } from "@nextui-org/react";
import { STATUS_OPTIONS } from "@/constants";

export default function Tab() {
  return (
    <Tabs>
      {STATUS_OPTIONS.map((option) => (
        <NextUITab
          key={option.value}
          title={option.label}
          href={`/${option.value}`}
        />
      ))}
    </Tabs>
  );
}
