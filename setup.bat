@echo off
echo === Initializing Prisma ===
call npx prisma init
echo === Prisma initialized ===
echo === Installing Shadcn UI ===
call npx -y shadcn@latest init -d -y
echo === Adding Shadcn components ===
call npx -y shadcn@latest add button input table dialog card calendar select badge dropdown-menu sheet separator skeleton form toast sonner -y
echo === Setup complete ===
