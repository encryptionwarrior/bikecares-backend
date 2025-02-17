import { PaymentProviderEnum } from '../../constants.js';
import Booking from '../../models/booking/booking.models.js';

let razorpayInstance;

try {
    razorpayInstance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
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

    const basicCharge = booking.basicCharge;

    const chargeOptions = {
        amount: parseInt(basicCharge)* 100,
        currency: 'INR',
        description: 'Basic Charge for a garage',
        receipt: nanoId(10),
    };

    razorpayInstance.orders.create(chargeOptions, 
        async function(err, razorpayOrder) {
            if(!razorpayOrder || (err && err.error)){
                return  res.status(err.statusCode).json(new ApiResponse(err.statusCode, null, err.reason || "Something went wrong while creating Razorpay order"));
            }

            const unpaidOrder = await BasicPayment.create({
                  customer: req.user._id,
                  items: orderItems,
                  bookingBasicPrice: totalPrice ?? 0,
                  discountedBasicPrice: totalDiscountedPrice ?? 0,
                  paymentProvider: PaymentProviderEnum.RAZORPAY,
                  paymentId: razorpayOrder.id,
                  coupon: userCart.coupon?._id,
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

})