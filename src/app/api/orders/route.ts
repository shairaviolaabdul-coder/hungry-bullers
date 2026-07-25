import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { orderSubmissionSchema } from "@/lib/validation/order";

function cleanDbErrorMessage(rawMessage: string): string {
  // The submit_order() function raises errors like "INVALID_EMAIL: ..." —
  // strip the machine-readable code prefix before showing it to the user.
  return rawMessage.replace(/^[A-Z_]+:\s*/, "");
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const parsed = orderSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    const message =
      parsed.error.issues[0]?.message ?? "Please check your order details.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const {
    fullName,
    email,
    phone,
    messengerName,
    fulfillment,
    address,
    paymentReference,
    customerNotes,
    paymentProofPath,
    cart,
  } = parsed.data;

  const supabase = await createClient();

  const { data, error } = await supabase.rpc("submit_order", {
    p_customer_name: fullName,
    p_mobile_number: phone,
    p_messenger_name: messengerName || null,
    p_email: email,
    p_fulfillment_method: fulfillment,
    p_delivery_address: address || null,
    p_payment_proof_path: paymentProofPath,
    p_payment_reference: paymentReference || null,
    p_customer_notes: customerNotes || null,
    p_items: cart.map((item) => ({
      size: item.size,
      quantity: item.qty,
      playerName: item.playerName,
    })),
  });

  if (error) {
    return NextResponse.json(
      {
        error: cleanDbErrorMessage(
          error.message || "Something went wrong while placing your order."
        ),
      },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true, order: data });
}
