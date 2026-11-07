# Allenamento

Web app personale per seguire il protocollo di palestra di 12 settimane e il piano "Verso Roma 42" per la Maratona di Roma del 14 marzo 2027.

**App:** https://giulioribelli98.github.io/allenamento/

## Cosa fa
- **Palestra**: seduta del giorno con le serie previste dal piano, timer di recupero, storico, progressi e 1RM stimato. Sui fondamentali con bilanciere i kg si scrivono per lato.
- **Corsa**: le 20 settimane del piano maratona, da spuntare e registrare (km, minuti, passo, sensazioni).
- **Settimana**: palestra e corsa della settimana in corso, con quello che resta da fare.
- Funziona offline e si installa sul telefono (Condividi → Aggiungi alla schermata Home).

## Dati
I dati restano sul dispositivo. Con la sincronizzazione attiva vengono salvati anche in un Google Sheet personale (`apps-script/Code.gs`), con i fogli leggibili "Palestra" e "Corsa". Le istruzioni sono nell'app, in Impostazioni.

## File
- `index.html` — l'app
- `sw.js`, `manifest.webmanifest`, icone — installazione e uso offline
- `apps-script/Code.gs` — backend per Google Sheet
