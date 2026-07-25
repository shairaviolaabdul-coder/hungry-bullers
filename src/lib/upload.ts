import { createClient } from "@/lib/supabase/client";

const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export class UploadValidationError extends Error {}

export function validatePaymentProofFile(file: File) {
  if (!(file.type in ALLOWED_MIME_TYPES)) {
    throw new UploadValidationError(
      "Please upload a JPG, PNG, or WEBP image of your payment confirmation."
    );
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new UploadValidationError(
      "That image is too large. Please upload a file under 5 MB."
    );
  }
}

/**
 * Uploads a payment-proof screenshot directly from the browser to the
 * private `payment-proofs` storage bucket, using a random, non-guessable
 * filename. The anon key only has INSERT permission on this bucket (see
 * supabase/migrations) — it cannot list, read, or overwrite files.
 *
 * Returns the storage object path to send along with the order submission.
 */
export async function uploadPaymentProof(file: File): Promise<string> {
  validatePaymentProofFile(file);

  const extension = ALLOWED_MIME_TYPES[file.type];
  const randomName = crypto.randomUUID();
  const path = `proofs/${randomName}.${extension}`;

  const supabase = createClient();
  const { error } = await supabase.storage
    .from("payment-proofs")
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw new Error(
      "We couldn't upload your payment proof. Please check your connection and try again."
    );
  }

  return path;
}
