<script lang="ts">
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D | null = null;

  // Array für die Punkte
  let points: { x: number; y: number; baseX: number; baseY: number }[] = [];

  // Raster-Einstellungen
  const spacing = 50; // Abstand zwischen Punkten
  const pointRadius = 4; // Größe der Punkte
  const influenceRadius = 150; // Radius, in dem Punkte vom Mauszeiger weichen

  // Mausposition
  let mouseX = -9999;
  let mouseY = -9999;

  onMount(() => {
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    // Canvasgröße an Bildschirm anpassen
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Mausbewegung tracken
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    // Punkte-Raster generieren
    generatePoints();

    // Animation starten
    animate();
  });

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    generatePoints();
  }

  function generatePoints() {
    points = [];
    for (let x = 0; x < window.innerWidth; x += spacing) {
      for (let y = 0; y < window.innerHeight; y += spacing) {
        points.push({ x, y, baseX: x, baseY: y });
      }
    }
  }

  function animate() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let p of points) {
      // Abstand Maus zu Punkt
      let dx = p.x - mouseX;
      let dy = p.y - mouseY;
      let dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < influenceRadius) {
        // Vektor normalisieren und Punkt vom Mauszeiger wegschieben
        let angle = Math.atan2(dy, dx);
        let force = (influenceRadius - dist) / influenceRadius;
        p.x = p.x + Math.cos(angle) * force * force * 10;
        p.y = p.y + Math.sin(angle) * force * force * 10;
      }else{
        p.x =p.x + ( (p.baseX - p.x) /100);
        p.y =p.y + ( (p.baseY - p.y) /100);
      }

      // Punkt zeichnen
      ctx.beginPath();
      ctx.arc(p.x, p.y, pointRadius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fill();
    }

    requestAnimationFrame(animate);
  }
</script>

<canvas bind:this={canvas}></canvas>

<style>
  :global(body) {
    margin: 0;
    height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    font-family: Arial, sans-serif;
    color: white;
  }

  canvas {
    position: fixed;
    top: 0;
    left: 0;
    z-index: -1;
  }

  .content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    text-align: center;
  }

  .card {
    background: rgba(255, 255, 255, 0.9);
    padding: 20px;
    border-radius: 15px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
    max-width: 400px;
  }

  h1 {
    margin-bottom: 10px;
  }
</style>

<div class="content">
  <div class="card">
    <h1>Willkommen</h1>
    <p>Dies ist eine Beispiel-Webseite in Svelte mit einem Blau-Lila Farbverlauf im Hintergrund.</p>
  </div>
</div>
