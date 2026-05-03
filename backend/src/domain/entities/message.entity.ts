export class Message {
  constructor(
    public readonly id: string,
    public readonly conversationId: string,
    public readonly senderId: string,
    public content: string,
    public status: MessageStatus,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  markAsDelivered(): void {
    if (this.status === MessageStatus.SENT) {
      this.status = MessageStatus.DELIVERED;
      this.updatedAt = new Date();
    }
  }

  markAsRead(): void {
    this.status = MessageStatus.READ;
    this.updatedAt = new Date();
  }

  isOwnedBy(userId: string): boolean {
    return this.senderId === userId;
  }
}

export enum MessageStatus {
  SENT = "sent",
  DELIVERED = "delivered",
  READ = "read",
}
