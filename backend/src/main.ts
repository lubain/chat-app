import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { GlobalExceptionFilter } from "./shared/filters/global-exception.filter";
import { LoggingInterceptor } from "./shared/interceptors/logging.interceptor";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix("api/v1");

  // Accepte plusieurs origines séparées par une virgule
  // Ex: FRONTEND_URL=https://app.vercel.app,http://localhost:5173
  const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
    .split(",")
    .map((o) => o.trim());

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void
    ) => {
      // Autoriser les requêtes sans origin (Postman, curl, mobile)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  const port = process.env.PORT || 3000;
  await app.listen(port, "0.0.0.0");

  console.log(`🚀 Server running on http://localhost:${port}/api/v1`);
  console.log(`🔌 WebSocket available on ws://localhost:${port}/chat`);
  console.log(`✅ CORS allowed origins: ${allowedOrigins.join(", ")}`);
}

bootstrap();
