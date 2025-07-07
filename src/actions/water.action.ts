"use server";

import { type User } from "@/prisma";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";

const waterAction = async (userId: User["id"]) => {
  await db.waterAction.create({
    data: { userId },
  });

  revalidatePath("/");

  return { success: true, message: "The water has been changed !", data: { userId } };
};

const lastWatersAction = async () => {
  const waters = await db.waterAction.findMany({
    include: {
      user: {
        select: {
          username: true,
        },
      },
    },
    orderBy: {
      timestamp: "desc",
    },
    take: 5,
  });

  if (waters.length === 0) {
    return {
      success: true,
      message: "No waters found.",
      data: null,
    };
  }

  const watersText = waters
    .map(
      (water) =>
        `${water.user.username} - ${water.timestamp.toLocaleDateString("fr-FR")} ${water.timestamp.toLocaleTimeString(
          "fr-FR"
        )}`
    )
    .join("\n");

  return {
    success: true,
    message: `Last 5 waters:\n${watersText}`,
    data: waters,
  };
};

const waterersAction = async () => {
  const waterers = await db.user.findMany({
    select: {
      username: true,
      _count: {
        select: {
          WaterActions: true,
        },
      },
    },
    orderBy: {
      WaterActions: {
        _count: "desc",
      },
    },
    take: 10,
    where: {
      WaterActions: {
        some: {},
      },
    },
  });

  if (waterers.length === 0) {
    return {
      success: true,
      message: "No waterers found.",
      data: null,
    };
  }

  const waterersText = waterers
    .map((user, index) => `${index + 1}. ${user.username}: ${user._count.WaterActions} waters`)
    .join("\n");

  return {
    success: true,
    message: `Top water:\n${waterersText}`,
    data: waterers,
  };
};

export { lastWatersAction, waterAction, waterersAction };
