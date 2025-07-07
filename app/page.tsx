"use client";

import styles from "./page.module.css";

import { type User } from "@/prisma";
import { useEffect, useRef, useState, useTransition } from "react";

import { feedAction, feedersAction, lastFeedsAction, whoFedAction } from "@/actions/feed.action";
import { loginAction } from "@/actions/login.action";
import { lastWatersAction, waterAction, waterersAction } from "@/actions/water.action";

import { isValidDate } from "@/lib/utils";

import type { Command, CommandResult } from "@/types/command";

export default function HomePage() {
  const [isPending, startTransition] = useTransition();

  const [user, setUser] = useState<User>();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState(`Welcome to FeedFish !\nUse 'help' to see available commands.`);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus the input when the page load
    inputRef.current?.focus();
  }, []);

  const executeAction = async (action: () => Promise<CommandResult>): Promise<string> => {
    try {
      const result = await action();
      return result.message;
    } catch (error) {
      return `Error: ${error instanceof Error ? error.message : "Unknown error"}`;
    }
  };

  const commands: Command[] = [
    {
      name: "help",
      description: "Show available commands",
      requiresAuth: false,
      execute: () => {
        const availableCommands = commands.map((command) => `${command.name}: ${command.description}`).join("\n");
        return `Available commands:\n${availableCommands}`;
      },
    },
    {
      name: "login",
      description: "Login with username",
      requiresAuth: false,
      execute: async (args) => {
        if (user) return `You are already logged in as ${user.username}.`;

        if (args.length !== 1) return "Invalid usage: login [username]";

        const username = args[0];
        if (username.length < 3) return "Username must be at least 3 characters long.";

        const action = executeAction(() =>
          loginAction(username).then((response) => {
            setUser(response.data.user);

            return { success: response.success, message: response.message, data: response.data };
          })
        );

        return action;
      },
    },
    {
      name: "feed",
      description: "Feed the fish",
      requiresAuth: true,
      execute: async (args, user) => {
        return executeAction(() => feedAction(user!.id));
      },
    },
    {
      name: "water",
      description: "Water the fish",
      requiresAuth: true,
      execute: async (args, user) => {
        return executeAction(() => waterAction(user!.id));
      },
    },
    {
      name: "topfeed",
      description: "Show top feeds",
      requiresAuth: true,
      execute: async () => {
        return executeAction(() => feedersAction());
      },
    },
    {
      name: "topwater",
      description: "Show top waters",
      requiresAuth: true,
      execute: async () => {
        return executeAction(() => waterersAction());
      },
    },
    {
      name: "listfeed",
      description: "List last 5 feed history",
      requiresAuth: true,
      execute: async () => {
        return executeAction(() => lastFeedsAction());
      },
    },
    {
      name: "listwater",
      description: "List last 5 water history",
      requiresAuth: true,
      execute: async () => {
        return executeAction(() => lastWatersAction());
      },
    },
    {
      name: "whofeed",
      description: "Show who fed on a specific date",
      requiresAuth: true,
      execute: async (args) => {
        if (args.length !== 1) return "Invalid usage: whofeed [date]";

        const date = args[0];
        if (!isValidDate(date)) return "Invalid date format. Use DD-MM-YYYY.";

        return executeAction(() => whoFedAction(date));
      },
    },
  ];

  const handleCommand = async (commandInput: string): Promise<string> => {
    if (!commandInput.trim()) return "";

    const parts = commandInput.trim().split(" ");
    const commandName = parts[0];
    const args = parts.slice(1);

    const command = commands.find((command) => command.name === commandName);

    if (!command) {
      return `Unknown command: ${commandName}`;
    }

    if (command.requiresAuth && !user) {
      return "You need to login first. Use 'login' command.";
    }

    try {
      const result = await command.execute(args, user);
      return result;
    } catch (error) {
      return `Error executing command: ${error instanceof Error ? error.message : "Unknown error"}`;
    }
  };

  const processInput = async () => {
    if (!input.trim()) return;

    setInput("");

    startTransition(async () => {
      const result = await handleCommand(input);
      const newOutput = output + "\n" + `$ ${input}` + (result ? "\n" + result : "");

      setOutput(newOutput);

      // Refocus the input because it loses focus after the transition
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    });
  };

  return (
    <section className={styles.app} onClick={() => inputRef.current?.focus()}>
      <div className={styles.terminal}>{output}</div>
      <div className={styles.inputContainer}>
        <span>$</span>
        <input
          disabled={isPending}
          className={styles.input}
          ref={inputRef}
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") processInput();
          }}
        />
      </div>
    </section>
  );
}
