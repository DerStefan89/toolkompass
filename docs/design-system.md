# Design-System — Prinzipien und Maßstäbe

> Ergänzt die verbindliche Regel in `CLAUDE.md`: Die Screenshots in `design-refs/` sind
> die einzige visuelle Referenz. Diese Datei liefert die Maßstäbe für die Beurteilung.
>
> Wird für UI-Arbeit gelesen, nicht bei jeder Aufgabe. Der Subagent `design-guardian`
> prüft gegen die Screenshots — diese Datei sagt ihm, worauf er dabei achtet.

## Gestaltungsprinzipien

- Vertrauenswürdig, kuratiert, ruhig, editorial, hochwertig — nicht verspielt
- Creme-/Offwhite-Hintergründe, feine Linien, Cards, abgerundete Ecken, dezente Icons
- Dunkles Grün = einzige CTA-Farbe
- Goldener Kompass = Markenzeichen (Logo)

## Design-Tokens

Quelle ist `app/globals.css` — dort stehen die CSS-Variablen `--color-*`, `--radius-*`
und `--shadow-*` mit Kommentaren. **Keine Farbwerte in dieser Datei wiederholen.**
Eine Farbe an zwei Stellen läuft auseinander, sobald eine davon geändert wird.

## Referenz-Screenshots

Ordner `design-refs/`. Der Dateiname benennt die Seite.