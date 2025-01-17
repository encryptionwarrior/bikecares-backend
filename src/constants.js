
export const DB_NAME = "mechanic";


export const UserRolesEnum = {
    ADMIN: "ADMIN",
    USER: "USER"
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

export const partnerTypeEnum = {
    MECHANIC: "mechanic",
    GARAGEOWNER: "garageOwner",
    MECHANIC_OWNER: "mechanicOwner"
}

export const AvailablePartnerTypes = Object.values(partnerTypeEnum);

// Haversine formula for distance calculation
export const haversine = (lat1, lon1, lat2, lon2) => {
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