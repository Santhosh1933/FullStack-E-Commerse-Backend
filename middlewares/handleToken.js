const CryptoJS = require("crypto-js");

const authenticateToken = (req, res, next) => {
  const token = req.body.token;

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

module.exports = authenticateToken;
