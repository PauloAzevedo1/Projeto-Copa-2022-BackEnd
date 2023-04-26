/*
  Warnings:

  - A unique constraint covering the columns `[participanId,gameId]` on the table `Guess` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Guess_participanId_gameId_key" ON "Guess"("participanId", "gameId");
