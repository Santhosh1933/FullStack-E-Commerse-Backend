const CryptoJS = require("crypto-js");

const authenticateTokenByHeader = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(400).send("Authorization header is required");
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(400).send("Token is required");
  }

  try {
    const bytes = CryptoJS.AES.decrypt(token, process.env.CRYPTO_SECRET);
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    req.user = decryptedData;
    next();
  } catch (error) {
    return res.status(401).send("Invalid token");
  }
};

module.exports = authenticateTokenByHeader;
