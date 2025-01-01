
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