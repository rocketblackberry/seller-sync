import { inngest } from "@/lib/inngest/client";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  await inngest.send({
    name: "test/hello.world",
    data: { email: "test@example.com" },
  });

  return NextResponse.json({ message: "Event sent!" });
}
