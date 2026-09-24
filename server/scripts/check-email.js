require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { verifyEmailConnection } = require("../services/emailService");

verifyEmailConnection()
  .then(({ sender }) => console.log(`Gmail SMTP authentication succeeded for ${sender}. No email was sent.`))
  .catch((error) => {
    console.error(`Email check failed: ${error.message}`);
    process.exitCode = 1;
  });
