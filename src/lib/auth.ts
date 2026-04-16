import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your_jwt_secret_key';

console.log('[Auth] JWT_SECRET configured:', JWT_SECRET ? 'YES' : 'NO');
console.log('[Auth] NEXTAUTH_SECRET env:', process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET');

export const hashPassword = async (password: string): Promise<string> => {
  return bcryptjs.hash(password, 10);
};

export const verifyPassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcryptjs.compare(password, hash);
};

export const generateToken = (userId: string): string => {
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
  console.log('[Auth] Token generated with secret:', JWT_SECRET.slice(0, 10) + '...');
  return token;
};

export const verifyToken = (token: string): any => {
  try {
    console.log('[Auth] Attempting to verify token with secret:', JWT_SECRET.slice(0, 10) + '...');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('[Auth] Token verified successfully');
    return decoded;
  } catch (error: any) {
    console.log('[Auth] Token verification failed:', error.message);
    return null;
  }
};
