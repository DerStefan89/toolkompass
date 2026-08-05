## TASK: architecture-auth-schichten
GOAL: `ARCHITECTURE.md` §3 (Auth) dokumentiert alle drei Schichten des
Admin-Auth-Schutzes (`proxy.ts`, Layout-Check, `requireAdmin()` in Server
Actions), nicht nur die dritte.
CONTEXT: `state/assumption-ledger.md` A1 (Pointer, nennt exakte Zeilen in
`proxy.ts` und `app/admin/layout.tsx`). `ARCHITECTURE.md` §3 aktueller Stand.
SCOPE: Nur `ARCHITECTURE.md` §3 ergänzen. NICHT `proxy.ts` oder `layout.tsx`
anfassen (nur beschreiben, was da ist, nicht ändern). NICHT andere Abschnitte
umschreiben.
BUDGET: ca. 15 Minuten.
OUTPUT: ergänztes `ARCHITECTURE.md` §3, das alle drei Schichten korrekt
beschreibt.
ESCALATE: Falls `proxy.ts` oder `layout.tsx` beim Gegenlesen anders aussehen
als in A1 beschrieben: die echte Fundstelle gewinnt, im Bericht benennen.
