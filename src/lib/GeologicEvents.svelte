<!-- lib/GeologicEvents.svelte -->
<script>
    export let startTime;
    export let endTime;
    export let timeToPixel;
    
    import geologicEvents from '../assets/geologicevents.json';

    $: visibleEvents = geologicEvents.filter(
        event => event.time <= endTime && event.time >= startTime
    );
</script>

<div class="events-container">
    {#each visibleEvents as event}
        <div
            class="event"
            style="top: {timeToPixel(event.time)}px"
        >
            <div class="event-content">
                <div class="event-time">{event.time} Ma</div>
                <div class="event-name">{event.event}</div>
            </div>
            <div class="tick-line"></div>
        </div>
    {/each}
</div>

<style>
    .events-container {
        position: relative;
        height: 100%;
        width: 100%;
    }

    .event {
        width: 100%;
        position: absolute;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 8px;
        transform: translateY(-50%);
        padding: 4px;
    }

    .event-content {
        font-size: 0.875rem;
        text-align: right;
        width: 100%;
    }

    .event-time {
        color: #666;
        font-size: 0.75rem;
        text-align: right;
        width: 100%;
    }

    .event-name {
        text-align: right;
        line-height: 1.1;
        width: 100%;
    }

    .tick-line {
        width: 20px; /* Length of the line */
        height: 1px; /* Thickness of the line */
        background-color: #666; /* Color of the line */
        margin-left: 8px; /* Space between text and line */
    }
</style>