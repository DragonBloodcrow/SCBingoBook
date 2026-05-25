import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { signToken } from '../lib/jwt.js';
import { AppError } from '../middleware/errorHandler.js';

const SALT_ROUNDS = 12;

export async function registerUser({ email, username, password, displayName }) {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });

  if (existing) {
    throw new AppError('Email or username already in use', 409);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email,
      username,
      passwordHash,
      displayName: displayName ?? username,
    },
    select: publicUserSelect,
  });

  const token = signToken({ sub: user.id, email: user.email });

  return { user, token };
}

export async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const valid = await bcrypt.compare(password, user.passwordHash);

  if (!valid) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = signToken({ sub: user.id, email: user.email });

  return {
    user: sanitizeUser(user),
    token,
  };
}

export async function getUserById(id) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: publicUserSelect,
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
}

const publicUserSelect = {
  id: true,
  email: true,
  username: true,
  displayName: true,
  createdAt: true,
};

function sanitizeUser(user) {
  const { passwordHash: _removed, ...rest } = user;
  return {
    id: rest.id,
    email: rest.email,
    username: rest.username,
    displayName: rest.displayName,
    createdAt: rest.createdAt,
  };
}
