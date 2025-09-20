<script lang="ts">
    import type { PageData } from './$types';
    
    export let data: PageData;
    
    $: room = data.room;
    $: roomId = data.roomId;
    $: members = data.members;
    $: isOwner = data.isOwner;

    const copyJoinUrl = () => {
        const joinUrl = `${window.location.origin}/app/room/${roomId}/join`;
        navigator.clipboard.writeText(joinUrl);
    };

    const leaveRoom = () => {
        if (isOwner) {
            const confirmed = confirm("You are the owner of this room. Leaving will delete the room and remove all members. Are you sure you want to proceed?");
            if (!confirmed) {
                return;
            }
        }
        fetch(`/api/room/${roomId}/leave`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => {
            if (response.ok) {
                window.location.href = '/app/rooms';
            } else {
                alert('Failed to leave the room. Please try again.');
            }
        }).catch(error => {
            console.error('Error leaving room:', error);
            alert('An error occurred. Please try again.');
        });
    };
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
            {#if room.allowUrlJoining}
                <a aria-label="Copy join URL" class="copy-join-url-button" onclick={copyJoinUrl}>
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M120-220v-80h80v80h-80Zm0-140v-80h80v80h-80Zm0-140v-80h80v80h-80ZM260-80v-80h80v80h-80Zm100-160q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480Zm40 240v-80h80v80h-80Zm-200 0q-33 0-56.5-23.5T120-160h80v80Zm340 0v-80h80q0 33-23.5 56.5T540-80ZM120-640q0-33 23.5-56.5T200-720v80h-80Zm420 80Z"/></svg>
                </a>
            {/if}
        </div>
        <div class="info-item">
            <strong>Total Members:</strong> {members.length}
        </div>
    </div>
    
    <div class="members-section">
        <h2>Members</h2>
        <div class="members-list">
            {#each members as member}
                <details class="member-item">
                    <summary>
                        <span class="member-name">{member.displayName}{#if member.role === 'owner'}
                            <svg style="vertical-align: bottom; padding-left: 5px;" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="gold"><path d="M200-160v-80h560v80H200Zm0-140-51-321q-2 0-4.5.5t-4.5.5q-25 0-42.5-17.5T80-680q0-25 17.5-42.5T140-740q25 0 42.5 17.5T200-680q0 7-1.5 13t-3.5 11l125 56 125-171q-11-8-18-21t-7-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820q0 15-7 28t-18 21l125 171 125-56q-2-5-3.5-11t-1.5-13q0-25 17.5-42.5T820-740q25 0 42.5 17.5T880-680q0 25-17.5 42.5T820-620q-2 0-4.5-.5t-4.5-.5l-51 321H200Zm68-80h424l26-167-105 46-133-183-133 183-105-46 26 167Zm212 0Z"/></svg>
                        {/if}</span>
                        <span class="member-status status-{member.status}">{member.status}</span>
                    </summary>
                    (TODO: Show details about the user's status)
                </details>
            {/each}
        </div>
    </div>
    
    <div class="room-actions">
        <h2>Actions</h2>
        <button onclick={leaveRoom} class="leave-room-button">{@render doorIcon()}Leave Room</button>
    </div>
</div>

<style>
    .room-info {
        padding: 2rem;
        max-width: 800px;
        margin: 0 auto;
    }

    .room-details, .members-section, .room-actions {
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

    h1 {
        color: var(--text-primary);
        margin-bottom: 1rem;
    }

    h2 {
        color: var(--text-secondary);
        margin-bottom: 1rem;
        font-size: 1.25rem;
    }

    .room-actions button {
        display: block;
        padding: 0.5rem;
        margin: 0 auto;
        border-radius: 10px;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
    }

    .leave-room-button {
        background-color: #f44336;
        color: white;
    }
</style>

{#snippet doorIcon()}
<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M120-120v-80h80v-560q0-33 23.5-56.5T280-840h400q33 0 56.5 23.5T760-760v560h80v80H120Zm160-80h400v-560H280v560Zm120-240q17 0 28.5-11.5T440-480q0-17-11.5-28.5T400-520q-17 0-28.5 11.5T360-480q0 17 11.5 28.5T400-440ZM280-760v560-560Z"/></svg>
{/snippet}