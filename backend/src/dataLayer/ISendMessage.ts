export interface ISendMessage {
    sendMessageToAllClient: (payload) => void
    sendMessageToClient: (connectionId, payload) => void
}