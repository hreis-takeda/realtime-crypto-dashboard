import "dotenv/config";
import dotenv from "dotenv";
import path from "node:path";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./module";

async function bootstrap() {
  // Also load env from monorepo root if present
  dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
  const app = await NestFactory.create(AppModule, {
    logger: ["log", "error", "warn"],
  });
  const port = process.env.BACKEND_PORT
    ? Number(process.env.BACKEND_PORT)
    : 4000;
  app.enableCors({ origin: true });
  await app.listen(port);
  console.log(`Backend listening on http://localhost:${port}`);
}
bootstrap();
