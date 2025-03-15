<!-- lib/PuranicEvents.svelte -->
<script lang="ts">
    import type { TimeUnit } from '../assets/puranictime';
    import puranicEvents from '../assets/puranicevents.json';
    import { calculateEventTime } from './puranicEventsUtils';
    
    export let startTime: number;
    export let endTime: number;
    export let timeToPixel: (time: number) => number;
    export let puranicPeriods: TimeUnit[];

    $: timedEvents = puranicEvents.map(event => ({
        time: calculateEventTime(event, puranicPeriods),
        event: event.event,
        reference: event.refrence
    }));

    $: visibleEvents = timedEvents.filter(
        event => event.time <= endTime && event.time >= startTime
    );
</script>

<div class="events-container">
    {#each visibleEvents as event}
        <div
            class="event"
            style="top: {timeToPixel(event.time)}px"
        >
            <div class="tick-line"></div>
            <div class="event-content">
                <div class="event-time">{event.time.toFixed(2)} Ma</div>
                <div class="event-name">{event.event}</div>
                {#if event.reference}
                    <div class="event-reference">{event.reference}</div>
                {/if}
            </div>
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
        justify-content: flex-start;
        align-items: center;
        gap: 8px;
        transform: translateY(-50%);
        padding: 4px;
    }

    .event-content {
        font-size: 0.875rem;
        text-align: left;
        width: 100%;
    }

    .event-time {
        color: #666;
        font-size: 0.75rem;
    }

    .event-name {
        line-height: 1.1;
    }

    .event-reference {
        font-size: 0.75rem;
        color: #666;
        font-style: italic;
    }

    .tick-line {
        width: 20px;
        height: 1px;
        background-color: #666;
        margin-left: 8px;
    }
</style>