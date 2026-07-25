import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/supabase/admin-guard";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  path: z.string().min(1).regex(/^proofs\//, "Invalid payment proof path."),
});

const SIGNED_URL_TTL_SECONDS = 120;

export async function POST(request: Request) {
  const session = await requireAdminApi();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid path." },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from("payment-proofs")
    .createSignedUrl(parsed.data.path, SIGNED_URL_TTL_SECONDS);

  if (error || !data) {
    return NextResponse.json(
      { error: "Could not generate a signed URL for this file." },
      { status: 400 }
    );
  }

  return NextResponse.json({ url: data.signedUrl, expiresIn: SIGNED_URL_TTL_SECONDS });
}
