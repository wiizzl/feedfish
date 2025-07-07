# feedfish

1. Create env file and edit the connection string based on your mysql database

```
touch .env && echo "DATABASE_URL=mysql://username:password@localhost:3306/database_name" >> .env
```

2. Run migration commands using your favorite package manager (I used bun)

```
bun run db:generate && bun run db:push
```

3. Run development server

```
bun run dev
```
