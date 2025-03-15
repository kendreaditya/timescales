<script>
  import { spring } from "svelte/motion";
  import geologicalTime from "./assets/geologictime.json";
  import { generatePuranicPeriods } from "./assets/puranictime";
  import TimeDivision from "./lib/TimeDivision.svelte";
  import TimeScale from "./lib/TimeScale.svelte";
  import GeologicEvents from "./lib/GeologicEvents.svelte";
  import PuranicEvents from "./lib/PuranicEvents.svelte";

  const puranictime = generatePuranicPeriods();

  // Time constants (in millions of years)
  const MIN_TIME = 0;
  const MAX_TIME = 4540; // 13.8 billion years (could make this 4.54 billion years for Earth)
  const MIN_SCALE = 1;
  const MAX_SCALE = 1000;

  // Viewport state
  let containerHeight = 4540; // 13.8 billion years (could make this 4.54 billion years for Earth)
  let scale = spring(1);
  let centerTime = spring(MAX_TIME / 2);
  let isDragging = false;
  let lastDragPos = null;
  let touchDistance = null;

  // Computed values for viewport
  $: visibleTimeRange = containerHeight / $scale;
  $: startTime = Math.max(MIN_TIME, $centerTime - visibleTimeRange / 2);
  $: endTime = Math.min(MAX_TIME, $centerTime + visibleTimeRange / 2);

  // Convert time to pixels and vice versa
  function timeToPixel(time) {
    return (time - startTime) * $scale;
  }

  function pixelToTime(pixel) {
    return startTime + pixel / $scale;
  }

  function handleWheel(event) {
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    const mouseY = event.clientY - rect.top;
    const mouseTime = pixelToTime(mouseY);
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(
      MIN_SCALE,
      Math.min(MAX_SCALE, $scale * zoomFactor)
    );
    const newVisibleTimeRange = containerHeight / newScale;
    const newStartTime =
      mouseTime - (mouseY / containerHeight) * newVisibleTimeRange;
    const newCenterTime = newStartTime + newVisibleTimeRange / 2;
    scale.set(newScale);
    centerTime.set(
      Math.max(
        MIN_TIME + newVisibleTimeRange / 2,
        Math.min(MAX_TIME - newVisibleTimeRange / 2, newCenterTime)
      )
    );
  }

  function handleTouchStart(event) {
    if (event.touches.length === 2) {
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      touchDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
    } else if (event.touches.length === 1) {
      isDragging = true;
      lastDragPos = event.touches[0].clientY;
    }
  }

  function handleTouchMove(event) {
    if (event.touches.length === 2) {
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const newDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      if (touchDistance) {
        const zoomFactor = newDistance / touchDistance;
        const newScale = Math.max(
          MIN_SCALE,
          Math.min(MAX_SCALE, $scale * zoomFactor)
        );
        scale.set(newScale);
      }
      touchDistance = newDistance;
    } else if (isDragging) {
      const deltaY = event.touches[0].clientY - lastDragPos;
      const adaptiveScaling = Math.max(1, Math.log10($scale) * 2);
      const deltaTime = (-deltaY * adaptiveScaling) / $scale;
      centerTime.set(
        Math.max(
          MIN_TIME + visibleTimeRange / 2,
          Math.min(MAX_TIME - visibleTimeRange / 2, $centerTime + deltaTime)
        )
      );
      lastDragPos = event.touches[0].clientY;
    }
  }

  function handleTouchEnd() {
    isDragging = false;
    touchDistance = null;
    lastDragPos = null;
  }

  function handleMouseDown(event) {
    isDragging = true;
    lastDragPos = event.clientY;
  }

  function handleMouseMove(event) {
    if (!isDragging) return;
    const deltaY = event.clientY - lastDragPos;
    const zoomAdaptiveFactor = Math.max(1, Math.log10($scale) * 2);
    const deltaTime = (-deltaY * zoomAdaptiveFactor) / $scale;

    centerTime.set(
      Math.max(
        MIN_TIME + visibleTimeRange / 2,
        Math.min(MAX_TIME - visibleTimeRange / 2, $centerTime + deltaTime)
      )
    );
    lastDragPos = event.clientY;
  }

  function handleMouseUp() {
    isDragging = false;
  }
</script>

<section>
  <!-- Header -->
  <header class="my-6 text-center">
    <h1 class="text-2xl font-bold text-white-800">
      Geological & Purāṇic Time Scales
    </h1>
    <div class="text-xs">
      Zoom in and out using the scroll wheel or pinch gesture. Drag to pan the
      timeline.
    </div>

    <div class="mt-3 text-sm font-semibold text-white-400">
      {startTime.toFixed(2)} - {endTime.toFixed(2)} Million Years Ago
    </div>
  </header>

  <div
    class="mx-auto no-select max-w-screen-2xl"
    style="height: {containerHeight}px; "
  >
    <div class="space-x-6 timelines-wrapper">
      <!-- <div class="vertical-label">GEOLOGIC</div> -->

      <div class="timeline-events">
        <GeologicEvents {startTime} {endTime} {timeToPixel} />
      </div>

    <div
      class="flex justify-center w-[896px] space-x-6"
      role="button"
      style="cursor: row-resize;"
      tabindex="0"
      on:wheel={handleWheel}
      on:mousedown={handleMouseDown}
      on:mousemove={handleMouseMove}
      on:mouseup={handleMouseUp}
      on:mouseleave={handleMouseUp}
      on:touchstart={handleTouchStart}
      on:touchmove={handleTouchMove}
      on:touchend={handleTouchEnd}
    >
      <div class="timeline">
      {#each geologicalTime as division, index}
        <TimeDivision
        {division}
        {startTime}
        {endTime}
        {timeToPixel}
        level={0}
        order={index}
        />
      {/each}
      </div>

      <div class="w-16">
      <TimeScale {startTime} {endTime} {timeToPixel} />
      </div>

      <div class="timeline">
      {#each puranictime as division, index}
        <TimeDivision
        {division}
        {startTime}
        {endTime}
        {timeToPixel}
        level={0}
        order={index}
        />
      {/each}
      </div>
    </div>

      <div class="timeline-events">
        <PuranicEvents
          {startTime}
          {endTime}
          {timeToPixel}
          puranicPeriods={puranictime}
        />
      </div>

      <!-- <div class="relative w-32"> -->
        <!-- <div class="vertical-label">PURĀṆIC</div> -->
      <!-- </div> -->
    </div>
  </div>
</section>

<style>
  .timeline-events {
    width: 256px;
  }
  .timelines-wrapper {
    display: flex;
    width: 100%;
    justify-content: center;
  }

  .timeline {
    position: relative;
    flex: 1;
    height: 100%;
    max-width: 384px;
  }

  .vertical-label {
    font-size: 8rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.05);
    text-transform: uppercase;
    letter-spacing: 0.5rem;
    z-index: 5;
    transform: rotate(90deg);
    position: sticky;
  }

  .no-select {
    user-select: none; /* Standard syntax */
    -webkit-user-select: none; /* Safari */
    -moz-user-select: none; /* Firefox */
  }
</style>
