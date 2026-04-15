import { getAdminClient } from "@/lib/supabase/admin";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from "@/lib/utils";

type StorageClient = {
  storage: {
    from: (bucket: string) => {
      upload: (
        path: string,
        fileBody: ArrayBuffer,
        options: { contentType: string; upsert: boolean },
      ) => Promise<{ error: { message?: string } | null }>;
      getPublicUrl: (path: string) => { data: { publicUrl: string } };
    };
  };
};

export async function uploadImage(file: File, folder: string, client?: StorageClient) {
  const clients: StorageClient[] = [];
  if (client) clients.push(client);

  try {
    clients.push(getAdminClient() as StorageClient);
  } catch {
    // Admin client is optional in some deployments.
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Only JPEG and PNG are supported.");
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("Image must be <= 2MB.");
  }

  const ext = file.type === "image/png" ? "png" : "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const arrayBuffer = await file.arrayBuffer();

  const errors: string[] = [];

  for (const activeClient of clients) {
    const { error } = await activeClient.storage
      .from("social_images")
      .upload(path, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });
    if (!error) {
      const { data } = activeClient.storage.from("social_images").getPublicUrl(path);
      return data.publicUrl;
    }
    errors.push(error.message ?? "Unknown upload error.");
  }

  const combined = errors.join(" | ");
  if (combined.toLowerCase().includes("jwt")) {
    throw new Error(
      "Storage authentication failed. Check Vercel env keys, especially SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
  throw new Error(combined || "Image upload failed.");
}
