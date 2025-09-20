<!--<script lang="ts">
  import { onMount } from 'svelte';

  let addressInput = '';
  let latitude: number | null = null;
  let longitude: number | null = null;
  let message = '';

  onMount(() => {
    const saved = localStorage.getItem('spawnCoords');
    if (saved) {
      const coords = JSON.parse(saved);
      latitude = coords.lat;
      longitude = coords.lng;
    }
  });

  function validateCoords(lat: number, lng: number) {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }

  async function useAddress(addr: string) {
    if (!addr.trim()) {
      message = 'Bitte eine Adresse oder Koordinaten eingeben.';
      return;
    }

    const coordMatch = addr.trim().match(/^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[3]);

      if (!validateCoords(lat, lng)) {
        message = 'Ungültige Koordinaten. Latitude -90..90, Longitude -180..180.';
        return;
      }

      latitude = lat;
      longitude = lng;
      localStorage.setItem('spawnCoords', JSON.stringify({ lat, lng }));
      message = `Koordinaten übernommen: ${latitude}, ${longitude}`;
      return;
    }

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addr)}`);
      const data = await response.json();

      if (!data.length) {
        message = 'Adresse konnte nicht gefunden werden.';
        return;
      }

      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);

      if (!validateCoords(lat, lng)) {
        message = 'Koordinaten der Adresse ungültig.';
        return;
      }

      latitude = lat;
      longitude = lng;
      localStorage.setItem('spawnCoords', JSON.stringify({ lat, lng }));
      message = `Adresse konvertiert: ${latitude}, ${longitude}`;

    } catch (err) {
      console.error(err);
      message = 'Fehler bei der Geocodierung.';
    }
  }

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

<div class="profile-section address-section">
  <div class="section-header">
    <h2>Adresse / Koordinaten</h2>
    <p>Trage eine Adresse ein oder direkt Koordinaten (lat,lng)</p>
  </div>

  <div class="profile-form">
    <div class="form-group">
      <label for="address">Adresse oder Koordinaten</label>
      <input id="address" type="text" bind:value={addressInput} placeholder="z.B. Musterstraße 1, Berlin oder 52.5200,13.4050" />
      <small class="help-text">Wenn du eine Adresse eingibst, wird sie automatisch in Koordinaten umgewandelt.</small>
    </div>

    <div class="form-group button-group">
      <button type="button" class="update-btn" on:click={() => useAddress(addressInput)}>Adresse übernehmen</button>
      <button type="button" class="update-btn" on:click={useCurrentPosition}>Aktuelle Position benutzen</button>
    </div>

    {#if latitude !== null && longitude !== null}
      <div class="coord-display">Aktuelle Koordinaten: {latitude}, {longitude}</div>
    {/if}

    {#if message}
      <div class="success-message">{message}</div>
    {/if}
  </div>
</div>

<style>
.address-section {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.address-section .section-header h2 {
  color: var(--text-primary);
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.address-section .section-header p {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin: 0;
}

.address-section .profile-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.address-section .form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.address-section .form-group input {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: border-color 0.2s ease;
}

.address-section .form-group input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.address-section .button-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.address-section .update-btn {
  background: var(--accent-color);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.address-section .update-btn:hover {
  background: var(--accent-hover);
}

.address-section .coord-display {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-primary);
}

.address-section .success-message {
  margin-top: 0.5rem;
}
</style> -->