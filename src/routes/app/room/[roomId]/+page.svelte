<script lang="ts">
	import { copyIcon, crownIcon, deleteIcon, doorIcon, houseIcon, kickIcon } from '$lib/components/Icons.svelte';
    import ProfileAvatar from '$lib/components/ProfileAvatar.svelte';
    import type { PageData } from './$types';
    
    export let data: PageData;
    
    $: room = data.room;
    $: roomId = data.roomId;
    $: members = data.members;
    $: isOwner = data.isOwner;
    $: user = data.user;

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

    const deleteRoom = () => {
        const confirmed = confirm('Do you really want to delete the room?');
        if (!confirmed) {
            return;
        }
        fetch(`/api/room/${roomId}/delete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => {
            if (response.ok) {
                window.location.href = '/app/rooms';
            } else {
                alert('Failed to delete the room. Please try again.');
            }
        }).catch(error => {
            console.error('Error deleting room:', error);
            alert('An error occurred. Please try again.');
        });
    }

    const kick = (member: {
        uid: string,
        displayName: string,
    }) => {
        if (confirm(`Do you really want to kick ${member.displayName}?`)) {
            fetch(`/api/room/${roomId}/kick`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userToKick: member.uid })
            }).then(response => {
                if (response.ok) {
                    // Remove the kicked member from the UI
                    members = members.filter((m: { uid: string }) => m.uid !== member.uid);
                } else {
                    alert('Failed to kick member. Please try again.');
                }
            }).catch(error => {
                console.error('Error kicking member:', error);
                alert('An error occurred. Please try again.');
            });
        }
    };

    const setArrived = (arrived: boolean) => {
        fetch(`/api/room/${roomId}/update-arrived`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ arrived: arrived })
        }).then(response => {
            if (response.ok) {
                // Update the member's arrived status in the UI
                members = members.map(m => m.uid === user.uid ? { ...m, arrived } : m);
            } else {
                alert('Failed to update arrival status. Please try again.');
            }
        }).catch(error => {
            console.error('Error updating arrival status:', error);
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
                <button type="button" aria-label="Copy join URL" class="copy-join-url-button align-center" onclick={copyJoinUrl} style="background-color: transparent; border: none;">
                    {@render copyIcon()}
                </button>
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
                <details class="member-item" name={member.uid}>
                    <summary>
                        <div class="align-center">
                            <ProfileAvatar displayName={member.displayName} profileURL={member.profileURL} />
                            <span class="member-name align-center">{member.displayName}{#if member.role === 'owner'}
                                {@render crownIcon('gold')}
                            {/if}</span>
                        </div>
                        <div class="align-center">
                            {#if isOwner && member.uid !== user.uid}
                            <button class="icon-button" onclick={() => kick(member)}>
                                {@render kickIcon()}
                            </button>
                            {/if}
                            <span class="member-status {member.arrived ? 'arrived' : 'not-arrived'}">{member.arrived ? '✔️' : '❌'}</span>
                        </div>
                    </summary>
                    <div class="member-contents">
                        (TODO: Show details about the user's status)
                    </div>
                </details>
            {/each}
        </div>
    </div>
    
    <div class="room-actions">
        <h2>Actions</h2>
        {#if members.filter(m => m.uid === user.uid).arrived}
            <button onclick={() => setArrived(false)} class="not-arrived-button">{@render houseIcon('white')}Mark as not arrived</button>
        {:else}
            <button onclick={() => setArrived(true)} class="arrived-button">{@render houseIcon('white')}Mark as arrived</button>
        {/if}
        {#if isOwner}
            <button onclick={deleteRoom} class="delete-room-button">{@render deleteIcon('white')}Delete Room</button>
        {:else}
            <button onclick={leaveRoom} class="leave-room-button">{@render doorIcon('white')}Leave Room</button>
        {/if}
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
        background: var(--bg-primary);
        border-radius: 8px;
        border: 1px solid var(--border-color);
    }

    .member-item summary {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-direction: row;
        border-bottom: 1px solid var(--border-color);
        border-radius: 8px;
        transition: margin 150ms ease-out;
    }

    .member-item summary div {
        gap: 10px;
    }

    .member-item summary, .member-contents {
        padding: 0.5rem;
    }

    .member-item summary:hover {
        background: var(--bg-hover);
        cursor: pointer;
    }

    details[open] summary {
        margin-bottom: 10px;
    }

    h1 {
        color: var(--text-primary);
        margin-bottom: 1rem;
        background: var(--text-gradient);
        background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
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

    .leave-room-button, .delete-room-button {
        background-color: #f44336;
        color: white;
    }

    .arrived-button {
        background-color: #4CAF50;
        color: white;
    }

    .not-arrived-button {
        background-color: #ff9800;
        color: white;
    }

    .copy-join-url-button {
        vertical-align: middle;
        display: inline-flex;
        align-items: center;
        cursor: pointer;
        padding: 2px 6px;
        border-radius: 4px;
        transition: background 0.2s;
    }
    .copy-join-url-button:hover {
        background: var(--bg-primary);
    }
</style>
