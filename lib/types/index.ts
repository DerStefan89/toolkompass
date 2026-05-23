/**
 * Datei: lib/types/index.ts
 *
 * Zweck: Zentrale TypeScript-Typen für ToolKompass
 *
 * Produkt-Kontext:
 * Diese Typen definieren die Kernentitäten der Plattform. Tools und Kategorien
 * sind die beiden Hauptobjekte, um die sich die gesamte Anwendung dreht.
 *
 * Wichtig:
 * Typen nicht ohne Abstimmung erweitern — sie bilden die Datenbankstruktur ab.
 */

export type TargetAudience =
  | "solo"
  | "team"
  | "agency"
  | "creator"
  | "consultant"
  | "developer";

export type Tool = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  longDescription?: string;
  categoryIds: string[];
  useCaseIds: string[];
  targetAudiences: TargetAudience[];
  startingPriceMonthly?: number;
  hasFreePlan: boolean;
  isAffiliate: boolean;
  vendorId: string;
  features: string[];
  strengths: string[];
  weaknesses: string[];
  bestFor: string[];
  notIdealFor: string[];
  lastCheckedAt?: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  toolCount?: number;
  exampleTools?: string[];
};
