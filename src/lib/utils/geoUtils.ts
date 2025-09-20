export interface Coordinates {
  lat: number;
  lng: number;
}

export class CoordinateService {
  /**
   * Gespeicherte Koordinaten aus localStorage abrufen
   * @param key Name/Schlüssel der Koordinaten, default: 'spawnCoords'
   * @returns {Coordinates | null}
   * Anwendung:
   * const homeCoords = CoordinateService.getSavedCoordinates('home');
   * if (homeCoords) console.log(homeCoords.lat, homeCoords.lng);
   */
  static getSavedCoordinates(key: string = 'spawnCoords'): Coordinates | null {
    const saved = localStorage.getItem(key);
    if (!saved) return null;
    try {
      const coords = JSON.parse(saved);
      if (coords.lat !== undefined && coords.lng !== undefined) {
        return { lat: coords.lat, lng: coords.lng };
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Koordinaten im localStorage speichern
   * @param coords - Koordinatenobjekt {lat, lng}
   * @param key Name/Schlüssel der Koordinaten, default: 'spawnCoords'
   * Anwendung:
   * CoordinateService.saveCoordinates({ lat: 52.52, lng: 13.405 }, 'office');
   */
  static saveCoordinates(coords: Coordinates, key: string = 'spawnCoords') {
    localStorage.setItem(key, JSON.stringify(coords));
  }

  /**
   * 3️⃣ Koordinaten validieren
   * @param lat - Latitude
   * @param lng - Longitude
   * @returns true wenn gültig, sonst false
   * Anwendung:
   * if (CoordinateService.validateCoordinates(52.52, 13.405)) console.log("Gültig");
   */
  static validateCoordinates(lat: number, lng: number): boolean {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }

  /**
   * 4️⃣ Adresse in Koordinaten umwandeln (Geocoding)
   * @param addr - Eingabeadresse oder "lat,lng"
   * @returns {Promise<Coordinates|null>} - Koordinaten oder null, wenn ungültig
   * Anwendung:
   * const coords = await CoordinateService.addressToCoordinates("Berlin Alexanderplatz");
   * if (coords) console.log(coords.lat, coords.lng);
   */
  static async addressToCoordinates(addr: string): Promise<Coordinates | null> {
    if (!addr.trim()) return null;

    // Prüfen, ob Eingabe direkt als lat,lng vorliegt
    const coordMatch = addr.trim().match(/^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[3]);
      if (!this.validateCoordinates(lat, lng)) return null;
      return { lat, lng };
    }

    // Geocoding via OpenStreetMap Nominatim
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addr)}`
      );
      const data = await response.json();
      if (!data.length) return null;

      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);
      if (!this.validateCoordinates(lat, lng)) return null;

      return { lat, lng };
    } catch {
      return null;
    }
  }

  /**
   * 5️⃣ Aktuelle Position abrufen
   * @returns {Promise<Coordinates|null>} - Koordinaten des Benutzers oder null
   * Anwendung:
   * const coords = await CoordinateService.getCurrentPosition();
   * if (coords) console.log(coords.lat, coords.lng);
   */
  static getCurrentPosition(): Promise<Coordinates | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) return resolve(null);

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          if (!this.validateCoordinates(lat, lng)) return resolve(null);
          resolve({ lat, lng });
        },
        () => resolve(null)
      );
    });
  }

  /**
   * 6️⃣ Alles kombinieren: Adresse oder Koordinaten eingeben und speichern
   * @param input - Adresse oder "lat,lng"
   * @returns {Promise<{coords: Coordinates|null, message: string}>} - Ergebnisobjekt mit message
   * Anwendung:
   * const result = await CoordinateService.setCoordinatesFromInput("Berlin Alexanderplatz");
   * if (result.coords) {
   *   console.log(result.coords.lat, result.coords.lng);
   *   console.log(result.message);
   * }
   */
  static async setCoordinatesFromInput(input: string): Promise<{ coords: Coordinates | null; message: string }> {
    let message = '';
    let coords: Coordinates | null = null;

    if (!input.trim()) {
      message = 'Bitte eine Adresse oder Koordinaten eingeben.';
      return { coords: null, message };
    }

    coords = await this.addressToCoordinates(input);
    if (coords) {
      this.saveCoordinates(coords);
      message = `Koordinaten übernommen: ${coords.lat}, ${coords.lng}`;
      return { coords, message };
    }

    message = 'Adresse konnte nicht gefunden werden oder ist ungültig.';
    return { coords: null, message };
  }
}
