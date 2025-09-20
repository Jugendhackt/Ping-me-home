<script lang="ts">
	import { goto } from '$app/navigation';
</script>

<svelte:head>
	<title>Info - SafeHome</title>
	<meta name="description" content="Informationen zur SafeHome App">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
</svelte:head>

<div class="info-container">
	<div class="info-card">
		<div class="header">
			<button class="back-btn" on:click={() => goto('/')} aria-label="Go back">
				←
			</button>
			<h1 class="title">Info</h1>
			<div class="spacer"></div>
		</div>

		<div class="info-content">
			<p>
				Willkommen bei <strong>SafeHome</strong>! Mit dieser App kannst du sicherstellen, dass deine Freunde nach einem Treffen gut nach Hause gekommen sind.
			</p>

			<h2>So funktioniert es:</h2>
			<ul>
				<li>Füge deine Freunde in der App hinzu.</li>
				<li>Nach einem Treffen kann jeder seinen Status als „gut angekommen“ bestätigen.</li>
				<li>Du bekommst eine übersichtliche Anzeige, wer bereits sicher zuhause ist.</li>
			</ul>

			<p>
				Die App speichert keine sensiblen Daten länger als nötig und schützt die Privatsphäre aller Nutzer.
			</p>
		</div>
	</div>
</div>

<style>
	.info-container {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 20px;
	}

	.info-card {
		background: white;
		border-radius: 16px;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
		width: 100%;
		max-width: 500px;
		overflow: hidden;
	}

	.header {
		display: flex;
		align-items: center;
		padding: 20px 24px 16px;
		background: #f8f9fa;
	}

	.back-btn {
		background: none;
		border: none;
		font-size: 24px;
		cursor: pointer;
		color: #6c757d;
		padding: 4px;
		border-radius: 4px;
		transition: background-color 0.2s;
	}

	.back-btn:hover {
		background-color: #e9ecef;
	}

	.title {
		font-size: 1.5rem;
		font-weight: 600;
		margin: 0;
		flex: 1;
		text-align: center;
		color: #333;
	}

	.spacer {
		width: 32px;
	}

	.info-content {
		padding: 24px;
		font-family: sans-serif;
		color: #333;
	}

	h2 {
		margin-top: 20px;
		margin-bottom: 10px;
		font-size: 1.2rem;
		color: #444;
	}

	ul {
		padding-left: 20px;
		margin-bottom: 16px;
	}

	li {
		margin-bottom: 8px;
	}

	@media (max-width: 480px) {
		.info-container {
			padding: 10px;
		}

		.header,
		.info-content {
			padding-left: 20px;
			padding-right: 20px;
		}

		.title {
			font-size: 1.3rem;
		}
	}
</style>
