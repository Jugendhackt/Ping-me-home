<script lang="ts">
	import { goto } from '$app/navigation';
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();

    function join() {
        fetch(`/api/room/${data.roomId}/join`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => {
            if (response.ok) {
                goto(`/app/room/${data.roomId}`);
            } else {
                alert('Failed to join the room. Please try again.');
            }
        }).catch(error => {
            console.error('Error joining room:', error);
            alert('An error occurred. Please try again.');
        });
    }

    function cancel() {
        goto('/app/rooms');
    }
</script>

<div class="join-room-page">
    <h1>Join Room</h1>
    <p>You are about to join the room: <strong>{data.roomName}</strong></p>

    <p>If you were not expecting to join this room, please close this page.</p>

    <button onclick={join} id="join-button">Join Room</button>
    <button onclick={cancel} id="cancel-button">Cancel</button>
</div>
<style>
    .join-room-page {
        max-width: 600px;
        margin: 0 auto;
        padding: 2rem;
        text-align: center;
    }

    h1 {
        font-size: 2rem;
        margin-bottom: 1rem;
    }

    p {
        font-size: 1.2rem;
    }

    #join-button, #cancel-button {
        display: block;
        width: 100%;
        max-width: 300px;
        padding: 0.75rem;
        margin: 0 auto;
        border-radius: 10px;
    }

    #join-button {
        background-color: #4CAF50;
        color: white;
        border: none;
        margin-top: 1.5rem;
        margin-bottom: 0.5rem;
        cursor: pointer;
    }

    #cancel-button {
        background-color: #f44336;
        color: white;
        border: none;
        cursor: pointer;
    }


</style>
