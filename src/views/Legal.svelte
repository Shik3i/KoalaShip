<script lang="ts">
  import { i18nState, setLocale } from '../lib/i18n.svelte';
  import { navigateTo } from '../lib/router.svelte';

  let { page }: { page: 'IMPRINT' | 'PRIVACY' } = $props();
  let language = $derived(i18nState.locale === 'DE' ? 'DE' : 'EN');
</script>

<div class="mx-auto max-w-4xl space-y-6">
  <div class="flex flex-wrap items-center justify-between gap-4">
    <button onclick={() => history.length > 1 ? history.back() : navigateTo('ONBOARDING')} class="rounded-xl bg-slate-200 px-4 py-2 font-bold dark:bg-slate-700">
      ← {language === 'DE' ? 'Zurück' : 'Back'}
    </button>
    <div class="flex rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800">
      <button onclick={() => setLocale('DE')} class="rounded-lg px-4 py-2 font-bold {language === 'DE' ? 'bg-indigo-600 text-white' : ''}"><span class="country-flag">🇩🇪</span> DE</button>
      <button onclick={() => setLocale('EN')} class="rounded-lg px-4 py-2 font-bold {language === 'EN' ? 'bg-indigo-600 text-white' : ''}"><span class="country-flag">🇬🇧</span> EN</button>
    </div>
  </div>

  <article class="legal-copy rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-10">
    {#if page === 'IMPRINT' && language === 'DE'}
      <h1>Impressum</h1>
      <p><strong>Stand:</strong> 12. Juni 2026</p>
      <h2>Betreiber und Kontakt</h2>
      <p>Timo (KoalaDev) – Privatperson<br />Deutschland<br />E-Mail: <a href="mailto:admin@koalastuff.net">admin@koalastuff.net</a><br />Mastodon: <a href="https://mastodon.social/@koalastuff" target="_blank" rel="me noopener">@koalastuff</a></p>
      <h2>Hinweis auf privates Projekt</h2>
      <p>Diese Website ist ein rein privates, nicht-kommerzielles Hobbyprojekt. Die Betreiberangaben werden freiwillig zur Transparenz gegenüber der Community bereitgestellt.</p>
      <h2>Verantwortlich für den Inhalt</h2>
      <p>Timo (KoalaDev)<br />Deutschland</p>
      <h2>Hinweis zum Angebot</h2>
      <p>KoalaShip ist eine spielerische Simulation. KoalaCoins, Gehälter, Produkte und Bestellungen sind fiktiv. Es werden keine echten Kaufverträge geschlossen und keine realen Zahlungen verarbeitet.</p>
      <h2>Haftung für externe Links</h2>
      <p>Für Inhalte externer Dienste und Websites sind deren jeweilige Betreiber verantwortlich. Zum Zeitpunkt der Verlinkung waren keine Rechtsverstöße erkennbar.</p>
      <h2>Urheberrecht</h2>
      <p>Die vom Betreiber erstellten Inhalte unterliegen dem deutschen Urheberrecht. Rechte an eingebundenen Open-Source-Komponenten verbleiben bei deren jeweiligen Urhebern und gelten nach ihren Lizenzbedingungen.</p>
    {:else if page === 'IMPRINT'}
      <h1>Legal Notice</h1>
      <p><strong>Last updated:</strong> June 12, 2026</p>
      <h2>Operator and contact</h2>
      <p>Timo (KoalaDev) – private individual<br />Germany<br />Email: <a href="mailto:admin@koalastuff.net">admin@koalastuff.net</a><br />Mastodon: <a href="https://mastodon.social/@koalastuff" target="_blank" rel="me noopener">@koalastuff</a></p>
      <h2>Private project notice</h2>
      <p>This website is a private, non-commercial hobby project. Operator details are provided voluntarily for transparency toward the community.</p>
      <h2>About this service</h2>
      <p>KoalaShip is a playful simulation. KoalaCoins, salaries, products and orders are fictional. No real purchase contracts are concluded and no real payments are processed.</p>
      <h2>External links</h2>
      <p>The respective providers are responsible for external services and websites linked from this application.</p>
      <h2>Copyright</h2>
      <p>Content created by the operator is subject to German copyright law. Rights to included open-source components remain with their respective authors and are governed by their licenses.</p>
    {:else if language === 'DE'}
      <h1>Datenschutzerklärung</h1>
      <p><strong>Stand:</strong> 12. Juni 2026</p>
      <h2>1. Verantwortlicher</h2>
      <p>Timo (KoalaDev) – Privatperson<br />Deutschland<br />E-Mail: <a href="mailto:admin@koalastuff.net">admin@koalastuff.net</a></p>
      <h2>2. Grundprinzip</h2>
      <p>KoalaShip ist eine clientseitige Simulation. Profil, Spielstand, Bestellungen, Wunschliste, Einstellungen und Fortschritt werden im lokalen Speicher des Browsers (<code>localStorage</code>) gespeichert. Diese Daten werden durch die Anwendung nicht an einen eigenen KoalaShip-Server übertragen.</p>
      <h2>3. Hosting und Server-Logdateien</h2>
      <p>Diese Seite wird auf einem privaten VPS gehostet. Standard-Serverlogs können angefragte URL, Zeitpunkt, IP-Adresse und User-Agent zur Betriebssicherheit und Fehlerdiagnose enthalten. Sie werden nicht für Tracking verwendet und nach 7 Tagen automatisch gelöscht. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO.</p>
      <h2>4. Karten und Routen</h2>
      <p>Für Kartenansichten werden Kartenkacheln von CARTO/OpenStreetMap und für Routen die öffentliche OSRM-Instanz verwendet. Der Browser ruft diese Dienste über einen gleich-originären Reverse Proxy auf. Dadurch wird die IP-Adresse des Besuchers nicht direkt an CARTO oder OSRM übertragen.</p>
      <p>Bei der Standortauswahl muss nicht die echte Wohnadresse oder der tatsächliche Aufenthaltsort gewählt werden. Für die Simulation kann ein beliebiger Kartenpunkt verwendet werden. Der ausgewählte Zielpunkt sowie der daraus erzeugte Startpunkt werden lokal im Browser gespeichert. Wenn eine Route berechnet wird, werden diese ausgewählten Start- und Zielkoordinaten über den KoalaShip-Proxy an OSRM übertragen. KoalaShip speichert die berechnete Route nicht dauerhaft auf dem Server.</p>
      <h2>5. Lokaler Speicher</h2>
      <p>Der lokale Speicher ist für Spielstand, Sprache, Theme und Soundeinstellung technisch erforderlich. Es findet dadurch kein geräteübergreifendes Tracking statt. Die Daten können über die Reset-Funktion oder durch Löschen der Website-Daten im Browser entfernt werden.</p>
      <h2>6. Keine echten Zahlungs- oder Bestelldaten</h2>
      <p>KoalaShip verarbeitet keine Zahlungsdaten. Es ist nicht erforderlich, eine echte Adresse anzugeben; die Simulation arbeitet ausschließlich mit dem frei gewählten Kartenpunkt. Bitte keine vertraulichen realen Angaben in freie Profilfelder eintragen.</p>
      <h2>7. Betroffenenrechte</h2>
      <p>Sie haben nach Maßgabe der DSGVO insbesondere Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit, Widerspruch und Beschwerde bei einer Datenschutzaufsichtsbehörde. Lokal gespeicherte Daten können unmittelbar im Browser gelöscht werden.</p>
      <h2>8. Änderungen</h2>
      <p>Diese Erklärung wird angepasst, wenn sich Funktionen, Anbieter oder rechtliche Anforderungen ändern.</p>
    {:else}
      <h1>Privacy Policy</h1>
      <p><strong>Last updated:</strong> June 12, 2026</p>
      <h2>1. Controller</h2>
      <p>Timo (KoalaDev) – private individual<br />Germany<br />Email: <a href="mailto:admin@koalastuff.net">admin@koalastuff.net</a></p>
      <h2>2. General principle</h2>
      <p>KoalaShip is a client-side simulation. Your profile, game state, orders, wishlist, preferences and progress are stored in your browser's <code>localStorage</code>. The application does not transmit this information to a dedicated KoalaShip server.</p>
      <h2>3. Hosting and server logs</h2>
      <p>This website is hosted on a private VPS. Standard server logs may contain the requested URL, request time, IP address and user agent for operational security and troubleshooting. They are not used for tracking and are automatically deleted after 7 days. The applicable basis is legitimate interests under Article 6(1)(f) GDPR.</p>
      <h2>4. Maps and routing</h2>
      <p>Map views use tiles from CARTO/OpenStreetMap and routes from the public OSRM service. The browser accesses these services through a same-origin reverse proxy, so the visitor's IP address is not disclosed directly to CARTO or OSRM.</p>
      <p>You do not need to select your real home address or actual location. Any map point may be used for the simulation. The selected destination and the generated starting point are stored locally in your browser. When a route is calculated, these selected start and destination coordinates are transmitted to OSRM through the KoalaShip proxy. KoalaShip does not permanently store the calculated route on its server.</p>
      <h2>5. Local storage</h2>
      <p>Local storage is required for game progress, language, theme and sound settings. It is not used for cross-device tracking. You can remove the information through the reset function or your browser's site-data controls.</p>
      <h2>6. No real payments or orders</h2>
      <p>KoalaShip does not process payment information. You are not required to provide a real address; the simulation only uses the freely selected map point. Do not enter confidential real-world information in free-text profile fields.</p>
      <h2>7. Your rights</h2>
      <p>Subject to the GDPR, you may have rights of access, rectification, erasure, restriction, portability, objection and complaint to a supervisory authority. Locally stored information can be deleted directly in your browser.</p>
      <h2>8. Changes</h2>
      <p>This policy may be updated when features, providers or legal requirements change.</p>
    {/if}
  </article>
</div>
