export interface IPresenceService {
  setOnline(userId: string, socketId: string): Promise<void>;
  setOffline(userId: string, socketId: string): Promise<void>;
  isOnline(userId: string): Promise<boolean>;
  getSocketIds(userId: string): Promise<string[]>;
  getOnlineUsers(userIds: string[]): Promise<string[]>;
}

export const PRESENCE_SERVICE = Symbol("IPresenceService");
