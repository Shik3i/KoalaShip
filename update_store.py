import re

file_path = 'src/lib/store.svelte.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add imports
import_str = "import { i18nState } from './i18n.svelte';\nimport { getLocalizedProducts, getLocalizedTrackingEvents } from './catalog';\n"
content = import_str + content

# 2. Replace products array
products_pattern = re.compile(r'export const products = \$state<Product\[\]>\(\[.*?\]\);', re.DOTALL)
content = products_pattern.sub('export const products = $derived(getLocalizedProducts(i18nState.locale));', content)

# 3. Replace tracking update loops
# Replace Phase 1
phase1_old = '''const trackingUpdates = [
            "Auftragsdaten elektronisch an KoalaShip übermittelt.",
            "Sendung in der Vorbereitung beim Absender.",
            "Paket im Start-Paketzentrum sortiert.",
            "Paket ist abholbereit für den Transport."
        ];'''
phase1_new = 'const trackingUpdates = getLocalizedTrackingEvents(i18nState.locale).phase1;'
content = content.replace(phase1_old, phase1_new)

# Replace start tracking
start_old = '''const startUpdates = [
            "Bestellung eingegangen. Koalas wachen auf.",
            "Auftragsdaten an Logistikzentrum übermittelt.",
            "Bestellung bestätigt, Versand wird vorbereitet."
        ];'''
start_new = 'const startUpdates = getLocalizedTrackingEvents(i18nState.locale).start;'
content = content.replace(start_old, start_new)

# Replace Phase 2
phase2_old = '''const transitUpdates = [
                "Sendung hat das Start-Versandzentrum verlassen.",
                "Zwischenstopp im Verteilnetzwerk passiert.",
                "Fahrzeug für den Weitertransport wurde beladen.",
                "Zustellfenster wurde berechnet und Route leicht optimiert."
            ];'''
phase2_new = 'const transitUpdates = getLocalizedTrackingEvents(i18nState.locale).phase2;'
content = content.replace(phase2_old, phase2_new)

# Replace manual refresh funny and boring events
manual_old = '''const funnyEvents = [
        "Tracking-Server manuell aufgeweckt. Paket schläft noch.",
        "System-Check: Das Paket befindet sich definitiv irgendwo auf der Erde.",
        "Fahrer wurde per Funk angefunkt. Hat genervt aufgelegt.",
        "Scanmeldung manuell angefordert. Computer sagt 'Nein'.",
        "Logistik-Update: Alles beim Alten, aber danke der Nachfrage.",
        "Wir haben den Karton geschüttelt. Klappert noch.",
        "Fahrer überdenkt gerade seine Lebensentscheidungen im Stau.",
        "Paket gescannt. Scanner hat fröhlich gepiept."
    ];

    const boringEvents = [
        "Keine neuen Scan-Ereignisse im System gefunden.",
        "Letzter bekannter Status durch Server bestätigt.",
        "Verbindung zum Frachtzentrum erfolgreich. Keine neuen Daten.",
        "Manueller Refresh: Keine Statusänderung verzeichnet.",
        "Weiterhin im regulären Transportprozess.",
        "Logistikzentrum meldet normalen Betrieb."
    ];'''
manual_new = '''const events = getLocalizedTrackingEvents(i18nState.locale);
    const funnyEvents = events.funny;
    const boringEvents = events.boring;'''
content = content.replace(manual_old, manual_new)

# Replace manual refresh wait text
refresh_wait_old = "'Immer noch keine neue Scanmeldung. Geduld ist eine Tugend.'"
refresh_wait_new = "getLocalizedTrackingEvents(i18nState.locale).refreshWait"
content = content.replace(refresh_wait_old, refresh_wait_new)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Store updated successfully')
