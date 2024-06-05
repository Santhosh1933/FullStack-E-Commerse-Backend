const CryptoJS = require("crypto-js");

const handleShopIdToken = (req, res, next) => {
  const token = req.query.token;
  if (!token) {
    return res.status(400).send("Token is required");
  }

  try {
    const bytes = CryptoJS.AES.decrypt(token, process.env.CRYPTO_SECRET);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    console.log(token,decryptedData)
    if (!decryptedData) {
      return res.status(401).send("Invalid token");
    }
    req.shopId = decryptedData;
    next();
  } catch (error) {
    return res.status(401).send("Invalid token");
  }
};


module.exports = handleShopIdToken;
