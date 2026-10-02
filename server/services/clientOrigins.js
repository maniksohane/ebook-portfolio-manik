function parseClientOrigins(value = "") {
  return new Set(
    String(value)
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  );
}

function createCorsOriginCheck(value) {
  const allowedOrigins = parseClientOrigins(value);

  return (origin, callback) => {
    // Requests without an Origin header are server-to-server or same-origin.
    callback(null, !origin || allowedOrigins.has(origin));
  };
}

module.exports = { createCorsOriginCheck, parseClientOrigins };
