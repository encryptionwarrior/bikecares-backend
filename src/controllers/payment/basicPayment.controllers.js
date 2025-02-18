import Razorpay from 'razorpay';
import { PaymentProviderEnum } from '../../constants.js';
import {Booking} from '../../models/booking/booking.models.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { nanoid } from 'nanoid';
import { ApiResponse } from "../../utils/ApiResponse.js";
import { BasicPayment } from "../../models/payment/basicPayment.model.js"
import crypto from 'crypto';

const orderFullfillmentHelper = async (orderPaymentId, req) => {
    const order = await BasicPayment.findOneAndUpdate({
        paymentId: orderPaymentId,
    },
{
    $set: {
        isPaymentDone: true,
    },
}, {
    new: true,
});

    if (!order) {
        throw new Error('Payment not found');
    }

    return order

}

// key_id: "rzp_test_qjyI9BADlgxgEN",
// key_secret: "8qpZKIcCaLHYoTIMOtbXgf5U",
console.log("razoepay ++++++++++++++++++++++++++", process.env.RAZORPAY_KEY_ID)
let razorpayInstance;
try {
    razorpayInstance = new Razorpay({
     key_id: "rzp_test_pzoN5sXkcuL1PN",
    //  key_id: "rzp_live_aHuY3yR7mS7lSw",
key_secret: "nw12gZYmPQPQC0Ns5b90EZ0d",
        // key_id: process.env.RAZORPAY_KEY_ID,
      
        // key_secret: process.env.RAZORPAY_KEY_SECRET,
        currency: 'INR'
    })
} catch (error) {
    console.error('Error initializing Razorpay', error);
}

const generateRazorPayOrder = asyncHandler(async (req, res) => {
    const { bookingId  } = req.body;

    if(!razorpayInstance){
        console.error('Razorpay instance not found');
        throw new Error('Internal server error');
    }

    const booking = await Booking.findById(bookingId);

    if(!booking){
        throw new Error('Booking not found');
    }

    // const basicCharge = booking.basicCharge;
    const basicCharge =266;

    const chargeOptions = {
        amount: parseInt(basicCharge)* 100,
        currency: 'INR',
        receipt: nanoid(10),
    };

    razorpayInstance.orders.create(chargeOptions, 
        async function(err, razorpayOrder) {
            if(!razorpayOrder || (err && err.error)){
                console.error('Razorpay order creation error:', err);
                return  res.status(err.statusCode).json(new ApiResponse(err.statusCode, null, err.reason || "Something went wrong while creating Razorpay order +++++++++"));
            }

            const unpaidOrder = await BasicPayment.create({
                  customer: req.user._id,
                  items: "dsds",
                  bookingBasicPrice: 200 ?? 0,
                  discountedBasicPrice: 200 ?? 0,
                  paymentProvider: PaymentProviderEnum.RAZORPAY,
                  paymentId: razorpayOrder.id,
                  coupon: "678f167de80886f03ce7a39f",
            });

            if(unpaidOrder){
                return res.status(201).json(new ApiResponse(201, razorpayOrder, "Razorpay order generated"));
            } else {
                return res.status(500).json(new ApiResponse(500, null, "Something went wrong while initialising the razorpay order."));
            }

        }
    )

});

const verifyRazorpayPayment = asyncHandler(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    

    const body = razorpay_order_id + '|' + razorpay_payment_id;

    let expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body).digest('hex');

    if(expectedSignature === razorpay_signature){
        const order = await orderFullfillmentHelper(razorpay_order_id, req);

        return res.status(200).json(new ApiResponse(200, order, "Payment successful"));
    } else {
        throw new ApiError(400, 'Invalid Razorpay signature');
    }

});

export {
    generateRazorPayOrder,
    verifyRazorpayPayment,
}