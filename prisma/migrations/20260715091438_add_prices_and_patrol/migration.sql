-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "location" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isForAll" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "priceChildren" INTEGER NOT NULL DEFAULT 0,
    "priceOlder" INTEGER NOT NULL DEFAULT 0,
    "targetPatrol" TEXT NOT NULL DEFAULT 'Všichni',
    CONSTRAINT "Event_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Event" ("createdAt", "createdById", "date", "description", "id", "isForAll", "location", "title") SELECT "createdAt", "createdById", "date", "description", "id", "isForAll", "location", "title" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
