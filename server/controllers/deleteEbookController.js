const supabase = require("../config/supabase");

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function deleteEbook(req, res) {
  const id = req.params.id;
  if (!uuidPattern.test(id || "")) {
    return res.status(400).json({ success: false, message: "Invalid e-book ID." });
  }
  try {
    // Existing NO ACTION foreign keys from transactions/downloads make this
    // atomic: even a concurrently-created purchase prevents deletion.
    // Do not cascade, delete purchase history, or remove potentially shared files.
    const { data, error } = await supabase.from("ebooks").delete().eq("id", id).select("id");
    if (error?.code === "23503") {
      return res.status(409).json({
        success: false,
        message: "This e-book has transaction or download history and cannot be deleted. Use Unpublish instead to preserve customer access.",
      });
    }
    if (error) throw error;
    if (!data?.length) {
      return res.status(404).json({ success: false, message: "E-book not found. Refresh the list and try again." });
    }
    return res.json({
      success: true,
      deletedId: id,
      message: "E-book deleted. Uploaded cover and book files have been kept in storage.",
    });
  } catch {
    // Do not expose raw database details to the client.
    return res.status(500).json({ success: false, message: "Unable to delete the e-book. Please try again." });
  }
}

module.exports = { deleteEbook };
