<script lang="ts">
  import { onMount } from 'svelte';

  // Eingabewert für Adresse oder Koordinaten
  // Zweck: Bindet das Textfeld an diese Variable, damit der Benutzer etwas eingeben kann
  let addressInput = '';

  // Variablen für die gespeicherten Koordinaten
  // Zweck: Speichert die Latitude und Longitude für spätere Nutzung oder Anzeige
  let latitude: number | null = null;
  let longitude: number | null = null;

  // Statusnachrichten für Erfolg oder Fehler
  // Zweck: Zeigt dem Benutzer Meldungen wie 'Koordinaten übernommen' oder Fehler an
  let message = '';

  // Prüfen, ob lokale Koordinaten bereits im localStorage gespeichert sind
  // Zweck: Lädt die letzten Koordinaten beim Laden der Seite automatisch
  onMount(() => {
    const saved = localStorage.getItem('spawnCoords');
    if (saved) {
      const coords = JSON.parse(saved);
      latitude = coords.lat;
      longitude = coords.lng;
    }
  });

  // Validierungsfunktion für Koordinaten
  // Zweck: Sicherstellen, dass Latitude und Longitude innerhalb gültiger Werte liegen
  function validateCoords(lat: number, lng: number) {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }

  // Funktion, um Adresse oder Koordinaten zu übernehmen
  // Zweck: Verarbeitet die Eingabe und speichert gültige Koordinaten im localStorage
  async function useAddress(addr: string) {
    if (!addr.trim()) {            //was macht addr trim?                                                         
      message = 'Bitte eine Adresse oder Koordinaten eingeben.';
      return;
    }

    // Prüfen, ob Eingabe direkt Koordinaten sind (Format: lat,lng)
    // Zweck: Ermöglicht Eingabe von direkten Koordinaten statt Adresse
    const coordMatch = addr.trim().match(/^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);  // woher kommen die variablen?
      const lng = parseFloat(coordMatch[3]);

      if (!validateCoords(lat, lng)) {
        message = 'Ungültige Koordinaten. Latitude -90..90, Longitude -180..180.';
        return;
      }

      // Koordinaten speichern und Nachricht ausgeben
      latitude = lat;
      longitude = lng;
      localStorage.setItem('spawnCoords', JSON.stringify({ lat, lng }));
      message = `Koordinaten übernommen: ${latitude}, ${longitude}`;
      return;
    }

    // Adresse geocoden via OpenStreetMap Nominatim API
    // Zweck: Wandelt eine Adresse in Latitude und Longitude um
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addr)}`);
      const data = await response.json();

      if (!data.length) {
        message = 'Adresse konnte nicht gefunden werden.';
        return;
      }

      // Koordinaten aus der API-Antwort extrahieren
      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);

      if (!validateCoords(lat, lng)) {
        message = 'Koordinaten der Adresse ungültig.';
        return;
      }

      // Koordinaten speichern und Nachricht ausgeben
      latitude = lat;
      longitude = lng;
      localStorage.setItem('spawnCoords', JSON.stringify({ lat, lng }));
      message = `Adresse konvertiert: ${latitude}, ${longitude}`;

    } catch (err) {
      console.error(err);
      message = 'Fehler bei der Geocodierung.';
    }
  }

  // Funktion für die aktuelle Position via Geolocation API
  // Zweck: Holt die aktuelle GPS-Position des Benutzers und speichert sie
  function useCurrentPosition() {
    if (!navigator.geolocation) {
      message = 'Geolocation wird von diesem Browser nicht unterstützt.';
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        if (!validateCoords(lat, lng)) {
          message = 'Ungültige aktuelle Position.';
          return;
        }

        // Koordinaten speichern und Nachricht ausgeben
        latitude = lat;
        longitude = lng;
        localStorage.setItem('spawnCoords', JSON.stringify({ lat, lng }));
        message = `Aktuelle Position übernommen: ${latitude}, ${longitude}`;
      },
      (err) => {
        console.error(err);
        message = 'Konnte aktuelle Position nicht abrufen.';
      }
    );
  }
</script>

<div class="profile-section">
  <div class="section-header">
    <h2>Adresse / Koordinaten</h2>
    <p>Trage eine Adresse ein oder direkt Koordinaten (lat,lng)</p>
  </div>

  <div class="profile-form">
    <!-- Eingabefeld für Adresse oder Koordinaten -->
    <!-- Zweck: Ermöglicht dem Benutzer die Eingabe von Adresse oder Koordinaten -->
    <div class="form-group">
      <label for="address">Adresse oder Koordinaten</label>
      <input
        id="address"
        type="text"
        bind:value={addressInput}
        placeholder="z.B. Musterstraße 1, Berlin oder 52.5200,13.4050"
      />
      <small class="help-text">Wenn du eine Adresse eingibst, wird sie automatisch in Koordinaten umgewandelt.</small>
    </div>

    <!-- Buttons für Adresse übernehmen oder aktuelle Position -->
    <!-- Zweck: Löst die jeweiligen Funktionen aus, um Koordinaten zu speichern -->
    <div class="form-group" style="display:flex; gap:0.5rem; flex-wrap: wrap;">
      <button type="button" class="update-btn" on:click={() => useAddress(addressInput)}>
        Adresse übernehmen
      </button>

      <button type="button" class="update-btn" on:click={useCurrentPosition}>
        Aktuelle Position benutzen
      </button>
    </div>

    <!-- Anzeige der aktuellen Koordinaten, wenn vorhanden -->
    <!-- Zweck: Zeigt dem Benutzer die aktuell gespeicherten Koordinaten an -->
    {#if latitude !== null && longitude !== null}
      <div style="margin-top:0.5rem; font-size:0.9rem;">
        <strong>Aktuelle Koordinaten:</strong> {latitude}, {longitude}
      </div>
    {/if}

    <!-- Statusnachrichten -->
    <!-- Zweck: Zeigt Erfolg oder Fehlermeldungen in konsistentem Design -->
    {#if message}
      <div class="success-message" style="margin-top:0.5rem;">{message}</div>
    {/if}
  </div>
</div>
