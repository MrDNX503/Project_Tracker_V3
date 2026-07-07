/* ============================================================
   KashFinance Project Tracker V3 — Type Barrel Exports
   ------------------------------------------------------------
   Entity types come from the SQLite layer (src/db/types.ts),
   which is the single source of truth for data shapes.
   The legacy domain types in ./project, ./planner, ./susan and
   ./settings are kept for reference but are NOT re-exported to
   avoid conflicting duplicate definitions.
   ============================================================ */

export type * from '../db/types';
export type {
  SusanContext,
  ProductivityAnalysis,
  SusanMessage,
} from '../services/susanAI';
