"use server";

import { type User } from "@/prisma";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";

const feedAction = async (userId: User["id"]) => {
  await db.feedAction.create({
    data: { userId },
  });

  revalidatePath("/");

  return { success: true, message: "The fishs has been fed !", data: { userId } };
};

const lastFeedsAction = async () => {
  const feeds = await db.feedAction.findMany({
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

  if (feeds.length === 0) {
    return {
      success: true,
      message: "No feeds found.",
      data: null,
    };
  }

  const feedsText = feeds
    .map(
      (feed) =>
        `${feed.user.username} - ${feed.timestamp.toLocaleDateString("fr-FR")} ${feed.timestamp.toLocaleTimeString(
          "fr-FR"
        )}`
    )
    .join("\n");

  return {
    success: true,
    message: `Last 5 feeds:\n${feedsText}`,
    data: feeds,
  };
};

const feedersAction = async () => {
  const feeders = await db.user.findMany({
    select: {
      username: true,
      _count: {
        select: {
          FeedActions: true,
        },
      },
    },
    orderBy: {
      FeedActions: {
        _count: "desc",
      },
    },
    take: 10,
    where: {
      FeedActions: {
        some: {},
      },
    },
  });

  if (feeders.length === 0) {
    return {
      success: true,
      message: "No feeders found.",
      data: null,
    };
  }

  const feedersText = feeders
    .map((user, index) => `${index + 1}. ${user.username}: ${user._count.FeedActions} feeds`)
    .join("\n");

  return {
    success: true,
    message: `Top feed:\n${feedersText}`,
    data: feeders,
  };
};

const whoFedAction = async (date: string) => {
  const [day, month, year] = date.split("-");
  const targetDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  const nextDate = new Date(targetDate);
  nextDate.setDate(nextDate.getDate() + 1);

  const feeds = await db.feedAction.findMany({
    where: {
      timestamp: {
        gte: targetDate,
        lt: nextDate,
      },
    },
    include: {
      user: {
        select: {
          username: true,
        },
      },
    },
    orderBy: {
      timestamp: "asc",
    },
  });

  if (feeds.length === 0) {
    return {
      success: true,
      message: `No one fed the fish on ${date}.`,
      data: null,
    };
  }

  const feedsText = feeds
    .map((feed) => `${feed.user.username} - ${feed.timestamp.toLocaleTimeString("fr-FR")}`)
    .join("\n");

  return {
    success: true,
    message: `Who fed on ${date}:\n${feedsText}`,
    data: feeds,
  };
};

export { feedAction, feedersAction, lastFeedsAction, whoFedAction };
