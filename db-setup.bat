@echo off
echo === Installing tsx ===
call npm install -D tsx
echo === Generating Prisma Client ===
call npx prisma generate
echo === Pushing schema to database ===
call npx prisma db push
echo === Running seed ===
call npx prisma db seed
echo === All done! ===
