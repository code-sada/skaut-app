import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import DocumentsClient from "./DocumentsClient";
import { createDocument, deleteDocument } from "@/app/actions";

const prisma = new PrismaClient();

export default async function DocumentsPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  let currentUser = null;
  if (userId) {
    currentUser = await prisma.user.findUnique({ where: { id: userId } });
  }

  const role = currentUser?.role;
  const canManage = role === "admin" || role === "user" || role === "leader";

  // Načteme všechny dokumenty z databáze
  const documents = await prisma.document.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 pb-20">
      <DocumentsClient
        documents={documents}
        canManage={canManage}
        createDocumentAction={createDocument}
        deleteDocumentAction={deleteDocument}
      />
    </div>
  );
}
