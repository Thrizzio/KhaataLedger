import bcrypt from 'bcrypt';

const saltRounds = 12;

export const hashPassword = (password: string): Promise<string> =>
  bcrypt.hash(password, saltRounds);

export const verifyPassword = (password: string, passwordHash: string): Promise<boolean> =>
  bcrypt.compare(password, passwordHash);
