export type MessageStatus = "sent" | "delivered" | "read";

export interface Message {
  id: number;
  senderId: number;
  text: string;
  time: string;
  status: MessageStatus;
}
