<script lang="ts">
    import type { PageData } from './$types';
    
    export let data: PageData;
    
    $: room = data.room;
    $: roomId = data.roomId;
    $: members = data.members;
</script>

<div class="room-info">
    <h1>{room.name}</h1>
    
    <div class="room-details">
        <h2>Room Information</h2>
        <div class="info-item">
            <strong>Room ID:</strong> {roomId}
        </div>
        <div class="info-item">
            <strong>URL Joining Allowed:</strong> {room.allowUrlJoining ? 'Yes' : 'No'}
        </div>
        <div class="info-item">
            <strong>Total Members:</strong> {members.length}
        </div>
    </div>
    
    <div class="members-section">
        <h2>Members</h2>
        <div class="members-list">
            {#each members as member}
                <div class="member-item">
                    <span class="member-name">{member.displayName}</span>
                    <span class="member-role role-{member.role}">{member.role}</span>
                </div>
            {/each}
        </div>
    </div>
    
    <div class="raw-data">
        <h2>Raw Room Data</h2>
        <pre>{JSON.stringify(room, null, 2)}</pre>
    </div>
</div>

<style>
    .room-info {
        padding: 2rem;
        max-width: 800px;
        margin: 0 auto;
    }

    .room-details, .members-section, .raw-data {
        margin-bottom: 2rem;
        padding: 1rem;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        background: var(--bg-secondary);
    }

    .info-item {
        margin-bottom: 0.5rem;
    }

    .members-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .member-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem;
        background: var(--bg-primary);
        border-radius: 4px;
        border: 1px solid var(--border-color);
    }

    .member-uid {
        font-family: monospace;
        color: var(--text-muted);
    }

    .member-role {
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.875rem;
        font-weight: bold;
        text-transform: uppercase;
    }

    .role-owner {
        background: var(--warning-color);
        color: var(--text-primary);
    }

    .role-member {
        background: var(--success-color);
        color: var(--bg-primary);
    }

    .role-invited {
        background: var(--accent-color);
        color: var(--bg-primary);
    }

    pre {
        background: var(--bg-tertiary);
        padding: 1rem;
        border-radius: 4px;
        overflow-x: auto;
        font-family: 'Courier New', monospace;
        font-size: 0.875rem;
        color: var(--text-primary);
    }

    h1 {
        color: var(--text-primary);
        margin-bottom: 1rem;
    }

    h2 {
        color: var(--text-secondary);
        margin-bottom: 1rem;
        font-size: 1.25rem;
    }
</style>
