import bcrypt from "bcryptjs";

// Hashing de contraseñas con bcrypt (bcryptjs: JS puro, sin binarios nativos).
// Solo se usa en servidor (Node), nunca en edge/cliente.
const SALT_ROUNDS = 12;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
