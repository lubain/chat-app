export class Conversation {
  constructor(
    public readonly id: string,
    public participantIds: string[],
    public lastMessageId: string | null,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  hasParticipant(userId: string): boolean {
    return this.participantIds.includes(userId);
  }

  getOtherParticipant(userId: string): string | undefined {
    return this.participantIds.find((id) => id !== userId);
  }

  updateLastMessage(messageId: string): void {
    this.lastMessageId = messageId;
    this.updatedAt = new Date();
  }
}
