const PAYPAL_CLIENT_ID = "AUpJ0HFcOrL0SXaqhXm6ITNvB7G7jLRGvLmjuIYF8ZctBOEsfs8YfPg2h3nhZBUywDmdDznxKsl7qGyb" // https://developer.paypal.com/home/
const PAYPAL_SECRET = "EIHanWxBlkEL5RYB-J5-xSEh9b-9NhYdZmWKU7MN_UPjhW8YApjtkJfZDZL20n5xSgMW9-hm1f-xshl5"
const PAYPAL_API = "https://api-m.sandbox.paypal.com" // https://developer.paypal.com/api/rest/


const getAccessToken = async () => {
  const response = await axios.post(
    `${PAYPAL_API}/v1/oauth2/token`,
    "grant_type=client_credentials",
    {
      auth: {
        username: PAYPAL_CLIENT_ID,
        password: PAYPAL_SECRET,
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return response.data.access_token;
};
exports.getDetailsOfPayout = async (req, res) => {
  try {
    const accessToken = await getAccessToken();
    const payoutStatusResponse = await axios.get(
      `${PAYPAL_API}/v1/payments/payouts/${req.body.batchId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    res.status(200).send(payoutStatusResponse.data);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ error: "An error occurred while fetching payout details." });
  }
};

exports.paypalPayout = async (req, res) => {
  const { recipient_email, amount, currency, userName } = req.body;
  const subject = "Completion of Payout.";
  try {
    const accessToken = await getAccessToken();
    const payoutData = {
      sender_batch_header: {
        sender_batch_id: `batch_${Date.now()}`,
        email_subject: "You have a payout!",
      },
      items: [
        {
          recipient_type: "EMAIL",
          amount: {
            value: amount,
            currency: currency,
          },
          receiver: recipient_email,
          note: "Thank you for your work!",
          sender_item_id: `item_${Date.now()}`,
        },
      ],
    };
    console.log(accessToken, "accessToken");
    const payoutResponse = await axios.post(
      `${PAYPAL_API}/v1/payments/payouts`,
      payoutData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    sendEmail(
      recipient_email,
      subject,
      paymentConfirmMail(
        userName,
        payoutResponse.data.batch_header.payout_batch_id,
        amount
      ),
      (error, response) => {
        if (error) {
          console.error("Error:", error);
        } else {
          console.log("Response:", response);
        }
      }
    );
    res.status(200).send({
      success: true,
      message: "payout created successfully",
      data: payoutResponse.data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "An error occurred while creating the payout.",
      data: error,
    });
  }
};

exports.paypalPayment = async (req, res) => {
  const { amount, currency, return_url, cancel_url } = req.body;
  try {
    const accessToken = await getAccessToken();

    const paymentData = {
      intent: "sale",
      redirect_urls: {
        return_url: return_url,
        cancel_url: cancel_url,
      },
      payer: {
        payment_method: "paypal",
      },
      transactions: [
        {
          amount: {
            total: amount,
            currency: currency,
          },
          description: "Payment to your account",
        },
      ],
    };

    const paymentResponse = await axios.post(
      `${PAYPAL_API}/v1/payments/payment`,
      paymentData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    // const Transaction = await transactionModel.create({
    //   amount: amount,
    //   transacationId: "123454",
    //   adminId: adminId,
    //   transactionType: 1,
    // });
    // const admin = await Admin.findById(adminId);
    // admin.walletBalance = admin.walletBalance + amount;
    // await admin.save();
    const approvalUrl = paymentResponse.data.links.find(
      (link) => link.rel === "approval_url"
    ).href;
    res.status(200).send({ success: true, approvalUrl: approvalUrl });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ error: "An error occurred while creating the payment." });
  }
};
