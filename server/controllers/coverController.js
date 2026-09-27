const { saveCover, importStoredCover } = require("../services/coverStorage");

function failure(res, error) {
  return res.status(error.status || 502).json({ success: false, message: error.status ? error.message : "Unable to process the cover. Please try again." });
}

async function uploadCover(req, res) {
  try {
    const cover = await saveCover(req.body, req.query.filename);
    res.status(201).json({ success: true, ...cover });
  } catch (error) { failure(res, error); }
}

async function importCover(req, res) {
  try {
    const cover = await importStoredCover(req.body?.path);
    res.status(201).json({ success: true, ...cover });
  } catch (error) { failure(res, error); }
}

module.exports = { uploadCover, importCover };
