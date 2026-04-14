import { getAdminClient } from "@/lib/supabase/admin";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from "@/lib/utils";

export async function uploadImage(file: File, folder: string) {
  const adminClient = getAdminClient();

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Only JPEG and PNG are supported.");
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("Image must be <= 2MB.");
  }

  const ext = file.type === "image/png" ? "png" : "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const arrayBuffer = await file.arrayBuffer();

  const { error } = await adminClient.storage
    .from("social_images")
    .upload(path, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    });
  if (error) {
    throw new Error(error.message);
  }

  const { data } = adminClient.storage.from("social_images").getPublicUrl(path);
  return data.publicUrl;
}
