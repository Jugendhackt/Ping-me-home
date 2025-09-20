<script lang="ts">
    import type { PageData } from './$types';
    
    let { data }: { data: PageData } = $props();

    let statusMessage = $state('');
    let statusIsError = $state(false);
    let statusVisible = $state(false);

    // Form values
    let roomName = $state('');
    let inviteRoomId = $state('');
    let userToAdd = $state('');
    let acceptRoomId = $state('');
    let declineRoomId = $state('');
    let kickRoomId = $state('');
    let userToKick = $state('');
    let leaveRoomId = $state('');
    let deleteRoomId = $state('');

    function showStatus(message: string, isError = false) {
        statusMessage = message;
        statusIsError = isError;
        statusVisible = true;
    }

    async function makeRequest(url: string, method = 'POST', body?: any) {
        try {
            const options: RequestInit = {
                method,
                headers: { 'Content-Type': 'application/json' },
            };
            if (body) {
                options.body = JSON.stringify(body);
            }
            
            const response = await fetch(url, options);
            const data = await response.json();
            
            if (response.ok) {
                showStatus(`Success: ${JSON.stringify(data, null, 2)}`, false);
            } else {
                showStatus(`Error ${response.status}: ${data.message || 'Unknown error'}`, true);
            }
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            showStatus(`Network Error: ${errorMsg}`, true);
        }
    }

    async function createRoom(e: Event) {
        e.preventDefault();
        await makeRequest('/api/rooms/create', 'POST', { name: roomName });
        roomName = '';
    }

    async function inviteMember(e: Event) {
        e.preventDefault();
        await makeRequest(`/api/room/${inviteRoomId}/invite-member`, 'POST', { userToAdd });
        inviteRoomId = '';
        userToAdd = '';
    }

    async function acceptInvite(e: Event) {
        e.preventDefault();
        await makeRequest(`/api/room/${acceptRoomId}/accept-invite`, 'POST');
        acceptRoomId = '';
    }

    async function declineInvite(e: Event) {
        e.preventDefault();
        await makeRequest(`/api/room/${declineRoomId}/decline-invite`, 'POST');
        declineRoomId = '';
    }

    async function kickMember(e: Event) {
        e.preventDefault();
        await makeRequest(`/api/room/${kickRoomId}/kick`, 'POST', { userToKick });
        kickRoomId = '';
        userToKick = '';
    }

    async function leaveRoom(e: Event) {
        e.preventDefault();
        await makeRequest(`/api/room/${leaveRoomId}/leave`, 'POST');
        leaveRoomId = '';
    }

    async function deleteRoom(e: Event) {
        e.preventDefault();
        if (confirm('Are you sure you want to delete this room?')) {
            await makeRequest(`/api/room/${deleteRoomId}/delete`, 'POST');
            deleteRoomId = '';
        }
    }
</script>

<svelte:head>
    <title>Room Management - JHCGN</title>
</svelte:head>

<!-- Room API Test Interface -->
<div class="test-container">
    <div class="page-header">
        <h1>🏠 Room Management</h1>
        <p>Welcome, {data.user?.displayName || data.user?.email || 'User'}! Manage your rooms here.</p>
    </div>
    
    {#if statusVisible}
        <div class="status" class:error={statusIsError}>
            {statusMessage}
        </div>
    {/if}

    <!-- Create Room -->
    <div class="form-section">
        <h3>Create Room</h3>
        <form onsubmit={createRoom}>
            <input type="text" bind:value={roomName} placeholder="Room Name" required />
            <button type="submit">Create Room</button>
        </form>
    </div>

    <!-- Invite Member -->
    <div class="form-section">
        <h3>Invite Member</h3>
        <form onsubmit={inviteMember}>
            <input type="text" bind:value={inviteRoomId} placeholder="Room ID" required />
            <input type="text" bind:value={userToAdd} placeholder="User ID to invite" required />
            <button type="submit">Invite Member</button>
        </form>
    </div>

    <!-- Accept Invite -->
    <div class="form-section">
        <h3>Accept Invite</h3>
        <form onsubmit={acceptInvite}>
            <input type="text" bind:value={acceptRoomId} placeholder="Room ID" required />
            <button type="submit">Accept Invite</button>
        </form>
    </div>

    <!-- Decline Invite -->
    <div class="form-section">
        <h3>Decline Invite</h3>
        <form onsubmit={declineInvite}>
            <input type="text" bind:value={declineRoomId} placeholder="Room ID" required />
            <button type="submit">Decline Invite</button>
        </form>
    </div>

    <!-- Kick Member -->
    <div class="form-section">
        <h3>Kick Member</h3>
        <form onsubmit={kickMember}>
            <input type="text" bind:value={kickRoomId} placeholder="Room ID" required />
            <input type="text" bind:value={userToKick} placeholder="User ID to kick" required />
            <button type="submit">Kick Member</button>
        </form>
    </div>

    <!-- Leave Room -->
    <div class="form-section">
        <h3>Leave Room</h3>
        <form onsubmit={leaveRoom}>
            <input type="text" bind:value={leaveRoomId} placeholder="Room ID" required />
            <button type="submit">Leave Room</button>
        </form>
    </div>

    <!-- Delete Room -->
    <div class="form-section">
        <h3>Delete Room</h3>
        <form onsubmit={deleteRoom}>
            <input type="text" bind:value={deleteRoomId} placeholder="Room ID" required />
            <button type="submit" class="delete-btn">Delete Room</button>
        </form>
    </div>

    <div class="debug-info">
        <h4>Debug Info:</h4>
        <p>User ID: {data.user?.uid || 'Not available'}</p>
        <p>Email: {data.user?.email || 'Not available'}</p>
    </div>
</div>

<style>
    .test-container {
        max-width: 800px;
        margin: 20px auto;
        padding: 20px;
        font-family: var(--font-body, Arial, sans-serif);
    }

    .page-header {
        text-align: center;
        margin-bottom: 30px;
        padding: 20px;
        background: var(--bg-secondary, #f8f9fa);
        border-radius: 8px;
    }

    .page-header h1 {
        margin: 0 0 10px 0;
        color: var(--text-primary, #333);
    }

    .page-header p {
        margin: 0;
        color: var(--text-secondary, #666);
    }

    .status {
        margin: 20px 0;
        padding: 15px;
        background: var(--success-bg, #e8f5e8);
        color: var(--success-text, #2e7d32);
        border-radius: 6px;
        border-left: 4px solid var(--success-color, #4caf50);
    }

    .status.error {
        background: var(--error-bg, #ffebee);
        color: var(--error-text, #d32f2f);
        border-left-color: var(--error-color, #f44336);
    }

    .form-section {
        border: 1px solid var(--border-color, #ddd);
        margin: 20px 0;
        padding: 20px;
        border-radius: 8px;
        background: var(--bg-primary, white);
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .form-section h3 {
        margin: 0 0 15px 0;
        color: var(--text-primary, #333);
        font-size: 1.1rem;
    }

    .form-section form {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .form-section input {
        padding: 12px;
        border: 1px solid var(--border-color, #ddd);
        border-radius: 6px;
        font-size: 14px;
        background: var(--bg-primary, white);
        color: var(--text-primary, #333);
    }

    .form-section input:focus {
        outline: none;
        border-color: var(--accent-color, #007bff);
        box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
    }

    .form-section button {
        padding: 12px 16px;
        background: var(--accent-color, #007bff);
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: background-color 0.2s ease;
    }

    .form-section button:hover {
        background: var(--accent-hover, #0056b3);
    }

    .form-section button:active {
        transform: translateY(1px);
    }

    .delete-btn {
        background: var(--danger-color, #ff4444) !important;
    }

    .delete-btn:hover {
        background: var(--danger-hover, #cc3333) !important;
    }

    .debug-info {
        margin-top: 30px;
        padding: 15px;
        background: var(--bg-tertiary, #f0f0f0);
        border-radius: 6px;
        font-size: 0.9rem;
        color: var(--text-secondary, #666);
    }

    .debug-info h4 {
        margin: 0 0 10px 0;
        color: var(--text-primary, #333);
    }

    .debug-info p {
        margin: 5px 0;
        font-family: monospace;
    }

    @media (min-width: 768px) {
        .form-section form {
            flex-direction: row;
            align-items: center;
        }

        .form-section input {
            margin-right: 10px;
            flex: 1;
        }

        .form-section button {
            white-space: nowrap;
            flex-shrink: 0;
        }
    }
</style>