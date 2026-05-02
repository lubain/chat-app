import { Message } from "@/domain/entities/Message";

export class ChatUseCases {
  static buildNewMessage(
    text: string,
    senderId: number,
    existingMessages: Message[]
  ): Message | null {
    const trimmed = text.trim();
    if (!trimmed) return null;

    return {
      id: existingMessages.length + 1,
      senderId,
      text: trimmed,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "sent",
    };
  }

  static isOwnMessage(senderId: number, currentUserId: number): boolean {
    return senderId === currentUserId;
  }

  static formatContactStatus(online: boolean): string {
    return online ? "En ligne" : "Hors ligne";
  }
}
