import { requestJson } from "./apiTransport.mjs";
import { loadPublishedEbooks } from "./catalogue.mjs";

async function request(path, options = {}) {
  const { supabase } = await import("./supabase");
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return requestJson(path, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(session?.access_token
        ? { Authorization: `Bearer ${session.access_token}` }
        : {}),
    },
  });
}

export async function getEbooks(options) {
  const { supabase } = await import("./supabase");
  return loadPublishedEbooks(supabase, options);
}

export async function createRazorpayOrder(payload) {
  // Guest checkout does not require an authentication session.
  return requestJson("/api/payment/create-order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function getPurchases() {
  return request("/api/payment/purchases");
}

export async function getAdminEbooks() {
  return request("/api/admin/ebooks");
}

export async function createEbook(data) {
  return request("/api/admin/ebooks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export async function updateEbook(id, data) {
  return request(`/api/admin/ebooks/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export async function createUploadUrl(data) {
  return request("/api/admin/uploads/signed-url", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export async function deleteEbook(id) {
  return request(`/api/admin/ebooks/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function uploadCover(file) {
  return request(`/api/admin/covers?filename=${encodeURIComponent(file.name)}`, {
    method: "POST",
    headers: { "Content-Type": "application/octet-stream" },
    body: file,
  });
}

export async function importCover(path) {
  return request("/api/admin/covers/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path }),
  });
}
