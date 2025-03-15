<script lang="ts">
  import { onMount } from "svelte";
  import Timeline from "./PuranicEvents.js";
  import type { TimeUnit } from "../assets/puranictime.js";
  import puranicEvents from "../assets/puranicevents.json";
  import { calculateEventTime, calculateEventTimes } ./puranicEventsUtils.jssUtils";

  export let startTime: number;
  export let endTime: number;
  export let timeToPixel: (time: number) => number;
  export let puranicPeriods: TimeUnit[];

  $: timedEvents = puranicEvents.filter((event) => event.position != "range").map((event) => ({
    // time: calculateEventTime(event, puranicPeriods),
    ...calculateEventTimes(event, puranicPeriods),
    event: event.event,
    reference: event.refrence,
  }));

  $: visibleEvents = timedEvents.filter(
    // (event) => event.time <= endTime && event.time >= startTime
    (event) => true
  );

  let timelineContainer;
  let timeline;

  // Watch for changes in startTime, endTime, and visibleEvents
  $: if (timeline && timelineContainer) {
    timeline = new Timeline(timelineContainer, visibleEvents, {
      startTime,
      endTime,
      timeToPixel
    });
  }

  onMount(async () => {
    if (!timelineContainer) {
      console.error("Timeline container not found");
      return;
    }

    try {
      timeline = new Timeline(timelineContainer, visibleEvents, {
        startTime,
        endTime,
        timeToPixel
      });

      const handleResize = () => {
        if (timeline) {
          timeline.init();
        }
      };

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        if (timelineContainer) {
          timelineContainer.innerHTML = "";
        }
      };
    } catch (error) {
      console.error("Error initializing timeline:", error);
    }
  });
</script>

<div
  bind:this={timelineContainer}
  id="timeline-container"
  class="w-full h-full min-h-[400px]"
>
  <!-- Timeline will be rendered here -->
</div>

<style>
  :global(.events-container) {
    display: flex;
  }

  :global(.tick-marks) {
    position: relative;
    width: 30px;
    border-right: 1px solid #ddd;
  }

  :global(.tick-line) {
    position: absolute;
    width: 20px;
    height: 1px;
    background-color: #666;
    right: 0;
  }

  :global(.event-labels) {
    position: relative;
    flex: 1;
    padding-left: 20px;
  }

  :global(.event) {
    position: absolute;
    width: calc(100% - 20px);
  }

  :global(.event-content) {
    font-size: 0.875rem;
    text-align: left;
  }

  :global(.event-time) {
    color: #666;
    font-size: 0.75rem;
    font-weight: 500;
  }

  :global(.event-name) {
    line-height: 1.2;
    margin: 4px 0;
    font-weight: 500;
  }

  :global(.event-reference) {
    font-size: 0.75rem;
    color: #666;
    font-style: italic;
  }
</style>
