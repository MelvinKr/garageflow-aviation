"use client";

import ManagerOnly from "@/components/ManagerOnly";

export default function ReportsPageWrapper() {
  return (
    <ManagerOnly>
      {/* Remplacez par votre composant Rapports actuel */}
      <section className="p-6">
        <h1 className="text-xl font-semibold">Rapports</h1>
        <p className="text-sm text-gray-600">Section réservée aux managers.</p>
      </section>
    </ManagerOnly>
  );
}

