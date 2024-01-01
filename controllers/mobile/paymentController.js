// const PaytmChecksum = require("paytmchecksum");
// const PaytmChecksum = require('./PaytmChecksum');
const https = require("https");
const Payment = require("../../models/paymentModel");

const sdk = require('api')('@instamojo/v2#40d2ktblgmqonaz');
class PaymentController {
    // async paymentInit(req, res) {
    //     var paytmParams = {};
    //     paytmParams.body = {
    //         requestType: "Payment",
    //         mid: "MXuCCa19111548144016",
    //         websiteName: "https://www.w3schools.com/",
    //         orderId: "ORDERID_98765",
    //         callbackUrl: "https://www.w3schools.com/",
    //         txnAmount: {
    //             value: "1.00",
    //             currency: "INR",
    //         },
    //         userInfo: {
    //             custId: "CUST_001",
    //         },
    //     };
    //     PaytmChecksum.generateSignature(
    //         JSON.stringify(paytmParams.body),
    //         "MXuCCa19111548144016"
    //     ).then(function (checksum) {
    //         paytmParams.head = {
    //             signature: checksum,
    //         };
    //         var post_data = JSON.stringify(paytmParams);
    //         var options = {
    //             hostname: "securegw-stage.paytm.in",
    //             port: 443,
    //             path: "/theia/api/v1/initiateTransaction?mid=MXuCCa19111548144016&orderId=ORDERID_98765",
    //             method: "POST",
    //             headers: {
    //                 "Content-Type": "application/json",
    //                 "Content-Length": post_data.length,
    //             },
    //         };
    //         var response = "";
    //         var post_req = https.request(options, function (post_res) {
    //             post_res.on("data", function (chunk) {
    //                 response += chunk;
    //             });
    //             post_res.on("end", function () {
    //                 console.log("Response: ", response);
    //             });
    //         });

    //         post_req.write(post_data);
    //         post_req.end();
    //     });
    // }

    // async instaMojoInitCreateAccessToken(req, res) {
    //     sdk.generateAccessTokenApplicationBasedAuthentication({
    //         grant_type: 'client_credentials',
    //         client_id: 'kf20GJOqeBIRWMpcjbH1KhuRcuNz4OD9QO50GrNw',
    //         client_secret: 'icPETiniQu0apbbn2WEJfaEi0cumWFVHczjnlrFyTPWjGIbhFIGR7Eze5WdjlOvU5wUYykuqiFUpOwFF5u93ZGm78GHh2R7HpyAMgwY3MCivD21EkaM25LTzdRM3y2xh'
    //     })
    //         .then(({ data }) => {
    //             return res.json({
    //                 data: data
    //             })
    //         })
    //         .catch(err => { console.error(err) });
    // }

    // async instaMojoPaymentRequest(req, res) {
    //     sdk.auth('Bearer T7LA0l_I-T2tJg_BzUVJyifGg5zCQXLr7AWHcQJNGmw.BgwCgHfXdNsslHYPmMiIGRm5wRzx0L2-zvInaAAA208');
    //     sdk.createAPaymentRequest1({ allow_repeated_payments: false, send_email: false, amount: 1, purpose: 'test' })
    //         .then(({ data }) => {
    //             return res.json({
    //                 data: data
    //             })
    //         })
    //         .catch(err => console.error(err))
    // }
    // 
    /**
     * Payment History
     * @param {*} req 
     * @param {*} res 
     */
    async paymentHistory(req, res) {
        const transactions = await Payment.find({ userId: req.user._id });
        res.json({
            status: true,
            data: transactions
        });
    }

    // async walletTransaction(req, res) {
    //     const { amount,type,} = req.body;
    //     const transaction = await TransactionModel.create({

    //     });
    // }



}
module.exports = new PaymentController();
