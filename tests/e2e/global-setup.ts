import { cleanupFixtures, createFixtures } from "./fixtures";

export default async function globalSetup() {
  await cleanupFixtures();
  await createFixtures();
}

export async function globalTeardown() {
  await cleanupFixtures();
}
