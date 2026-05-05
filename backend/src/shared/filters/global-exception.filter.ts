import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger("ExceptionFilter");

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = "Internal server error";

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message =
        typeof res === "string"
          ? res
          : (res as { message: string | string[] }).message || message;

      // Log 4xx as warnings, 5xx as errors
      if (status >= 500) {
        this.logger.error(
          `${request.method} ${request.url} → ${status}: ${JSON.stringify(
            message
          )}`
        );
      } else {
        this.logger.warn(
          `${request.method} ${request.url} → ${status}: ${JSON.stringify(
            message
          )}`
        );
      }
    } else if (exception instanceof Error) {
      this.logger.error(
        `${request.method} ${request.url} → UNHANDLED: ${exception.message}`,
        exception.stack
      );
    } else {
      this.logger.error(
        `Unknown exception on ${request.url}`,
        String(exception)
      );
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: Array.isArray(message) ? message : [message],
    });
  }
}
