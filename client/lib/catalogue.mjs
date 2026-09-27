// Public metadata only. Paid ebook files remain in private Storage and are
// delivered by the payment API after server-side verification.
export const PUBLIC_EBOOK_FIELDS = "id,title,slug,description,author,price,currency,cover_path,pages,category,tags,is_featured,created_at";

export async function loadPublishedEbooks(client, { signal } = {}) {
  let query = client.from("ebooks").select(PUBLIC_EBOOK_FIELDS)
    .eq("is_published", true)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });
  if (signal) query = query.abortSignal(signal);
  const { data, error } = await query;
  if (error || !Array.isArray(data)) {
    throw new Error("We couldn't load the ebooks. Please check your connection and try again.");
  }
  return {
    success: true,
    ebooks: data.map((ebook) => ({
      ...ebook,
      coverImage: ebook.cover_path
        ? client.storage.from("ebook-covers").getPublicUrl(ebook.cover_path).data.publicUrl
        : null,
    })),
  };
}
