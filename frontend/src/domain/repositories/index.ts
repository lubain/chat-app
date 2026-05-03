import { Contact } from "@/domain/entities/Contact";
import { Message } from "@/domain/entities/Message";
import { User } from "@/domain/entities/User";

export interface IAuthRepository {
  getCurrentUser(): User;
  login(email: string, password: string): Promise<User>;
  register(name: string, email: string, password: string): Promise<User>;
  logout(): void;
}

export interface IContactRepository {
  getContacts(): Contact[];
}

export interface IMessageRepository {
  getMessagesByContactId(contactId: number): Message[];
  sendMessage(contactId: number, text: string): Message;
}
