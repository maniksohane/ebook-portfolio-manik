"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import {
  createEbook,
  createUploadUrl,
  deleteEbook,
  getAdminEbooks,
  updateEbook,
  uploadCover,
  importCover,
} from "../../lib/api";
import { COVER_ACCEPT, COVER_HELP, coverFileError } from "../../lib/coverFiles.mjs";
import { slugify } from "../../lib/slug.mjs";

const blank = {
  title: "",
  slug: "",
  description: "",
  author: "Manikya",
  price: "",
  category: "",
  pages: "",
  is_published: false,
  is_featured: false,
};

const MAX_FILE_SIZE = 50 * 1024 * 1024;

const ALLOWED_EBOOK_TYPES = [
  "application/pdf",
  "application/epub+zip",
];

const ALLOWED_EBOOK_EXTENSIONS = [".pdf", ".epub"];

export default function AdminPage() {
  const [book, setBook] = useState(blank);
  const [editBook, setEditBook] = useState(null);
  const [cover, setCover] = useState(null);
  const [coverStoragePath, setCoverStoragePath] = useState("");
  const [editCover, setEditCover] = useState(null);
  const [editCoverPath, setEditCoverPath] = useState("");
  const [file, setFile] = useState(null);
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [editBusy, setEditBusy] = useState(false);
  const [rowBusy, setRowBusy] = useState(null);
  const [listMessage, setListMessage] = useState(null);
  const rowActionRef = useRef(false);
  const actionsDisabled = busy || editBusy || Boolean(rowBusy);

  const coverInputRef = useRef(null);
  const fileInputRef = useRef(null);

  async function load() {
    try {
      const response = await getAdminEbooks();
      setItems(response.ebooks || []);
    } catch (error) {
      setMessage(`Admin access required: ${error.message}`);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function change(key, value) {
    setBook((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function changeEdit(key, value) {
    setEditBook((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleCoverFile(event, editing = false) {
    const selected = event.target.files?.[0] || null;
    const setSelected = editing ? setEditCover : setCover;
    const error = coverFileError(selected);
    if (error) {
      event.target.value = "";
      setSelected(null);
      setMessage(error);
      if (editing) setListMessage({ type: "error", text: error });
      return;
    }
    setMessage("");
    setSelected(selected);
    if (editing) setListMessage(null);
  }

  function handleEbookFile(event) {
    const selected = event.target.files?.[0] || null;

    if (!selected) {
      setFile(null);
      return;
    }

    const extension = `.${selected.name.split(".").pop().toLowerCase()}`;

    if (
      !ALLOWED_EBOOK_EXTENSIONS.includes(extension) &&
      !ALLOWED_EBOOK_TYPES.includes(selected.type)
    ) {
      event.target.value = "";
      setFile(null);
      setMessage("Only PDF and EPUB files are allowed.");
      return;
    }

    if (selected.size > MAX_FILE_SIZE) {
      event.target.value = "";
      setFile(null);
      setMessage("The ebook file must be 50 MB or smaller.");
      return;
    }

    setMessage("");
    setFile(selected);
  }

  async function upload(bucket, selected, path) {
  const signed = await createUploadUrl({
    bucket,
    path,
  });

  const { error } = await supabase.storage
    .from(bucket)
    .uploadToSignedUrl(
      signed.path,
      signed.token,
      selected,
      {
        contentType: selected.type || undefined,
        cacheControl: "3600",
      }
    );

  if (error) {
    throw error;
  }

  return signed.path;
}

  async function submit(event) {
    event.preventDefault();
    if (busy || editBusy || rowActionRef.current) return;

    if ((!cover && !coverStoragePath.trim()) || !file) {
      setMessage("Choose a cover file (or its Supabase path) and a separate PDF or EPUB ebook.");
      return;
    }
    if (cover && coverStoragePath.trim()) {
      setMessage("Choose either a cover file or its Supabase path, not both.");
      return;
    }

    if (!book.title.trim()) {
      setMessage("Title is required.");
      return;
    }

    if (!book.description.trim()) {
      setMessage("Description is required.");
      return;
    }

    if (!Number.isFinite(Number(book.price)) || Number(book.price) <= 0) {
      setMessage("Price must be greater than zero.");
      return;
    }

    setBusy(true);
    setMessage("");

    try {
      const slug = slugify(book.slug || book.title);

      if (!slug) {
        throw new Error("A valid title or slug is required.");
      }

      const timestamp = Date.now();

      const ebookExtension =
        file.name.split(".").pop()?.toLowerCase() || "pdf";

      setMessage("Preparing the cover image...");
      const preparedCover = cover ? await uploadCover(cover) : await importCover(coverStoragePath.trim());
      const coverPath = preparedCover.cover_path;
      setMessage("Uploading the ebook...");

      const filePath = await upload(
        "ebook-files",
        file,
        `ebooks/${slug}-${timestamp}.${ebookExtension}`
      );

      await createEbook({
        ...book,
        title: book.title.trim(),
        slug,
        description: book.description.trim(),
        author: book.author.trim() || "Manikya",
        price: Number(book.price),
        pages: book.pages ? Number(book.pages) : null,
        currency: "INR",
        cover_path: coverPath,
        file_path: filePath,
        tags: [],
      });

      setBook(blank);
      setCover(null);
      setCoverStoragePath("");
      setFile(null);

      if (coverInputRef.current) {
        coverInputRef.current.value = "";
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setMessage("E-book created successfully.");

      await load();
    } catch (error) {
      setMessage(error.message || "Unable to create e-book.");
    } finally {
      setBusy(false);
    }
  }

  function startEdit(item) {
    if (actionsDisabled || rowActionRef.current) return;
    setMessage("");
    setListMessage(null);
    setEditCover(null);
    setEditCoverPath("");

    setEditBook({
      id: item.id,
      title: item.title || "",
      slug: item.slug || "",
      description: item.description || "",
      author: item.author || "Manikya",
      price: item.price ?? "",
      category: item.category || "",
      pages: item.pages ?? "",
      is_published: Boolean(item.is_published),
      is_featured: Boolean(item.is_featured),
    });
  }

  function cancelEdit() {
    setEditBook(null);
    setEditCover(null);
    setEditCoverPath("");
  }

  async function saveEdit(event) {
    event.preventDefault();
    if (editBusy || busy || rowActionRef.current) return;

    if (!editBook) {
      return;
    }
    if (editCover && editCoverPath.trim()) {
      setListMessage({ type: "error", text: "Choose either a replacement cover file or its Supabase path, not both." });
      return;
    }

    if (!editBook.title.trim()) {
      setMessage("Title is required.");
      return;
    }

    if (!editBook.slug.trim()) {
      setMessage("Slug is required.");
      return;
    }

    if (!editBook.description.trim()) {
      setMessage("Description is required.");
      return;
    }

    if (
      !Number.isFinite(Number(editBook.price)) ||
      Number(editBook.price) < 0
    ) {
      setMessage("Price must be a non-negative number.");
      return;
    }

    setEditBusy(true);
    setMessage("");
    setListMessage(null);

    try {
      const preparedCover = editCover ? await uploadCover(editCover) : editCoverPath.trim() ? await importCover(editCoverPath.trim()) : null;
      await updateEbook(editBook.id, {
        ...(preparedCover ? { cover_path: preparedCover.cover_path } : {}),
        title: editBook.title.trim(),
        slug: slugify(editBook.slug),
        description: editBook.description.trim(),
        author: editBook.author.trim() || "Manikya",
        price: Number(editBook.price),
        category: editBook.category.trim(),
        pages: editBook.pages ? Number(editBook.pages) : null,
        is_published: Boolean(editBook.is_published),
        is_featured: Boolean(editBook.is_featured),
      });

      setEditBook(null);
      setEditCover(null);
      setEditCoverPath("");
      setMessage("E-book updated successfully.");
      setListMessage({ type: "success", text: "E-book updated successfully." });

      await load();
    } catch (error) {
      setListMessage({ type: "error", text: error.message || "Unable to update e-book." });
      setMessage(error.message || "Unable to update e-book.");
    } finally {
      setEditBusy(false);
    }
  }

  async function toggle(item) {
    if (actionsDisabled || rowActionRef.current) return;
    rowActionRef.current = true;
    setRowBusy({ id: item.id, action: "publish" });
    setListMessage(null);
    try {
      await updateEbook(item.id, {
        is_published: !item.is_published,
      });

      setMessage(
        item.is_published
          ? "E-book unpublished successfully."
          : "E-book published successfully."
      );

      await load();
    } catch (error) {
      setMessage(error.message);
    } finally {
      rowActionRef.current = false;
      setRowBusy(null);
    }
  }

  async function removeBook(item) {
    if (actionsDisabled || rowActionRef.current) return;
    const confirmed = window.confirm(
      `Delete "${item.title}"?\n\nThis permanently removes its listing from the admin page and public store. Uploaded files will remain in storage.\n\nBooks with transaction or download history cannot be deleted; unpublish those instead.`
    );
    if (!confirmed) return;

    rowActionRef.current = true;
    setRowBusy({ id: item.id, action: "delete" });
    setListMessage(null);
    try {
      const response = await deleteEbook(item.id);
      if (!response.success || response.deletedId !== item.id) {
        throw new Error("Deletion could not be confirmed. Refresh the list before trying again.");
      }
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      setEditBook((current) => current?.id === item.id ? null : current);
      setListMessage({ type: "success", text: response.message });
    } catch (error) {
      setListMessage({ type: "error", text: error.message || "Unable to delete the e-book." });
    } finally {
      rowActionRef.current = false;
      setRowBusy(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#020304] px-6 py-20 text-white">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/ebooks"
          className="text-sm text-blue-400 transition hover:text-blue-300"
        >
          ← Back to e-books
        </Link>

        <h1 className="mt-6 text-4xl font-black">
          Publishing admin
        </h1>

        <p className="mt-2 text-white/50">
          Create a book, upload its protected PDF or EPUB, and control
          publication.
        </p>

        <form
          onSubmit={submit}
          className="mt-8 grid gap-3 rounded-3xl border border-white/10 bg-white/[0.02] p-6 md:grid-cols-2"
        >
          {[
            ["title", "Title"],
            ["slug", "Slug (optional)"],
            ["author", "Author"],
            ["price", "Price (INR)"],
            ["category", "Category"],
            ["pages", "Pages"],
          ].map(([key, label]) => (
            <input
              key={key}
              required={key === "title" || key === "price"}
              type={key === "price" || key === "pages" ? "number" : "text"}
              min={
                key === "price"
                  ? "0.01"
                  : key === "pages"
                    ? "1"
                    : undefined
              }
              step={key === "price" ? "0.01" : undefined}
              className="rounded-xl border border-white/10 bg-white/5 p-3 text-white outline-none transition placeholder:text-white/30 focus:border-blue-500/50"
              placeholder={label}
              value={book[key]}
              onChange={(event) =>
                change(
                  key,
                  key === "slug" ? slugify(event.target.value) : event.target.value
                )
              }
            />
          ))}

          <textarea
            required
            className="min-h-28 rounded-xl border border-white/10 bg-white/5 p-3 text-white outline-none transition placeholder:text-white/30 focus:border-blue-500/50 md:col-span-2"
            placeholder="Description"
            value={book.description}
            onChange={(event) =>
              change("description", event.target.value)
            }
          />

          <label className="text-sm text-white/60">
            Cover file
            <input
              ref={coverInputRef}
              required={!coverStoragePath.trim()}
              type="file"
              accept={COVER_ACCEPT}
              className="mt-2 block w-full text-sm"
              onChange={(event) => handleCoverFile(event)}
            />
            <span className="mt-2 block text-xs text-white/30">
              {COVER_HELP}
            </span>
          </label>

          <label className="text-sm text-white/60">
            E-book file
            <input
              ref={fileInputRef}
              required
              type="file"
              accept=".pdf,.epub,application/pdf,application/epub+zip"
              className="mt-2 block w-full text-sm"
              onChange={handleEbookFile}
            />

            <span className="mt-2 block text-xs text-white/30">
              PDF or EPUB · Maximum 50 MB
            </span>
          </label>

          <label className="text-sm text-white/60 md:col-span-2">
            Or use a cover already uploaded to Supabase (optional)
            <input type="text" value={coverStoragePath} onChange={(event) => setCoverStoragePath(event.target.value)} placeholder="covers/my-cover.pdf" className="mt-2 block w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white" />
            <span className="mt-2 block text-xs text-white/40">Enter the file path inside ebook-covers, not its URL. Choose a file above OR enter this path. The original file is retained.</span>
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={book.is_published}
              onChange={(event) =>
                change("is_published", event.target.checked)
              }
            />
            Publish immediately
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={book.is_featured}
              onChange={(event) =>
                change("is_featured", event.target.checked)
              }
            />
            Feature this ebook
          </label>

          <button
            type="submit"
            disabled={actionsDisabled}
            className="rounded-xl bg-white p-3 font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60 md:col-span-2"
          >
            {busy ? "Uploading and publishing..." : "Create e-book"}
          </button>

          {message && (
            <p className="text-sm text-white/60 md:col-span-2">
              {message}
            </p>
          )}
        </form>

        <div className="mt-12">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                Your e-books
              </h2>

              <p className="mt-1 text-sm text-white/40">
                Manage existing publications without re-uploading their files.
              </p>
            </div>

            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/50">
              {items.length} {items.length === 1 ? "book" : "books"}
            </span>
          </div>

          {listMessage && (
            <p role={listMessage.type === "error" ? "alert" : "status"} className={`mb-4 rounded-xl border p-3 text-sm ${listMessage.type === "error" ? "border-red-400/20 bg-red-400/5 text-red-300" : "border-emerald-400/20 bg-emerald-400/5 text-emerald-300"}`}>
              {listMessage.text}
            </p>
          )}

          <div className="space-y-4">
            {items.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"
              >
                {editBook?.id === item.id ? (
                  <form
                    onSubmit={saveEdit}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold">
                          Edit e-book
                        </h3>

                        <p className="mt-1 text-xs text-white/40">
                          Update details or replace the cover. The purchased ebook file stays unchanged.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={cancelEdit}
                        disabled={editBusy}
                        className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white/60 transition hover:border-white/30 hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <input
                        type="text"
                        required
                        placeholder="Title"
                        value={editBook.title}
                        onChange={(event) =>
                          changeEdit("title", event.target.value)
                        }
                        className="rounded-xl border border-white/10 bg-white/5 p-3 text-white outline-none transition placeholder:text-white/30 focus:border-blue-500/50"
                      />

                      <input
                        type="text"
                        required
                        placeholder="Slug"
                        value={editBook.slug}
                        onChange={(event) =>
                          changeEdit("slug", slugify(event.target.value))
                        }
                        className="rounded-xl border border-white/10 bg-white/5 p-3 text-white outline-none transition placeholder:text-white/30 focus:border-blue-500/50"
                      />

                      <input
                        type="text"
                        placeholder="Author"
                        value={editBook.author}
                        onChange={(event) =>
                          changeEdit("author", event.target.value)
                        }
                        className="rounded-xl border border-white/10 bg-white/5 p-3 text-white outline-none transition placeholder:text-white/30 focus:border-blue-500/50"
                      />

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        placeholder="Price (INR)"
                        value={editBook.price}
                        onChange={(event) =>
                          changeEdit("price", event.target.value)
                        }
                        className="rounded-xl border border-white/10 bg-white/5 p-3 text-white outline-none transition placeholder:text-white/30 focus:border-blue-500/50"
                      />

                      <input
                        type="text"
                        placeholder="Category"
                        value={editBook.category}
                        onChange={(event) =>
                          changeEdit("category", event.target.value)
                        }
                        className="rounded-xl border border-white/10 bg-white/5 p-3 text-white outline-none transition placeholder:text-white/30 focus:border-blue-500/50"
                      />

                      <input
                        type="number"
                        min="1"
                        placeholder="Pages"
                        value={editBook.pages}
                        onChange={(event) =>
                          changeEdit("pages", event.target.value)
                        }
                        className="rounded-xl border border-white/10 bg-white/5 p-3 text-white outline-none transition placeholder:text-white/30 focus:border-blue-500/50"
                      />

                      <textarea
                        required
                        placeholder="Description"
                        value={editBook.description}
                        onChange={(event) =>
                          changeEdit(
                            "description",
                            event.target.value
                          )
                        }
                        className="min-h-32 rounded-xl border border-white/10 bg-white/5 p-3 text-white outline-none transition placeholder:text-white/30 focus:border-blue-500/50 md:col-span-2"
                      />

                      <label className="text-sm text-white/60 md:col-span-2">
                        Replace cover (optional)
                        <input type="file" accept={COVER_ACCEPT} disabled={editBusy} onChange={(event) => handleCoverFile(event, true)} className="mt-2 block w-full text-sm" />
                        <span className="mt-2 block text-xs text-white/40">{COVER_HELP} Leave empty to keep the existing cover.</span>
                      </label>
                      <label className="text-sm text-white/60 md:col-span-2">
                        Or use a cover from Supabase storage
                        <input type="text" value={editCoverPath} disabled={editBusy} onChange={(event) => setEditCoverPath(event.target.value)} placeholder="covers/my-cover.pdf" className="mt-2 block w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white" />
                        <span className="mt-2 block text-xs text-white/40">Path inside ebook-covers, not a URL. Choose one source only; the original is not deleted.</span>
                      </label>

                      <label className="flex items-center gap-2 text-sm text-white/70">
                        <input
                          type="checkbox"
                          checked={editBook.is_published}
                          onChange={(event) =>
                            changeEdit(
                              "is_published",
                              event.target.checked
                            )
                          }
                        />
                        Published
                      </label>

                      <label className="flex items-center gap-2 text-sm text-white/70">
                        <input
                          type="checkbox"
                          checked={editBook.is_featured}
                          onChange={(event) =>
                            changeEdit(
                              "is_featured",
                              event.target.checked
                            )
                          }
                        />
                        Featured
                      </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={cancelEdit}
                        disabled={editBusy}
                        className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-white/70 transition hover:border-white/30 hover:text-white"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={actionsDisabled}
                        className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {editBusy ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <h2 className="font-bold">
                        {item.title}
                      </h2>

                      <p className="mt-1 text-sm text-white/50">
                        {item.is_published ? "Published" : "Draft"} · ₹
                        {Number(item.price).toFixed(2)} ·{" "}
                        {item.file_path?.toLowerCase().endsWith(".epub")
                          ? "EPUB"
                          : "PDF"}
                      </p>

                      {item.category && (
                        <p className="mt-1 text-xs text-white/30">
                          {item.category}
                          {item.pages ? ` · ${item.pages} pages` : ""}
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        disabled={actionsDisabled}
                        className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-sm text-blue-300 transition hover:border-blue-400/50 hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => toggle(item)}
                        disabled={actionsDisabled}
                        className="rounded-lg border border-white/20 px-3 py-2 text-sm transition hover:border-white/40 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {rowBusy?.id === item.id && rowBusy.action === "publish" ? "Updating..." : item.is_published ? "Unpublish" : "Publish"}
                      </button>

                      <button
                        type="button"
                        onClick={() => removeBook(item)}
                        disabled={actionsDisabled}
                        aria-label={`Delete ${item.title}`}
                        className="rounded-lg border border-red-400/30 bg-red-400/5 px-3 py-2 text-sm text-red-300 transition hover:border-red-400/60 hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {rowBusy?.id === item.id && rowBusy.action === "delete" ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                )}
              </article>
            ))}

            {!items.length && (
              <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-white/40">
                No e-books have been created yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
