import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { WsException } from "@nestjs/websockets";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  handleRequest<T>(err: any, user: T): T {
    if (err || !user) {
      throw new UnauthorizedException("Invalid or expired token");
    }
    return user;
  }
}

@Injectable()
export class WsJwtAuthGuard extends AuthGuard("jwt") {
  getRequest(context: ExecutionContext) {
    const client = context.switchToWs().getClient();
    // Token passed in handshake auth or query
    const token =
      client.handshake?.auth?.token ||
      client.handshake?.headers?.authorization?.split(" ")[1];

    return { headers: { authorization: `Bearer ${token}` } };
  }

  handleRequest<T>(err: any, user: T): T {
    if (err || !user) {
      throw new WsException("Unauthorized");
    }
    return user;
  }
}
