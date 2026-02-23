import { useScrollReveal } from '../../hooks/useScrollReveal';
import './Privacy.css';

function PrivacyPolicy() {
  // Scroll reveal animations standardizzate
  useScrollReveal('.privacy .scroll-reveal-item', {
    threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5],
    rootMargin: '0px'
  });

  return (
    <main className="privacy">
      <header className="privacy__intro scroll-reveal-item scroll-reveal-hidden">
        <h1>Privacy Policy SGAMAPP</h1>
        <p className="privacy__last-update">
          <strong>Ultimo aggiornamento:</strong> Novembre 2025
        </p>
      </header>

      <section className="privacy__section scroll-reveal-item scroll-reveal-hidden">
        <h2>1. Titolare del trattamento</h2>
        <p>Il titolare del trattamento è <strong>SGAMAPP</strong>.</p>
        <p>
          Per qualsiasi richiesta o per l'esercizio dei diritti relativi alla privacy:
        </p>
        <p>
          <strong>Email:</strong>{' '}
          <a href="mailto:info.sgamapp@gmail.com" className="privacy__link">
            info.sgamapp@gmail.com
          </a>
        </p>
      </section>

      <section className="privacy__section scroll-reveal-item scroll-reveal-hidden">
        <h2>2. Finalità e principi del trattamento</h2>
        <p>
          SGAMAPP protegge i tuoi dati secondo i principi di minimizzazione, trasparenza, privacy by design e privacy by default, in conformità a GDPR (Regolamento UE 2016/679) e legge italiana (D.Lgs. 196/2003 come modificato dal D.Lgs. 101/2018).
        </p>
        <ul>
          <li>Non raccogliamo e non salviamo dati personali su server esterni o in cloud.</li>
          <li>Tutti i dati funzionali alle caratteristiche dell'app vengono processati e conservati solamente sul dispositivo dell'utente e per il tempo strettamente necessario.</li>
          <li>Nessun dato viene utilizzato per finalità di marketing, profilazione, pubblicità o ceduto a terzi.</li>
        </ul>
      </section>

      <section className="privacy__section scroll-reveal-item scroll-reveal-hidden">
        <h2>3. Tipologie di dati trattati</h2>
        
        <h3>3.1 Geolocalizzazione</h3>
        <p>
          Rilevata localmente solo per mostrare servizi pubblici vicini (ad es. uffici postali o ASL). La posizione viene elaborata solo in locale e mai trasmessa a server esterni; il consenso può essere revocato in qualsiasi momento dalle impostazioni.
        </p>

        <h3>3.2 Dati di utilizzo</h3>
        <p>
          Dati tecnici anonimi e aggregati (es. pagine visitate, durata sessione, errori tecnici) per analisi di performance e miglioramento servizi, senza dato riconducibile all'identità dell'utente.
        </p>

        <h3>3.3 Preferenze e impostazioni</h3>
        <p>
          Impostazioni come accessibilità, testo, layout, feedback aptico, salvate solo in locale sul dispositivo.
        </p>

        <h3>3.4 Notifiche (solo Android, opzionale)</h3>
        <p>
          Il servizio di analisi notifiche è attivo solo dopo consenso esplicito e può essere revocato in qualsiasi momento.
        </p>
        <p>
          L'app può leggere titolo, testo, app mittente e orario delle notifiche presenti per massimo 24 ore nell'area notifiche di SGAMAPP; non riceve mai allegati, credenziali, immagini o altri dati sensibili.
        </p>
        <p>
          Le notifiche vengono elaborate solo in locale e mai trasferite né trasmesse a server esterni o a terzi, e vengono eliminate in automatico dopo il periodo massimo previsto o subito su richiesta dell'utente.
        </p>
        <p>
          L'attivazione della funzione non è obbligatoria e non pregiudica l'uso dell'app.
        </p>

        <h3>3.5 Messaggi e Immagini tramite l'assistente</h3>
        <p>
          Quando invii input all'assistente o al servizio anti-frode, i dati vengono processati solo temporaneamente e non sono mai salvati permanentemente o comunicati all'esterno.
        </p>

        <h3>3.6 Dati di feedback/supporto</h3>
        <p>
          Eventuali richieste inviate tramite email sono utilizzate solo per gestione interna e non vengono cedute o trattate per altri scopi.
        </p>

        <h3>3.7 Dati che non vengono mai raccolti</h3>
        <ul>
          <li>Dati sensibili o biometrie</li>
          <li>Dati di pagamento</li>
          <li>Credenziali di servizi esterni (SPID, CIE, ecc.)</li>
        </ul>
      </section>

      <section className="privacy__section scroll-reveal-item scroll-reveal-hidden">
        <h2>4. Cookie e tecnologie simili</h2>
        <p>
          SGAMAPP utilizza cookie e tecnologie simili per garantire il corretto funzionamento del sito web e per migliorare la tua esperienza di navigazione, nel pieno rispetto della normativa europea (Direttiva ePrivacy 2002/58/CE e GDPR) e italiana (D.Lgs. 196/2003 come modificato dal D.Lgs. 101/2018).
        </p>

        <h3>4.1 Cosa sono i cookie</h3>
        <p>
          I cookie sono piccoli file di testo che vengono memorizzati sul tuo dispositivo (computer, tablet, smartphone) quando visiti un sito web. I cookie permettono al sito di ricordare le tue azioni e preferenze per un determinato periodo di tempo, così non devi reinserirle ogni volta che torni sul sito o navighi da una pagina all'altra.
        </p>

        <h3>4.2 Tipi di cookie utilizzati</h3>
        <p>
          SGAMAPP utilizza esclusivamente <strong>cookie tecnici</strong> necessari per il funzionamento del sito, per i quali non è richiesto il consenso secondo la normativa vigente:
        </p>
        <ul>
          <li>
            <strong>Cookie di sessione e autenticazione:</strong> Cookie HttpOnly, Secure e SameSite utilizzati esclusivamente per gestire la sessione di autenticazione degli amministratori. Questi cookie sono essenziali per garantire la sicurezza dell'accesso all'area amministrativa e vengono eliminati automaticamente alla chiusura della sessione o al logout.
          </li>
          <li>
            <strong>Cookie di consenso:</strong> Cookie tecnico che memorizza la tua scelta riguardo all'informativa sui cookie, per evitare di mostrarti nuovamente il banner ad ogni visita. Questo cookie ha una durata di 12 mesi.
          </li>
          <li>
            <strong>Cookie di preferenze:</strong> Cookie tecnici che memorizzano le tue preferenze di accessibilità e impostazioni dell'interfaccia (contrasto, dimensioni testo, sottolineatura link, ecc.) salvate localmente sul tuo dispositivo.
          </li>
        </ul>

        <h3>4.3 Caratteristiche tecniche dei cookie</h3>
        <p>
          I cookie utilizzati da SGAMAPP sono configurati con le seguenti caratteristiche di sicurezza:
        </p>
        <ul>
          <li>
            <strong>HttpOnly:</strong> I cookie di autenticazione sono configurati con il flag HttpOnly, che impedisce l'accesso ai cookie da parte di script JavaScript, proteggendoti da attacchi XSS (Cross-Site Scripting).
          </li>
          <li>
            <strong>Secure:</strong> I cookie vengono trasmessi esclusivamente su connessioni HTTPS crittografate, garantendo la sicurezza dei dati durante la trasmissione.
          </li>
          <li>
            <strong>SameSite:</strong> I cookie sono configurati con il flag SameSite=Lax, che limita l'invio dei cookie solo a richieste same-site, proteggendoti da attacchi CSRF (Cross-Site Request Forgery).
          </li>
        </ul>

        <h3>4.4 Finalità d'uso</h3>
        <p>
          I cookie utilizzati da SGAMAPP servono esclusivamente a:
        </p>
        <ul>
          <li>Garantire il corretto funzionamento del sito web</li>
          <li>Gestire l'autenticazione degli amministratori in modo sicuro</li>
          <li>Memorizzare le tue preferenze di accessibilità e impostazioni</li>
          <li>Ricordare la tua scelta riguardo all'informativa sui cookie</li>
        </ul>
        <p>
          <strong>SGAMAPP non utilizza cookie di profilazione, di marketing o di tracciamento.</strong> Non utilizziamo cookie di terze parti per finalità pubblicitarie o di analisi comportamentale.
        </p>

        <h3>4.5 Durata dei cookie</h3>
        <ul>
          <li>
            <strong>Cookie di sessione:</strong> Eliminati automaticamente alla chiusura del browser o al logout
          </li>
          <li>
            <strong>Cookie di consenso:</strong> Durata di 12 mesi dalla data di accettazione
          </li>
          <li>
            <strong>Cookie di preferenze:</strong> Conservati localmente fino alla disinstallazione dell'app o alla cancellazione manuale da parte dell'utente
          </li>
        </ul>

        <h3>4.6 Gestione dei cookie</h3>
        <p>
          Puoi gestire o eliminare i cookie in qualsiasi momento attraverso le impostazioni del tuo browser. Tuttavia, ti informiamo che la disabilitazione dei cookie tecnici potrebbe compromettere alcune funzionalità del sito, come l'accesso all'area amministrativa o il salvataggio delle tue preferenze.
        </p>
        <p>
          Per gestire i cookie nei principali browser:
        </p>
        <ul>
          <li><strong>Chrome:</strong> Impostazioni → Privacy e sicurezza → Cookie e altri dati dei siti</li>
          <li><strong>Firefox:</strong> Opzioni → Privacy e sicurezza → Cookie e dati dei siti</li>
          <li><strong>Safari:</strong> Preferenze → Privacy → Cookie e dati di siti web</li>
          <li><strong>Edge:</strong> Impostazioni → Privacy, ricerca e servizi → Cookie e autorizzazioni sito</li>
        </ul>

        <h3>4.7 Base giuridica</h3>
        <p>
          L'utilizzo di cookie tecnici necessari per il funzionamento del sito non richiede il consenso dell'utente, in quanto sono strettamente necessari per la fornitura del servizio richiesto (art. 122, comma 1, del D.Lgs. 196/2003 come modificato dal D.Lgs. 101/2018).
        </p>
        <p>
          Per i cookie di consenso, la base giuridica è il consenso dell'utente, che può essere revocato in qualsiasi momento.
        </p>

        <h3>4.8 Cookie di terze parti</h3>
        <p>
          SGAMAPP non utilizza cookie di terze parti per finalità di profilazione, marketing o tracciamento. Il sito può includere contenuti esterni (come font da Google Fonts) che potrebbero utilizzare cookie tecnici, ma questi non vengono utilizzati per finalità di tracciamento o profilazione.
        </p>

        <h3>4.9 Diritti dell'utente</h3>
        <p>
          In relazione ai cookie, hai sempre diritto di:
        </p>
        <ul>
          <li>Essere informato sull'utilizzo dei cookie (attraverso questa informativa)</li>
          <li>Gestire o eliminare i cookie attraverso le impostazioni del browser</li>
          <li>Revocare il consenso per i cookie non tecnici in qualsiasi momento</li>
          <li>Richiedere informazioni dettagliate sui cookie utilizzati scrivendo a <a href="mailto:info.sgamapp@gmail.com" className="privacy__link">info.sgamapp@gmail.com</a></li>
        </ul>

        <h3>4.10 Aggiornamenti</h3>
        <p>
          Questa sezione sui cookie può essere aggiornata periodicamente per riflettere eventuali modifiche nell'utilizzo dei cookie. Ti invitiamo a consultare periodicamente questa pagina per essere informato sulle ultime modifiche.
        </p>
      </section>

      <section className="privacy__section scroll-reveal-item scroll-reveal-hidden">
        <h2>5. Analisi notifiche: modalità tecniche e consenso</h2>
        <ul>
          <li>Il servizio viene attivato solo dopo consenso libero, specifico e informato tramite una richiesta esplicita dedicata.</li>
          <li>Il trattamento delle notifiche avviene esclusivamente in locale sul dispositivo attraverso un motore anti-frode.</li>
          <li>Nessuna notifica viene mai trasmessa o salvata su server di SGAMAPP né condivisa con terze parti.</li>
          <li>Il consenso può essere revocato in qualsiasi momento sia tramite l'app che dalle impostazioni di accessibilità del dispositivo, con cancellazione immediata delle notifiche eventualmente presenti.</li>
          <li>Il log della scelta di consenso viene registrato in locale per eventuali verifiche da parte delle Autorità.</li>
        </ul>
      </section>

      <section className="privacy__section scroll-reveal-item scroll-reveal-hidden">
        <h2>6. Basi giuridiche</h2>
        <p>Il trattamento avviene solo se ricorre almeno una di queste basi:</p>
        <ul>
          <li><strong>Consenso:</strong> notifiche, geolocalizzazione e funzioni opzionali</li>
          <li><strong>Contratto:</strong> per fornire i servizi richiesti tramite app</li>
          <li><strong>Obblighi di legge:</strong> adempimenti normativi e risposte ad Autorità</li>
        </ul>
      </section>

      <section className="privacy__section scroll-reveal-item scroll-reveal-hidden">
        <h2>7. Conservazione dati</h2>
        <ul>
          <li>Nessun dato personale raccolto dall'app viene salvato su server esterni.</li>
          <li>Le notifiche restano in memoria solo per un massimo di 24 ore e vengono eliminate automaticamente; è sempre possibile la cancellazione manuale.</li>
          <li>I dati tecnici aggregati per ottimizzazione restano in locale per massimo 12 mesi.</li>
          <li>Altri dati, come preferenze, sono conservati localmente fino alla disinstallazione dell'app o reset da parte dell'utente.</li>
        </ul>
      </section>

      <section className="privacy__section scroll-reveal-item scroll-reveal-hidden">
        <h2>8. Comunicazione e diffusione dati</h2>
        <ul>
          <li>Nessun dato personale viene comunicato o diffuso.</li>
          <li>L'eventuale utilizzo di fornitori tecnici (es. per hosting) avviene solo per servizi di supporto, previa nomina a responsabile del trattamento e senza accesso a dati personali.</li>
          <li>Nessun dato è ceduto a terzi a scopo commerciale o pubblicitario.</li>
        </ul>
      </section>

      <section className="privacy__section scroll-reveal-item scroll-reveal-hidden">
        <h2>9. Sicurezza</h2>
        <p>
          SGAMAPP implementa misure tecniche e organizzative per garantire l'integrità e la riservatezza dei dati, come crittografia dei dati locali, autenticazione, backup cifrati e monitoraggio delle vulnerabilità.
        </p>
        <p>
          In caso di violazione o incidente di sicurezza, saranno applicate tutte le procedure previste dal GDPR, inclusa la notifica al Garante se necessaria.
        </p>
      </section>

      <section className="privacy__section scroll-reveal-item scroll-reveal-hidden">
        <h2>10. Diritti dell'utente</h2>
        <p>Hai sempre diritto di:</p>
        <ul>
          <li>accedere ai tuoi dati,</li>
          <li>chiedere rettifica, limitazione, cancellazione, portabilità,</li>
          <li>opporti per motivi legittimi (anche a trattamenti automatizzati),</li>
          <li>revocare il consenso in qualsiasi momento,</li>
          <li>presentare reclamo al Garante Privacy.</li>
        </ul>
        <p>
          Per richieste scrivi a:{' '}
          <a href="mailto:info.sgamapp@gmail.com" className="privacy__link">
            info.sgamapp@gmail.com
          </a>
        </p>
      </section>

      <section className="privacy__section scroll-reveal-item scroll-reveal-hidden">
        <h2>11. Aggiornamenti e trasparenza</h2>
        <p>
          Eventuali modifiche sostanziali alla presente policy saranno comunicate tramite l'app e, se necessario, sarà chiesto un nuovo consenso.
        </p>
      </section>

      <section className="privacy__section scroll-reveal-item scroll-reveal-hidden">
        <h2>Permessi richiesti dall'app e controllo da parte dell'utente</h2>
        <ul>
          <li><strong>Geolocalizzazione:</strong> richiesta e revocabile in ogni momento</li>
          <li><strong>Notifiche (Android):</strong> opzionale, mai obbligatoria, disattivabile in qualunque momento</li>
          <li><strong>Galleria immagini:</strong> richiesta solo se usata la funzione specifica, mai obbligatoria</li>
        </ul>
      </section>

      <section className="privacy__section privacy__footer scroll-reveal-item scroll-reveal-hidden">
        <p className="privacy__disclaimer">
          Tutto ciò che non è qui previsto segue le disposizioni del Garante Privacy e del GDPR aggiornati al 2025.
        </p>
      </section>
    </main>
  );
}

export default PrivacyPolicy;
