<script lang="ts">
	import { addPersonIcon, copyIcon, crownIcon, deleteIcon, doorIcon, houseIcon, kickIcon } from '$lib/components/Icons.svelte';
	import ProfileAvatar from '$lib/components/ProfileAvatar.svelte';
    
    const { data } = $props();

    let { room, roomId, members, isOwner, user, formattedLogs } = $derived(data);

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
                    members = members!.filter((m: { uid: string }) => m.uid !== member.uid);
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
                members = members!.map(m => m.uid === user.uid ? { ...m, arrived } : m);
            } else {
                alert('Failed to update arrival status. Please try again.');
            }
        }).catch(error => {
            console.error('Error updating arrival status:', error);
            alert('An error occurred. Please try again.');
        });
    };

    // Modal state for inviting members
    let showInviteModal = $state(false);
    let inviteEmail = $state('');
    let isInviting = $state(false);
    let inviteError = $state('');
    let inviteErrorColor = $state('red');

    const openInviteModal = () => {
        inviteEmail = '';
        showInviteModal = true;
    };

    const closeInviteModal = () => {
        if (isInviting) return;
        showInviteModal = false;
        inviteEmail = '';
    };

    const submitInvite = async () => {
        if (!inviteEmail.trim()) return;
        isInviting = true;
        inviteError = '';
        try {
            const response = await fetch(`/api/room/${roomId}/invite-member`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: inviteEmail.trim() })
            });
            if (response.ok) {
                inviteErrorColor = 'green';
                inviteError = 'Invitation sent successfully.';
                closeInviteModal();
            } else {
                inviteErrorColor = 'red';
                inviteError = 'Failed to send invitation. Please try again.';
            }
        } catch (error) {
            inviteError = 'An error occurred. Please try again.';
            inviteErrorColor = 'red';
            console.error('Error sending invitation:', error);
        } finally {
            isInviting = false;
        }
    };

    const makeOwner = (member: {
        uid: string,
        displayName: string,
    }) => {
        if (confirm(`Do you want to make ${member.displayName} an owner? This cannot be undone.`)) {
            fetch(`/api/room/${roomId}/make-owner`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userToPromote: member.uid })
            }).then(response => {
                if (response.ok) {
                    // Update ownership status in the UI
                    isOwner = false;
                    members = members!.map(m => m.uid === member.uid ? { ...m, role: 'owner' } : m);
                } else {
                    alert('Failed to change owner. Please try again.');
                }
            }).catch(error => {
                console.error('Error changing owner:', error);
                alert('An error occurred. Please try again.');
            });
        }
    };
</script>

<div class="room-info">
    <h1>{room!.name}</h1>
    <div class="room-details">
        <h2>Room Information</h2>
        <div class="info-item">
            <strong>Room ID:</strong> <code>{roomId}</code>
        </div>
        <div class="info-item">
            <strong>URL Joining Allowed:</strong> {room!.allowUrlJoining ? 'Yes' : 'No'}
            {#if room!.allowUrlJoining}
                <button type="button" aria-label="Copy join URL" class="copy-join-url-button align-center" onclick={copyJoinUrl} style="background-color: transparent; border: none;">
                    {@render copyIcon()}
                </button>
            {/if}
        </div>
        <div class="info-item">
            <strong>Total Members:</strong> {members!.length}
        </div>
    </div>
    
    <div class="members-section">
        <div class="members-header" style="display: flex; justify-content: space-between; align-items: flex-start;">
            <h2>Members</h2>
            {#if isOwner}
                <button class="icon-button" onclick={openInviteModal} title="Invite Members">
                    {@render addPersonIcon()}
                </button>
            {/if}

{#if showInviteModal}
    <div class="modal-backdrop" onclick={closeInviteModal} role="dialog" aria-modal="true" tabindex="-1">
        <div class="modal-content" onclick={(e) => e.stopPropagation()} role="document" tabindex="0">
            <div class="modal-header">
                <h2>Invite Member</h2>
                <button class="modal-close" onclick={closeInviteModal} aria-label="Close modal">✕</button>
            </div>
            <form onsubmit={(e) => { e.preventDefault(); submitInvite(); }} class="modal-form">
                <div class="form-group">
                    <label for="invite-email">Email Address</label>
                    <input
                        id="invite-email"
                        type="email"
                        bind:value={inviteEmail}
                        placeholder="Enter email address..."
                        required
                        maxlength="100"
                        disabled={isInviting}
                        class="form-input"
                    />
                </div>
                <div class="invite-error" style="color: {inviteErrorColor}; display: {inviteError ? 'block' : 'none'};">{inviteError}</div>
                <div class="modal-actions">
                    <button type="button" onclick={closeInviteModal} disabled={isInviting} class="btn btn-secondary">Cancel</button>
                    <button type="submit" disabled={isInviting || !inviteEmail.trim()} class="btn btn-primary">
                        {#if isInviting}
                            Sending...
                        {:else}
                            Send Invite
                        {/if}
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}
        </div>
        <div class="members-list">
            {#each members! as member}
                <details class="member-item" name={member.uid}>
                    <summary>
                        <div class="align-center">
                            <ProfileAvatar displayName={member.displayName} profileURL={member.profileURL} />
                            <span class="member-name align-center">{member.displayName}{#if member.role === 'owner'}
                                <span class="align-center" style="margin-left: 5px;">{@render crownIcon('gold')}</span>
                            {/if}</span>
                        </div>
                        <div class="align-center">
                            {#if isOwner && member.uid !== user.uid && member.role !== 'owner' }
                            <button class="icon-button" onclick={() => makeOwner(member)}>
                                {@render crownIcon()}
                            </button>
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
        {#if members!.find(m => m.uid === user.uid)?.arrived}
            <button onclick={() => setArrived(false)} class="btn btn-warning">{@render houseIcon('currentColor')}<span>Mark as not arrived</span></button>
        {:else}
            <button onclick={() => setArrived(true)} class="btn btn-success">{@render houseIcon('currentColor')}<span>Mark as arrived</span></button>
        {/if}
        {#if isOwner}
            <button onclick={deleteRoom} class="btn btn-danger">{@render deleteIcon('white')}<span>Delete Room</span></button>
        {:else}
            <button onclick={leaveRoom} class="btn btn-danger">{@render doorIcon('white')}<span>Leave Room</span></button>
        {/if}
    </div>

    <div class="room-logs">
        <h2>Room Logs</h2>
        <ul class="log-list">
            {#each formattedLogs! as log}
                <li class="log-item">
                    <span class="log-timestamp">{log.timestamp}</span>:
                    <span class="log-user">{log.performerName}</span> <span class="log-action">{log.action}{log.subjectName ? ` ${log.subjectName}` : ''}.</span>
                </li>
            {/each}
        </ul>
    </div>
</div>

<style>
    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 1rem;
    }
    .modal-content {
        background: var(--bg-primary);
        border: 1px solid var(--border-color);
        border-radius: 16px;
        max-width: 400px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: var(--shadow-lg);
        animation: modalSlideIn 0.2s ease-out;
    }
    @keyframes modalSlideIn {
        from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }
    .modal-header {
        padding: 1.5rem 1.5rem 0 1.5rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
    }
    .modal-header h2 {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--text-primary);
        margin: 0;
    }
    .modal-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        color: var(--text-secondary);
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 6px;
        transition: all 0.2s ease;
        line-height: 1;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .modal-close:hover {
        background: var(--bg-hover);
        color: var(--text-primary);
    }
    .modal-form {
        padding: 1.5rem;
    }
    .form-group {
        margin-bottom: 1.5rem;
    }
    .form-group label {
        display: block;
        font-weight: 500;
        color: var(--text-primary);
        margin-bottom: 0.5rem;
        font-size: 0.9rem;
    }
    .form-input {
        width: 100%;
        padding: 0.75rem 1rem;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        background: var(--bg-secondary);
        color: var(--text-primary);
        font-size: 1rem;
        transition: all 0.2s ease;
        box-sizing: border-box;
    }
    .form-input:focus {
        outline: none;
        border-color: var(--accent-color);
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
    .form-input:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
    .form-input::placeholder {
        color: var(--text-muted);
    }
    .modal-actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
        margin-top: 2rem;
        padding-top: 1.5rem;
        border-top: 1px solid var(--border-color);
    }
    .modal-actions .btn {
        min-width: 100px;
        justify-content: center;
    }
    .room-info {
        padding: 2rem;
        max-width: 800px;
        margin: 0 auto;
    }

    .room-details, .members-section, .room-actions, .room-logs {
        margin-bottom: 1rem;
        padding: 1rem;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        background: var(--bg-secondary);
    }

    .room-logs {
        font-family: 'Courier New', Courier, monospace;
        max-height: 250px;
        overflow-y: auto;
    }

    .log-item {
        margin-left: 1rem;
    }

    .info-item {
        margin-bottom: 0.5rem;
    }
    
    .info-item code {
        background: var(--bg-primary);
        padding: 2px 4px;
        border-radius: 4px;
        font-family: 'Courier New', Courier, monospace;
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

    .room-actions {
        display: flex;
        flex-direction: column;
        gap: 5px;
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

    @media (max-width: 600px) {
        .room-actions {
            position: fixed;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 100;
            background: transparent;
            pointer-events: none;
            box-shadow: none;
            border-top: none;
            border-color: transparent;
            margin-bottom: 0;
            width: 100vw;
            max-width: 100vw;
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
        }

        .room-actions h2 {
            display: none;
        }

        .room-actions button {
            margin-bottom: 0.5rem;
            pointer-events: all;
            margin: unset;
            box-shadow: var(--shadow-lg);
        }

        .room-actions button span {
            display: none;
        }
    }
</style>
