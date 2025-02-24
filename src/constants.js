
export const DB_NAME = "mechanic";


export const UserRolesEnum = {
    ADMIN: "ADMIN",
    USER: "USER",
    MECHANIC: "MECHANIC"    

}

export const AvailableUserRoles = Object.values(UserRolesEnum);


export const UserLoginType = {
    GOOGLE: "GOOGLE",
    GITHUB: "GITHUB",
    EMAIL_PASSWORD: "EMAIL_PASSWORD" 
}

export const ChatEventEnum = Object.freeze({
    CONNECTED_EVENT: "connected",
    DISCONNECTED_EVENT: "disconnected",
    JOIN_CHAT_EVENT: "joinChat",
    LEAVE_CHAT_EVENT: "leaveChat",
    UPDATE_GROUP_NAME_EVENT: "updateGroupName",
    MESSAGE_RECEIVED_EVENT: "messageReceived",
    NEW_CHAT_EVENT: "newChat",
    SOCKET_ERROR_EVENT: "newChat",
    STOP_TYPING_EVENT: "stopTyping",
    TYPING_EVENT: "typing",
    MESSAGE_DELETE_EVENT: "messageDeleted",
    INCOMING_CALL_EVENT: "incoming:call",
})

export const AvailableSocialLogins = Object.values(UserLoginType);

export const BookingEventEnum = Object.freeze({
    UPCOMING_BOOKING_EVENT: "upcomingBooking",
    COMPLETED_BOOKING_EVENT: "completedBooking",
    BOOKING_REQUEST_EVENT: "bookingRequest",
    BOOKING_ACCEPTED_EVENT: "bookingAccepted",
    BOOKING_REJECTED_EVENT: "bookingRejected",
    BOOKING_COMPLETED_EVENT: "bookingCompleted",
    BOOKING_CANCELLED_EVENT: "bookingCancelled",
    BOOKING_EXPIRED_EVENT: "bookingExpired",
    BOOKING_UPDATED_EVENT: "bookingUpdated",
    CURRENT_USER: "CURRENT_USER",
});

export const AvailableBookingEvents = Object.values(BookingEventEnum);

export const USER_TEMPORARY_TOKEN_EXPIRY = 20 * 60 * 1000;

export const serviceTypeEnum = {
    OnTheGo: "onTheGo",
    HomeService: "homeService",
   InGarage: "inGarage",
}


export const AvailableServices = Object.values(serviceTypeEnum);

export const bookingStatusEnum = {
    PENDING: "pending",
    ACCEPTED: "accepted",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
    ONGOING: "ongoing",
    REJECTED: "rejected",
    EXPIRED: "expired",
}

export const AvailableBookingStatus = Object.values(bookingStatusEnum);

export const serviceTimelineStatusEnum = {
    REQUEST_ACCEPT_TIME: "requestAcceptedTime",
    INSPECTION_TIME: "inspectionTime",
    PAYMENT_TIME: "paymentTime",
    SERVICE_START_TIME: "serviceStartTime",
    SERVICE_COMPLETION_TIME: "serviceCompletionTime",
}

export const AvailableServiceTimelineStatuses = Object.values(serviceTimelineStatusEnum);

export const partnerTypeEnum = {
    MECHANIC: "mechanic",
    GARAGEOWNER: "garageOwner",
    MECHANIC_OWNER: "mechanicOwner"
}

export const AvailablePartnerTypes = Object.values(partnerTypeEnum);

export const PaymentStatusEnum = {
    PENDING: "PENDING",
    CANCELLED: "CANCELLED",
    DELIVERED: "DELIVERED",
  };
  
  export const AvailablePaymentStatuses = Object.values(PaymentStatusEnum);

  export const PaymentProviderEnum = {
    UNKNOWN: "UNKNOWN",
    RAZORPAY: "RAZORPAY",
    PAYPAL: "PAYPAL",
  };
  
  export const AvailablePaymentProviders = Object.values(PaymentProviderEnum);

// Haversine formula for distance calculation
export const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const toRad = (x) => (x * Math.PI) / 180;
  
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
  
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }