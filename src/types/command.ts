import { type User } from "@/prisma";

type CommandResult = {
  success: boolean;
  message: string;
  data: any;
};

type Command = {
  name: string;
  description: string;
  requiresAuth: boolean;
  execute: (args: string[], user: User | undefined) => Promise<string> | string;
};

export type { Command, CommandResult };
