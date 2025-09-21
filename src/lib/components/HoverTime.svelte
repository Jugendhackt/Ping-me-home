<script lang="ts">
    const {
        timestamp,
    } = $props();
</script>

<span class="hover-time-container">
    {timestamp ? new Date(timestamp).toLocaleDateString(): 'Recently'}
    {#if timestamp}
    <span class="hover-time">&nbsp;{new Date(timestamp).toLocaleTimeString()}</span>
    {/if}
</span>

<style>
.hover-time-container {
    display: contents;
}

.hover-time-container .hover-time {
    display: inline;
    visibility: hidden;
    position: relative;
    left: 5px;
    opacity: 0;
    transition: left 0.2s ease-in-out, opacity 0.2s ease-in-out;
}

.hover-time-container:hover .hover-time {
    visibility: visible;
    left: 0;
    opacity: 1;
}
</style>
