<script lang="ts">
    const {
        timestamp,
        fallback = 'Recently'
    } = $props();
</script>

<span class="hover-time-container">
    {timestamp ? new Date(timestamp).toLocaleDateString(): fallback}
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
    left: 3px;
    opacity: 0;
    transition: left 0.2s ease-in-out, opacity 0.2s ease-in-out;
}

.hover-time-container:hover .hover-time {
    visibility: visible;
    left: 0;
    opacity: 1;
}
</style>
