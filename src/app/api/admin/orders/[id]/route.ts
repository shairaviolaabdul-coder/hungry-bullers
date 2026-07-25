import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/supabase/admin-guard";
import { createClient } from "@/lib/supabase/server";

const patchSchema = z
  .object({
    payment_status: z.enum(["pending", "verified", "rejected"]).optional(),
    order_status: z
      .enum([
        "new",
        "preparing",
        "ready_for_pickup",
        "shipped",
        "completed",
        "cancelled",
      ])
      .optional(),
    internal_notes: z.string().max(2000).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "No fields to update.",
  });

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminApi();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid update." },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .update(parsed.data)
    .eq("id", id)
    .select("*, order_items(*)")
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Could not update this order." },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true, order: data });
}
