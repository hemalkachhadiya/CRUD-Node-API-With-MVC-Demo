const axios = require("axios");
const signRequest = require("../helper/helper");

exports.getData = async (req, res) => {
  try {
    const payload = `{
  "merchantId": "${process.env.MERCHANT_ID}",
  "merchantTransactionId": "${req.body.uniqueId}",
  "merchantUserId": "${req.body.userid}",
  "amount": ${process.env.AMMOUNT * 100},
  "redirectUrl": "https://app.redboxglobal.com/subscription-success",
  "redirectMode": "POST",
  "callbackUrl": "http://localhost:4545/payment/responce/M14ZF40ML37M/MT79108116104855",
  "paymentInstrument": {
    "type": "PAY_PAGE"
  }
}`;
    let objJsonB64 = Buffer.from(payload).toString("base64");
    const sign = objJsonB64 + "/pg/v1/pay" + process.env.INDEX_KEY;
    // console.log(objJsonB64, "sha256");
    const sha256 = signRequest(sign);
    const X_VERIFY = sha256 + "###" + process.env.INDEX_KEY_SALT;
    console.log(X_VERIFY, "X_VERIFY");
    const options = {
      method: "POST",
      url: "https://api.phonepe.com/apis/hermes/pg/v1/pay",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-VERIFY": X_VERIFY,
      },
      data: { request: objJsonB64 },
    };
    axios
      .request(options)
      .then(function (response) {
        res.status(200).send({
          success: true,
          message: "payment successful",
          base64: response.data,
        });
      })
      .catch(function (error) {
        console.log(error, "this is an error");
        res.status(404).send({
          success: false,
          message: "something went wrong",
          error: error,
        });
      });
    res
      .status(200)
      .json({ message: "This is success message!", success: true });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message, success: false });
  }
};

exports.getstatus = async (req, res) => {
  try {
    const sha256 = signRequest(
      `/pg/v1/status/${req.params.merchantId}/${req.params.merchantTransactionId}` +
        "33b6431a-bec4-41f8-9012-4ea557ca580f"
    );
    const x_verify = sha256 + "###" + 1;
    const options = {
      method: "GET",
      url: `https://api.phonepe.com/apis/hermes/pg/v1/status/${req.params.merchantId}/${req.params.merchantTransactionId}`,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-VERIFY": x_verify,
        "X-MERCHANT-ID": req.params.merchantId,
      },
    };
    axios
      .request(options)
      .then(function (response) {
        res.status(200).send({
          success: true,
          message: "payment successful",
          base64: response.data,
        });
      })
      .catch(function (error) {
        console.error(error);
      });
  } catch (error) {
    res.status(400).json({ message: "something went wrong!", success: false });
  }
};
