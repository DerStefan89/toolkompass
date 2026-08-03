---
name: repo-audit
description: Führt eine Sanierungs-Prüfung durch, gleicht Anweisungsdokumente (CLAUDE.md, ARCHITECTURE.md, README.md, .claude/agents/*.md) gegen die reale Repo-Struktur ab und findet tote Verweise, veraltete Behauptungen und ungeprüfte Kopien. Nutzen nach mehreren abgeschlossenen Playbook-Zyklen, vor einem neuen Zyklus, oder wenn der Nutzer sagt "Sanierungsdurchgang", "Repo-Audit", "Doku gegen Realität prüfen", "Drift-Check" oder "ist das noch aktuell". NICHT nutzen für einzelne Code-Reviews oder PR-Checks — dafür frontend-reviewer/qa verwenden.
---

# Repo-Audit

## Instructions

1. **Quelle & Alter klären, bevor du urteilst.** Für jedes zu prüfende
   Dokument zuerst `git log -3 --date=iso --format="%h %ad %s" -- <datei>`
   laufen lassen. Alter ist der Sortierschlüssel — kein Beweis, aber der
   beste Hinweis, wo zuerst geschaut wird.
2. **Anweisungs- von Planungsdokumenten trennen.** Anweisungsdokumente
   (CLAUDE.md, ARCHITECTURE.md, README.md, .claude/agents/*.md) müssen
   wörtlich wahr sein. docs/STATUS.md ist ein Planungsdokument — es spricht
   über Vergangenheit/Zukunft; veraltete Verweise darin sind kein Fund,
   sondern normal.
3. **Jede Aussage prüfen, nicht nur verdächtige.** Ein Dokument, das an
   einer Stelle falsch ist, ist selten nur dort falsch.
4. **In beide Richtungen prüfen:**
   - Was steht drin, das es nicht gibt? (referenzierte Pfade/Dateien/Rollen
     mit `ls`/`existsSync` gegenprüfen)
   - Was gibt es, das nirgends steht? (neue Dateien in .claude/agents/,
     .claude/skills/, scripts/, die in keiner Doku erwähnt werden)
5. **Bericht statt Reparatur.** Ergebnis als Tabelle: Fundort | Behauptung |
   Ist-Stand | Kategorie (tot/veraltet/undokumentiert) | Alter der Quelle.
   NICHT selbstständig reparieren — jeder Fund geht einzeln zur Freigabe an
   den Menschen (Entscheidung dokumentieren, nicht stillschweigend in Code
   verwandeln).

## Common Issues

- Nur nach "verdächtigen" Stellen gesucht statt systematisch → falsches
  Sicherheitsgefühl. Fix: jede Aussage prüfen, nicht nur die auffälligen.
- docs/STATUS.md wie ein Anweisungsdokument behandelt → Kategoriefehler,
  erzeugt Fehlalarme bei einer Datei, die über Vergangenes/Zukünftiges
  spricht.
- Fund ohne Alter-Angabe gemeldet → nicht nachvollziehbar, ob er noch
  aktuell ist (siehe Zyklen-1-2-Erfahrung: zwei Funde waren beim Nachprüfen
  schon behoben).
- Ergebnis wird automatisch repariert statt dem Menschen vorgelegt.

## Examples

User sagt "mach mal einen Repo-Audit" oder "ist CLAUDE.md noch aktuell?" →
Skill lädt → prüft Alter + Anweisungs-vs-Planungsdokument-Trennung + beide
Richtungen → liefert Fundtabelle, repariert nichts selbst.
