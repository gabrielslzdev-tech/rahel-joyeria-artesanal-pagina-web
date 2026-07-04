import NextAuth from "next-auth";
import { authConfig } from "./config";

/**
 * Instancia NextAuth SOLO para el middleware (edge). Usa la config edge-safe
 * (sin adapter ni providers de Node), por lo que únicamente lee el JWT.
 */
export const { auth } = NextAuth(authConfig);
