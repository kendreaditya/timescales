<script>
  import { spring } from "svelte/motion";
  import { onMount } from "svelte";
  import geologicalTime from "./assets/geologictime.json";
  import { generatePuranicPeriods } from "./assets/puranictime";
  import TimeDivision from "./lib/TimeDivision.svelte";
  import TimeScale from "./lib/TimeScale.svelte";
  import GeologicEvents from "./lib/GeologicEvents.svelte";
  import PuranicEvents from "./lib/PuranicEvents.svelte";
  import geologicEventsData from "./assets/geologicevents.json";
  import puranicEventsData from "./assets/puranicevents.json";
  import { calculateEventTime } from "./lib/puranicEventsUtils";

  const puranictime = generatePuranicPeriods();

  const MIN_TIME = 0;
  const MAX_TIME = 4540;
  const MAX_SCALE = 1000;

  let containerHeight = 4540;
  let scale = spring(1);
  let centerTime = spring(MAX_TIME / 2);
  let isDragging = false;
  let lastDragPos = null;
  let touchDistance = null;

  // Mobile UI state
  let showMobileEvents = false;
  let mobileEventsTab = "geologic";

  // Allows zooming out to see the full timeline regardless of container height.
  // On desktop: 4540/4540 = 1 (same as before). On mobile: ~0.15 (allows full overview).
  $: effectiveMinScale = containerHeight / MAX_TIME;

  $: visibleTimeRange = containerHeight / $scale;
  $: startTime = Math.max(MIN_TIME, $centerTime - visibleTimeRange / 2);
  $: endTime = Math.min(MAX_TIME, $centerTime + visibleTimeRange / 2);

  // Precompute timed puranic events for mobile events panel
  $: timedPuranicEvents = puranicEventsData.map(event => ({
    time: calculateEventTime(event, puranictime),
    event: event.event,
    reference: event.refrence
  }));

  $: visibleGeologicEvents = geologicEventsData
    .filter(e => e.time <= endTime && e.time >= startTime)
    .sort((a, b) => a.time - b.time);

  $: visiblePuranicEvents = timedPuranicEvents
    .filter(e => e.time != null && e.time <= endTime && e.time >= startTime)
    .sort((a, b) => a.time - b.time);

  $: totalVisibleEvents = visibleGeologicEvents.length + visiblePuranicEvents.length;

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
      effectiveMinScale,
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
    // Prevent page scroll while interacting with the timeline
    event.preventDefault();
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
          effectiveMinScale,
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

  function zoomIn() {
    const newScale = Math.min(MAX_SCALE, $scale * 1.5);
    const newVisibleTimeRange = containerHeight / newScale;
    scale.set(newScale);
    centerTime.set(
      Math.max(
        MIN_TIME + newVisibleTimeRange / 2,
        Math.min(MAX_TIME - newVisibleTimeRange / 2, $centerTime)
      )
    );
  }

  function zoomOut() {
    const newScale = Math.max(effectiveMinScale, $scale / 1.5);
    const newVisibleTimeRange = containerHeight / newScale;
    scale.set(newScale);
    centerTime.set(
      Math.max(
        MIN_TIME + newVisibleTimeRange / 2,
        Math.min(MAX_TIME - newVisibleTimeRange / 2, $centerTime)
      )
    );
  }

  onMount(() => {
    function updateForViewport() {
      if (window.innerWidth < 768) {
        const headerEl = document.querySelector("header");
        const headerH = headerEl ? headerEl.offsetHeight + 48 : 120;
        containerHeight = Math.max(400, window.innerHeight - headerH);
        // Start centered on the Phanerozoic era (most visually rich for life history)
        scale.set(1, { hard: true });
        centerTime.set(270, { hard: true });
      } else {
        containerHeight = 4540;
      }
    }

    updateForViewport();
    window.addEventListener("resize", updateForViewport);
    return () => window.removeEventListener("resize", updateForViewport);
  });
</script>

<section>
  <!-- Header -->
  <header class="my-3 md:my-6 text-center px-4">
    <h1 class="text-xl md:text-2xl font-bold text-white-800">
      Geological & Purāṇic Time Scales
    </h1>
    <div class="text-xs hidden md:block">
      Zoom in and out using the scroll wheel or pinch gesture. Drag to pan the
      timeline.
    </div>
    <div class="text-xs md:hidden" style="color: #888;">
      Pinch to zoom · Drag to pan
    </div>

    <div class="mt-2 md:mt-3 text-sm font-semibold text-white-400">
      {startTime.toFixed(2)} – {endTime.toFixed(2)} Million Years Ago
    </div>
  </header>

  <div
    class="mx-auto no-select max-w-screen-2xl"
    style="height: {containerHeight}px;"
  >
    <div class="timelines-wrapper">
      <!-- Event sidebars: desktop only -->
      <div class="timeline-events hidden md:block">
        <GeologicEvents {startTime} {endTime} {timeToPixel} />
      </div>

      <div
        class="flex justify-center w-full md:w-[896px] space-x-2 md:space-x-6"
        role="button"
        style="cursor: row-resize; touch-action: none;"
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

        <div class="w-10 md:w-16">
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

      <!-- Event sidebars: desktop only -->
      <div class="timeline-events hidden md:block">
        <PuranicEvents
          {startTime}
          {endTime}
          {timeToPixel}
          puranicPeriods={puranictime}
        />
      </div>
    </div>
  </div>

  <!-- Mobile zoom controls (right side, vertically centered) -->
  <div class="md:hidden fixed right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-50">
    <button class="zoom-btn" on:click={zoomIn} aria-label="Zoom in">+</button>
    <button class="zoom-btn" on:click={zoomOut} aria-label="Zoom out">−</button>
  </div>

  <!-- Mobile events toggle (bottom center, shown when sheet is closed) -->
  {#if !showMobileEvents}
    <button
      class="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 events-toggle-btn"
      on:click={() => (showMobileEvents = true)}
    >
      Events ({totalVisibleEvents})
    </button>
  {/if}

  <!-- Mobile events bottom sheet -->
  {#if showMobileEvents}
    <div class="md:hidden fixed bottom-0 left-0 right-0 mobile-events-sheet z-40">
      <div class="sheet-header">
        <div class="flex gap-2">
          <button
            class="tab-btn {mobileEventsTab === 'geologic' ? 'tab-active' : ''}"
            on:click={() => (mobileEventsTab = "geologic")}
          >
            Geologic ({visibleGeologicEvents.length})
          </button>
          <button
            class="tab-btn {mobileEventsTab === 'puranic' ? 'tab-active' : ''}"
            on:click={() => (mobileEventsTab = "puranic")}
          >
            Purāṇic ({visiblePuranicEvents.length})
          </button>
        </div>
        <button
          class="close-btn"
          on:click={() => (showMobileEvents = false)}
          aria-label="Close events panel"
        >✕</button>
      </div>

      <div class="events-list">
        {#if mobileEventsTab === "geologic"}
          {#each visibleGeologicEvents as event}
            <div class="mobile-event-item">
              <div class="event-time-badge">{event.time} Ma</div>
              <div class="event-label">{event.event}</div>
            </div>
          {/each}
          {#if visibleGeologicEvents.length === 0}
            <div class="no-events-msg">No geologic events in current view</div>
          {/if}
        {:else}
          {#each visiblePuranicEvents as event}
            <div class="mobile-event-item">
              <div class="event-time-badge">{event.time.toFixed(2)} Ma</div>
              <div class="event-label">{event.event}</div>
              {#if event.reference}
                <div class="event-ref">{event.reference}</div>
              {/if}
            </div>
          {/each}
          {#if visiblePuranicEvents.length === 0}
            <div class="no-events-msg">No Purāṇic events in current view</div>
          {/if}
        {/if}
      </div>
    </div>
  {/if}
</section>

<style>
  .timeline-events {
    width: 256px;
  }

  .timelines-wrapper {
    display: flex;
    width: 100%;
    justify-content: center;
    /* Use gap instead of space-x-* so hidden elements don't bleed margin */
    gap: 0;
  }

  @media (min-width: 768px) {
    .timelines-wrapper {
      gap: 1.5rem;
    }
  }

  .timeline {
    position: relative;
    flex: 1;
    height: 100%;
    max-width: 384px;
  }

  .no-select {
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
  }

  /* ── Mobile zoom buttons ── */
  .zoom-btn {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: rgba(30, 30, 30, 0.88);
    border: 1px solid rgba(255, 255, 255, 0.22);
    color: white;
    font-size: 1.5rem;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    cursor: pointer;
    touch-action: manipulation;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.45);
  }

  .zoom-btn:active {
    background: rgba(70, 70, 70, 0.9);
  }

  /* ── Events toggle pill ── */
  .events-toggle-btn {
    padding: 10px 22px;
    border-radius: 24px;
    background: rgba(30, 30, 30, 0.88);
    border: 1px solid rgba(255, 255, 255, 0.22);
    color: rgba(255, 255, 255, 0.87);
    font-size: 0.875rem;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    cursor: pointer;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.45);
    white-space: nowrap;
    touch-action: manipulation;
  }

  /* ── Mobile events bottom sheet ── */
  .mobile-events-sheet {
    background: #1c1c1c;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px 16px 0 0;
    padding: 0 0 env(safe-area-inset-bottom, 16px);
    max-height: 45vh;
    overflow-y: auto;
    box-shadow: 0 -6px 24px rgba(0, 0, 0, 0.5);
  }

  .sheet-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px 10px;
    position: sticky;
    top: 0;
    background: #1c1c1c;
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    z-index: 1;
  }

  .events-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px 16px 16px;
  }

  .mobile-event-item {
    padding: 10px 12px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.07);
  }

  .event-time-badge {
    font-size: 0.7rem;
    color: #888;
    margin-bottom: 2px;
  }

  .event-label {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.87);
    line-height: 1.3;
  }

  .event-ref {
    font-size: 0.7rem;
    color: #666;
    font-style: italic;
    margin-top: 3px;
  }

  .tab-btn {
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.45);
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.13);
    cursor: pointer;
    touch-action: manipulation;
  }

  .tab-active {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.87);
    border-color: rgba(255, 255, 255, 0.28);
  }

  .close-btn {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.07);
    border: 1px solid rgba(255, 255, 255, 0.13);
    color: rgba(255, 255, 255, 0.55);
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    touch-action: manipulation;
    flex-shrink: 0;
  }

  .no-events-msg {
    font-size: 0.875rem;
    color: #666;
    padding: 8px;
    text-align: center;
  }
</style>
