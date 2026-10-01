# MATICA — Il viaggio dei numeri primi

App didattica HTML/CSS/JavaScript per GitHub Pages e LIM / smartphone. Titolarità dei materiali originali: Claudia Bartoli; i servizi e i componenti di terzi restano soggetti alle proprie condizioni.

## Pubblicazione
Carica **tutti i file e la cartella `assets` allo stesso livello indicato nello ZIP** nella radice di un repository. Attiva Settings → Pages → Deploy from a branch → main → /(root). L'avvio è `index.html`. Non serve compilazione. La connessione Internet serve per Three.js (CDN), video YouTube e risorsa Crivello esterna.

## Personalizzare i video
Apri `config.js`: inserisci ID YouTube di 11 caratteri o URL completi nei campi `video1`, `video2`, `video3`, `video5` (facoltativo), `video6`. `video4` contiene l'URL **https://youtu.be/huQlt7OHAg4** fornito per Eratostene. Nessun URL per video 1, 2, 3, 5 o 6 era identificabile nell'ultimo messaggio, quindi i relativi campi sono vuoti e vengono indicati chiaramente nell'app. Le scene rimangono esplorabili per consentire la verifica del prototipo.

## Percorso
1. Atrio numeri primi → videolezione definizione e teorema fondamentale.
2. Panorama numeri primi/composti: 19 hotspot (1 e primi/composti) e 5 quesiti, soglia 3/5.
3. Atrio Euclide → video infinità dei primi.
4. Panorama Euclide con quattro hotspot di approfondimento.
5. Atrio Arsinoe → video ricerca dei primi.
6. Panorama Eratostene con 4 hotspot; video fornito ed eventuale secondo video.
7. Crivello esistente via iframe, con possibilità di apertura in nuova scheda.
8. Atrio multipli/divisori → video.
9. Panorama multipli/divisori: 7 hotspot e 5 quesiti, soglia 3/5.
10. Test finale 15 quesiti random, soglia 9/15; attestato Base 9–10 / Buono 11–12 / Ottimo 13–14 / Eccellente 15. Le varianti originali sono in `app.js`.

## Nota immagini panoramiche
Gli sfondi delle stanze panoramiche sono **collage illustrativi 2:1** ricavati dalle due immagini disponibili nel progetto, adattati come texture su una sfera Three.js. Il movimento è interattivo a 360°; non si tratta però di vere fotografie equirettangolari né di ricostruzioni tridimensionali fisicamente accurate. Si possono sostituire in seguito nella cartella principale del repository (tutti i file allo stesso livello) con file equirettangolari autentici mantenendo gli stessi nomi. I fondali 2D alternativi sono variazioni grafiche delle immagini disponibili, non ricostruzioni storiche documentarie.

## Logica quiz
- Per i primi: 5 estrazioni tra 1 e 30, classificazione oppure scomposizione; corretta a prescindere dall'ordine dei fattori (`2x3x3`, `3×2×3`, `2*3*3`).
- Per multipli/divisori: estrazione di 5 problemi generati; correttezza verificata matematicamente.
- Finale: 15 quesiti da una banca variabile, 5 scomposizioni e 10 domande a scelta; una sola risposta valutata per domanda, spiegazione immediata. Attestato scaricabile via Stampa → Salva PDF del browser.

## Informativa e limiti
Il progetto non richiede account e non invia risultati al creatore. I contenuti YouTube, il CDN di Three.js e l'iframe del crivello possono attivare richieste di terze parti. La privacy inclusa nel menu descrive questa architettura; verificare eventuali necessità specifiche prima della pubblicazione su siti istituzionali. L'attestato non è una certificazione ufficiale.

Per informazioni: claudiabartoli77@libero.it


**Versione GitHub FLAT:** caricare tutti i file di questa cartella insieme nella root del repository, senza sottocartelle.
