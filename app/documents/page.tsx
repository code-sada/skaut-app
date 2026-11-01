import DocumentsClient from "./DocumentsClient";
import { createDocument, deleteDocument } from "@/app/actions";
import { prisma, getSessionUser, MANAGEMENT_ROLES } from "@/lib/auth";

export default async function DocumentsPage() {
  const currentUser = await getSessionUser();
  const role = currentUser?.role;
  const canManage = MANAGEMENT_ROLES.has(role || "");

  // Row-Level Security: Členové neuvidí dokumenty z kategorie "Pro vedoucí"
  const whereClause = canManage
    ? {}
    : { NOT: { category: "Pro vedoucí" } };

  const documents = await prisma.document.findMany({
    where: whereClause,
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
