import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { GlobalExceptionFilter } from "./shared/filters/global-exception.filter";
import { LoggingInterceptor } from "./shared/interceptors/logging.interceptor";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // Augmenter la limite du body pour les images base64 (10MB)
    bodyParser: true,
  });

  app.setGlobalPrefix("api/v1");

  const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
    .split(",")
    .map((o) => o.trim());

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void
    ) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  // Augmenter la limite JSON à 10MB pour les images base64
  app.use(require("express").json({ limit: "10mb" }));
  app.use(require("express").urlencoded({ extended: true, limit: "10mb" }));

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
  console.log(`🔌 WebSocket: ws://localhost:${port}/chat`);
  console.log(`✅ CORS: ${allowedOrigins.join(", ")}`);
  console.log(
    `☁️  Cloudinary: ${
      process.env.CLOUDINARY_CLOUD_NAME ? "✅ configured" : "❌ NOT configured"
    }`
  );
}

bootstrap();
