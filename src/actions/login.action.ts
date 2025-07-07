"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";

const loginAction = async (username: string) => {
  let user = await db.user.findUnique({
    where: { username },
  });

  if (!user) {
    user = await db.user.create({
      data: { username },
    });
  }

  revalidatePath("/");

  return { success: true, message: `Logged in as ${user.username} !`, data: { user } };
};

export { loginAction };
