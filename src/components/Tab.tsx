"use client";

import { Tabs, Tab as NextUITab } from "@nextui-org/react";
import { STATUS, STATUS_NAME } from "@/constants";

export default function Tab() {
  return (
    <Tabs>
      {Object.keys(STATUS).map((key) => (
        <NextUITab
          key={key}
          title={STATUS_NAME[key as keyof typeof STATUS_NAME]}
          href={`/${STATUS[key as keyof typeof STATUS]}`}
        />
      ))}
    </Tabs>
  );
}
