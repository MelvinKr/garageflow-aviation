export type MaintTemplate = {
  id: string; label: string;
  aircraftType: string;
  tasks: Array<{
    label: string;
    partSku?: string;
    qty?: number;
    hours?: number;
    rate?: number;
  }>;
};

export const MAINT_TEMPLATES: MaintTemplate[] = [
  {
    id: "C172-50H",
    label: "Révision 50h — C172",
    aircraftType: "Cessna 172",
    tasks: [
      { label: "Vidange huile + filtre", partSku: "OIL-FILT-CH48110-1", qty: 1, hours: 1.2, rate: 95 },
      { label: "Inspection visuelle composants", hours: 0.8, rate: 95 },
      { label: "Graissage articulations commande", hours: 0.7, rate: 95 }
    ]
  },
  {
    id: "C172-100H",
    label: "Révision 100h — C172",
    aircraftType: "Cessna 172",
    tasks: [
      { label: "Bougies — remplacement set", partSku: "SPARK-REM40E", qty: 8, hours: 1.5, rate: 95 },
      { label: "Filtre carburant", partSku: "FUEL-FILT-10MIC", qty: 1, hours: 0.4, rate: 95 },
      { label: "Inspection contrôle moteur complète", hours: 2.0, rate: 95 }
    ]
  },
  {
    id: "SR22-ANNUAL",
    label: "Révision annuelle — SR22",
    aircraftType: "Cirrus SR22",
    tasks: [
      { label: "Kit joints inspection", partSku: "KIT-GASK-SR22", qty: 1, hours: 3.0, rate: 105 },
      { label: "Filtre huile", partSku: "OIL-FILT-CH48110-1", qty: 1, hours: 0.6, rate: 105 },
      { label: "Contrôle ailes / rivets / corrosion", hours: 2.5, rate: 105 }
    ]
  }
];

