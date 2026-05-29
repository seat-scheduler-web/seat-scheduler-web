import { prisma } from "../lib/prisma.js";

const userResponse = {
  id: true,
  username: true,
  email: true,
  createdAt: true,
};

async function createUser({ username, email, password }) {
  return prisma.user.create({
    data: {
      username,
      email,
      password,
    },
    select: userResponse,
  });
}

async function getUserByEmail(email) {
  return prisma.user.findUnique({
    where: { email },
  });
}

async function getUserByUsername(username) {
  return prisma.user.findUnique({
    where: { username },
  });
}

async function getUserById(id) {
  return prisma.user.findUnique({
    where: { id: Number(id) },
    select: userResponse,
  });
}

export { createUser, getUserByEmail, getUserById, getUserByUsername };
