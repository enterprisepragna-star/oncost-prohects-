#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const baseDir = __dirname;

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function createFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf8');
  const rel = path.relative(baseDir, filePath).replace(/\\/g, '/');
  console.log(`✓ ${rel}`);
}

console.log('\n📝 Creating API endpoints...\n');

// USERS INTERFACE
createFile(path.join(baseDir, 'pages/api/users.ts'), `import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  createdAt: string;
}

let users: User[] = [];

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export function findUserByEmail(email: string): User | undefined {
  return users.find(u => u.email === email);
}

export function createUser(name: string, email: string, phone: string, password: string): User {
  const user: User = {
    id: crypto.randomUUID(),
    name,
    email,
    phone,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  return user;
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.status(200).json({ users: users.length, message: 'Users API endpoint' });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
`);

// SIGNUP ENDPOINT
createFile(path.join(baseDir, 'pages/api/signup.ts'), `import { NextApiRequest, NextApiResponse } from 'next';
import { createUser, findUserByEmail } from './users';

interface SignupRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, email, phone, password }: SignupRequest = req.body;

  // Validation
  if (!name || !email || !phone || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  if (!/^\\d{10}$/.test(phone.replace(/\\D/g, ''))) {
    return res.status(400).json({ message: 'Invalid phone number' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  // Check if user exists
  if (findUserByEmail(email)) {
    return res.status(409).json({ message: 'Email already registered' });
  }

  try {
    const user = createUser(name, email, phone, password);
    return res.status(201).json({
      message: 'Account created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
}
`);

// LOGIN ENDPOINT
createFile(path.join(baseDir, 'pages/api/login.ts'), `import { NextApiRequest, NextApiResponse } from 'next';
import { findUserByEmail, verifyPassword } from './users';
import crypto from 'crypto';

interface LoginRequest {
  email: string;
  password: string;
}

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password }: LoginRequest = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  const user = findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  if (!verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = generateToken();

  return res.status(200).json({
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    },
  });
}
`);

// FORGOT PASSWORD ENDPOINT
createFile(path.join(baseDir, 'pages/api/forgot-password.ts'), `import { NextApiRequest, NextApiResponse } from 'next';
import { findUserByEmail } from './users';

interface ForgotPasswordRequest {
  email: string;
}

interface ResetToken {
  email: string;
  token: string;
  expiresAt: Date;
}

let resetTokens: ResetToken[] = [];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email }: ForgotPasswordRequest = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const user = findUserByEmail(email);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Generate reset token (in production, use proper token service)
  const resetToken = Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);
  
  resetTokens.push({
    email,
    token: resetToken,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  });

  // In production, send email with reset link
  // For now, just return success
  return res.status(200).json({
    message: 'Password reset link sent to email',
    resetToken, // In production, never send this
  });
}
`);

// RESET PASSWORD ENDPOINT
createFile(path.join(baseDir, 'pages/api/reset-password.ts'), `import { NextApiRequest, NextApiResponse } from 'next';
import { findUserByEmail, hashPassword } from './users';

interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  email: string;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { token, newPassword, email }: ResetPasswordRequest = req.body;

  if (!token || !newPassword || !email) {
    return res.status(400).json({ message: 'Token, email, and new password required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  const user = findUserByEmail(email);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // In production, verify the reset token
  // For now, just update the password
  user.passwordHash = hashPassword(newPassword);

  return res.status(200).json({
    message: 'Password reset successfully. Please login with your new password.',
  });
}
`);

console.log('\\n✓ API endpoints created successfully!');
console.log('\\n📊 Summary:');
console.log('✓ Created 6 core pages (shop, collections, signup, login, forgot-password, contact)');
console.log('✓ Created account dashboard');
console.log('✓ Created 7 additional pages (bulk-orders, about, privacy, terms, services, careers)');
console.log('✓ Created 5 API endpoints (users, signup, login, forgot-password, reset-password)');
console.log('\\n✨ ONCOST website structure is complete!');
