<script lang="ts">
    import type { TimeUnit } from '../assets/puranictime';
    import puranicEvents from '../assets/puranicevents.json';
    import { calculateEventTime } from './puranicEventsUtils';

    export let startTime: number;
    export let endTime: number;
    export let timeToPixel: (time: number) => number;
    export let puranicPeriods: TimeUnit[];

    const labelHeight = 60; // Estimate of label height in pixels
    const labelSpacing = 5; // Spacing between labels

    $: timedEvents = puranicEvents.map(event => ({
        time: calculateEventTime(event, puranicPeriods),
        event: event.event,
        reference: event.refrence
    }));

    $: visibleEvents = timedEvents
        .filter(event => event.time <= endTime && event.time >= startTime)
        .sort((a, b) => a.time - b.time);

    let adjustedEvents: { position: number; tickPosition: number; time: number; event: string; reference?: string }[] = [];
    $: {
        adjustedEvents = [];
        let lastLabelBottom = -Infinity;

        for (let event of visibleEvents) {
            let idealPosition = timeToPixel(event.time);
            let adjustedPosition = Math.max(idealPosition, lastLabelBottom + labelSpacing);
            adjustedEvents.push({ ...event, position: adjustedPosition, tickPosition: idealPosition });
            lastLabelBottom = adjustedPosition + labelHeight;
        }
    }
</script>

<div class="events-container">
    <!-- Column with tick marks -->
    <div class="tick-marks">
        {#each adjustedEvents as event}
            <div
                class="tick-line"
                style="top: {event.tickPosition}px"
            ></div>
        {/each}
    </div>

    <!-- Column with labels -->
    <div class="event-labels">
        {#each adjustedEvents as event}
            <div
                class="event"
                style="top: {event.position}px"
            >
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
</div>

<style>
    .events-container {
        display: flex;
        position: relative;
        height: 100%;
        width: 100%;
    }

    .tick-marks {
        position: relative;
        width: 30px;
    }

    .tick-line {
        position: absolute;
        width: 20px;
        height: 1px;
        background-color: #666;
    }

    .event-labels {
        position: relative;
        flex: 1;
    }

    .event {
        position: absolute;
        padding: 4px 0;
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
</style>