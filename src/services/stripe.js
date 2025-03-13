import Stripe from "stripe";

const stripe = new Stripe("sk_test_LRnMitbj8BVVc9PWGJ1ulohj00MqyTtTkh");

//============================================================================================
/*   STRIP PAYMENT ACCOUNT	https://dashboard.stripe.com/login
    hemal.kachhadiya@gmail.com
    HKS@123#~tripe    */
//============================================================================================

//after the invocie
exports.splitPayment = async (req, res) => {
    try {
        let {
            orderId,
            amount,
            tokenId,
            tip,
            contractorAccountId,
            customerId,
            paymentMethodId,
            userId,
            tax,
            serviceFees,
            totalAmt,
            priceType
        } = req.body;


        if (amount < 1) {
            amount = 1;
        }
        amount = parseFloat(amount);
        amount = Math.round(amount * 100);

        // if (amount < 100) {
        //   amount = 100;
        // }
        // let contractorHalf = Math.ceil(amount * 0.8); // 80%
        // let contractorAmount = contractorHalf + tip;
        // let totalAmount = amount + tip;
        let Cont_serviceFees = 1.00;
        let Cont_tax = (amount + Cont_serviceFees) * 0.0625;
        let Cont_deduction = Cont_tax + Cont_serviceFees;
        let Cont_totalAmt = amount - Cont_deduction;
        Cont_totalAmt = Math.round(Cont_totalAmt * 100)
        let paymentMethod;
        if (paymentMethodId) {
            let customer = await stripe.customers.retrieve(customerId);
            let paymentMethodList = await stripe.paymentMethods.list({
                customer: customerId,
                type: "card",
            });
            let existingPaymentMethod = paymentMethodList.data.find(
                (pm) => pm.id === paymentMethodId
            );
            if (!existingPaymentMethod) {
                paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
                    customer: customerId,
                });
            } else {
                paymentMethod = existingPaymentMethod;
            }
        } else {
            paymentMethod = await stripe.paymentMethods.create({
                type: "card",
                card: {
                    token: tokenId,
                },
            });
            // Attach the PaymentMethod to the Customer
            paymentMethod = await stripe.paymentMethods.attach(paymentMethod.id, {
                customer: customerId,
            });
        }
        let count = 0;
        if (
            req.body.card_digits &&
            req.body.exp_year &&
            req.body.exp_month &&
            req.body.zip_code
        ) {
            count = 1;
        }

        // Create a PaymentIntent using the PaymentMethod
        let paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: "usd",
            payment_method: paymentMethod.id,
            confirmation_method: "manual",
            confirm: true,
            return_url: "http://192.168.29.113:5000/api/v1/success/payment",
            // Include the Customer in the customer parameter
            customer: customerId,
        });

        if (paymentIntent.status !== "succeeded") {
            throw new Error("Payment confirmation failed");
        }

        let transactionId = paymentIntent.id;

        // contractor Transfer
        let contractorTransfer = await stripe.transfers.create({
            amount: Cont_totalAmt,
            currency: "usd",
            destination: contractorAccountId,
        });

        let savedTransaction = await Transaction.create({
            orderId: orderId,
            amount: amount / 100,
            contractorAmount: Cont_totalAmt / 100,
            contractorTransferId: contractorTransfer.id,
            transactionId: transactionId,
            contractorAccountId: contractorAccountId,
            tip: req.body.tip,
            tax: tax,
            serviceFees: serviceFees,
            totalAmt: amount
        });

        if (priceType === 1) {
            await Contractor.findOneAndUpdate({ account_id: contractorAccountId }, {
                isAssign: 0
            }, { new: true })
        } else {
            await Contractor.findOneAndUpdate(
                { account_id: contractorAccountId },
                { $inc: { acceptedJob: -1 } },
                { new: true }
            );
        }


        if (count == 1) {
            let user = await User.findByIdAndUpdate(userId, {
                $push: {
                    payment_Details: {
                        pm_id: paymentMethod.id,
                        card_digits: req.body.card_digits,
                        exp_year: req.body.exp_year,
                        exp_month: req.body.exp_month,
                        zip_code: req.body.zip_code,
                    },
                },
            });
        }

        res.status(200).send({
            success: true,
            message: "Payment completed successfully",
            paymentIntentId: paymentIntent.id,
            contractorAmount: Cont_totalAmt,
            contractorTransferId: contractorTransfer.id,
            orderId: orderId,
            fundsTransactionId: savedTransaction.transactionId,
        });


    } catch (error) {
        console.error(error);
        res.status(400).send({
            success: false,
            message: "Something went wrong",
        });
    }
};