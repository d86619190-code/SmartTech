import "express-serve-static-core";

declare module "express-serve-static-core" {
  interface Request {
    auth?: { userId: string; role: "client" | "master" | "admin" | "boss"; phone?: string; email?: string };
  }
}
