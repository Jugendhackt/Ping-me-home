<!-- Beispiel-Komponente für die Nutzung des userRooms Store -->
<script lang="ts">
    import { userRooms } from '$lib/server/stores/userRooms';

    // Der Store ist automatisch reaktiv und aktualisiert sich in Echtzeit
    $: ({ rooms, loading, error } = $userRooms);

    function getRoleColor(role: string): string {
        switch (role) {
            case 'owner': return 'text-yellow-600 bg-yellow-100';
            case 'member': return 'text-green-600 bg-green-100';
            case 'invited': return 'text-blue-600 bg-blue-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    }

    function getRoleLabel(role: string): string {
        switch (role) {
            case 'owner': return 'Besitzer';
            case 'member': return 'Mitglied';
            case 'invited': return 'Eingeladen';
            default: return role;
        }
    }
</script>

<div class="user-rooms">
    <h2>Meine Räume</h2>

    {#if loading}
        <div class="loading">
            <p>Lade Räume...</p>
        </div>
    {:else if error}
        <div class="error">
            <p>Fehler beim Laden der Räume: {error}</p>
        </div>
    {:else if rooms.length === 0}
        <div class="empty">
            <p>Du bist noch in keinem Raum. Erstelle einen neuen Raum oder tritt einem bei!</p>
        </div>
    {:else}
        <div class="rooms-list">
            {#each rooms as room (room.roomId)}
                <div class="room-card">
                    <div class="room-info">
                        <h3 class="room-name">
                            <a href="/app/room/{room.roomId}">
                                {room.roomName || 'Unbenannter Raum'}
                            </a>
                        </h3>
                        <div class="room-meta">
                            <span class="role-badge {getRoleColor(room.role)}">
                                {getRoleLabel(room.role)}
                            </span>
                            <span class="room-id">ID: {room.roomId}</span>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>

<style>
    .user-rooms {
        padding: 1rem;
    }

    h2 {
        margin-bottom: 1rem;
        font-size: 1.5rem;
        font-weight: bold;
    }

    .loading, .error, .empty {
        padding: 2rem;
        text-align: center;
        border: 1px solid #e5e7eb;
        border-radius: 0.5rem;
        background-color: #f9fafb;
    }

    .error {
        background-color: #fef2f2;
        border-color: #fecaca;
        color: #dc2626;
    }

    .rooms-list {
        display: grid;
        gap: 1rem;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    }

    .room-card {
        border: 1px solid #e5e7eb;
        border-radius: 0.5rem;
        padding: 1rem;
        background-color: white;
        transition: box-shadow 0.2s;
    }

    .room-card:hover {
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .room-name a {
        color: #1f2937;
        text-decoration: none;
        font-weight: 600;
    }

    .room-name a:hover {
        color: #3b82f6;
        text-decoration: underline;
    }

    .room-meta {
        display: flex;
        gap: 0.5rem;
        align-items: center;
        margin-top: 0.5rem;
    }

    .role-badge {
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        font-size: 0.75rem;
        font-weight: 500;
    }

    .room-id {
        font-size: 0.75rem;
        color: #6b7280;
    }
</style>