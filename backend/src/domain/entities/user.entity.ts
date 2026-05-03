export class User {
  constructor(
    public readonly id: string,
    public name: string,
    public email: string,
    public passwordHash: string,
    public avatarUrl: string,
    public status: UserStatus,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  updateStatus(status: UserStatus): void {
    this.status = status;
    this.updatedAt = new Date();
  }

  updateName(name: string): void {
    this.name = name;
    this.updatedAt = new Date();
  }
}

export enum UserStatus {
  ONLINE = "online",
  OFFLINE = "offline",
  AWAY = "away",
}
