<script>
  import { spring } from "svelte/motion";
  import { onMount } from "svelte";
  import geologicalTime from "./assets/geologictime.json";
  import { generatePuranicPeriods } from "./assets/puranictime";
  import TimeDivision from "./lib/TimeDivision.svelte";
  import TimeScale from "./lib/TimeScale.svelte";
  import GeologicEvents from "./lib/GeologicEvents.svelte";
  import PuranicEvents from "./lib/PuranicEvents.svelte";
  import HorizontalTimeDivision from "./lib/HorizontalTimeDivision.svelte";
  import HorizontalTimeScale from "./lib/HorizontalTimeScale.svelte";
  import geologicEventsData from "./assets/geologicevents.json";
  import puranicEventsData from "./assets/puranicevents.json";
  import { calculateEventTime } from "./lib/puranicEventsUtils";

  const puranictime = generatePuranicPeriods();

  const MIN_TIME = 0;
  const MAX_TIME = 4540;
  const MAX_SCALE = 1000;

  // Layout state
  let isMobile = false;
  let containerHeight = 4540; // desktop vertical canvas height
  let containerWidth = 375;   // mobile horizontal canvas width (updated on mount)

  let scale = spring(1);
  let centerTime = spring(MAX_TIME / 2);
  let isDragging = false;
  let lastDragPos = null;
  let touchDistance = null;

  // The dimension used for time-range calculations (width on mobile, height on desktop)
  $: containerDimension = isMobile ? containerWidth : containerHeight;
  $: effectiveMinScale = containerDimension / MAX_TIME;
  $: visibleTimeRange = containerDimension / $scale;
  $: startTime = Math.max(MIN_TIME, $centerTime - visibleTimeRange / 2);
  $: endTime = Math.min(MAX_TIME, $centerTime + visibleTimeRange / 2);

  // Precomputed puranic event times (shared between desktop sidebar and mobile inline events)
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

  function timeToPixel(time) {
    return (time - startTime) * $scale;
  }

  function pixelToTime(pixel) {
    return startTime + pixel / $scale;
  }

  // ── Desktop: scroll-wheel zoom (vertical, centred on mouse position) ──
  function handleWheel(event) {
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    const mouseY = event.clientY - rect.top;
    const mouseTime = pixelToTime(mouseY);
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(effectiveMinScale, Math.min(MAX_SCALE, $scale * zoomFactor));
    const newVisibleTimeRange = containerHeight / newScale;
    const newStartTime = mouseTime - (mouseY / containerHeight) * newVisibleTimeRange;
    const newCenterTime = newStartTime + newVisibleTimeRange / 2;
    scale.set(newScale);
    centerTime.set(
      Math.max(MIN_TIME + newVisibleTimeRange / 2,
               Math.min(MAX_TIME - newVisibleTimeRange / 2, newCenterTime))
    );
  }

  // ── Touch: shared between mobile (horizontal) and desktop (vertical) ──
  function handleTouchStart(event) {
    if (event.touches.length === 2) {
      const t1 = event.touches[0], t2 = event.touches[1];
      touchDistance = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
    } else if (event.touches.length === 1) {
      isDragging = true;
      // Mobile pans horizontally; desktop pans vertically
      lastDragPos = isMobile ? event.touches[0].clientX : event.touches[0].clientY;
    }
  }

  function handleTouchMove(event) {
    event.preventDefault();
    if (event.touches.length === 2) {
      // Pinch zoom — same for both orientations
      const t1 = event.touches[0], t2 = event.touches[1];
      const newDistance = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      if (touchDistance) {
        const zoomFactor = newDistance / touchDistance;
        const newScale = Math.max(effectiveMinScale, Math.min(MAX_SCALE, $scale * zoomFactor));
        scale.set(newScale, { hard: true });
      }
      touchDistance = newDistance;
    } else if (isDragging) {
      const pos = isMobile ? event.touches[0].clientX : event.touches[0].clientY;
      const delta = pos - lastDragPos;
      const adaptive = Math.max(1, Math.log10(Math.max(1, $scale)) * 2);
      const deltaTime = (-delta * adaptive) / $scale;
      centerTime.set(
        Math.max(MIN_TIME + visibleTimeRange / 2,
                 Math.min(MAX_TIME - visibleTimeRange / 2, $centerTime + deltaTime)),
        { hard: true }
      );
      lastDragPos = pos;
    }
  }

  function handleTouchEnd() {
    isDragging = false;
    touchDistance = null;
    lastDragPos = null;
  }

  // ── Desktop: mouse drag (vertical) ──
  function handleMouseDown(event) {
    isDragging = true;
    lastDragPos = event.clientY;
  }

  function handleMouseMove(event) {
    if (!isDragging) return;
    const deltaY = event.clientY - lastDragPos;
    const adaptive = Math.max(1, Math.log10($scale) * 2);
    const deltaTime = (-deltaY * adaptive) / $scale;
    centerTime.set(
      Math.max(MIN_TIME + visibleTimeRange / 2,
               Math.min(MAX_TIME - visibleTimeRange / 2, $centerTime + deltaTime)),
      { hard: true }
    );
    lastDragPos = event.clientY;
  }

  function handleMouseUp() {
    isDragging = false;
  }

  onMount(() => {
    function updateForViewport() {
      const mobile = window.innerWidth < 768;
      isMobile = mobile;
      if (mobile) {
        containerWidth = window.innerWidth;
        // Start showing the Phanerozoic era (~600 Ma window centred at 300 Ma)
        const initScale = containerWidth / 600;
        scale.set(initScale, { hard: true });
        centerTime.set(300, { hard: true });
      } else {
        containerHeight = 4540;
        // Restore desktop defaults if resizing back from mobile
        scale.set(1, { hard: true });
        centerTime.set(MAX_TIME / 2, { hard: true });
      }
    }

    updateForViewport();
    window.addEventListener("resize", updateForViewport);
    return () => window.removeEventListener("resize", updateForViewport);
  });
</script>

<section>
  <!-- ── Header ── -->
  <header class="my-3 md:my-6 text-center px-4">
    <h1 class="text-xl md:text-2xl font-bold">
      Geological & Purāṇic Time Scales
    </h1>
    <div class="text-xs hidden md:block" style="color: #888;">
      Scroll to zoom · Drag to pan
    </div>
    <div class="text-xs md:hidden" style="color: #888;">
      Swipe to pan · Pinch to zoom
    </div>
    <div class="mt-1 md:mt-3 text-sm font-semibold" style="color: #aaa;">
      {startTime.toFixed(1)} – {endTime.toFixed(1)} Ma
    </div>
  </header>

  {#if isMobile}
    <!-- ══════════════════════════════════════════════
         MOBILE  —  horizontal timeline
         Layout (top → bottom):
           Geologic event labels  (55 px)
           Geologic strip         (68 px)
           Time scale             (22 px)
           Puranic strip          (68 px)
           Puranic event labels   (55 px)
         Total ≈ 268 px, fits any phone above the fold.
         Swipe left/right to pan time; pinch to zoom.
    ═══════════════════════════════════════════════════ -->
    <div
      class="mobile-h-root no-select"
      style="width: {containerWidth}px;"
      on:touchstart={handleTouchStart}
      on:touchmove={handleTouchMove}
      on:touchend={handleTouchEnd}
    >
      <!-- Geologic event labels — vertical text pointing down toward the strip -->
      <div class="events-row events-top">
        {#each visibleGeologicEvents as event}
          <div class="hevent-top" style="left: {timeToPixel(event.time)}px">
            <div class="hevent-label-top">{event.event}</div>
            <div class="hevent-tick"></div>
          </div>
        {/each}
      </div>

      <!-- Geologic timeline strip -->
      <div class="h-strip">
        <span class="strip-label">GEOLOGIC</span>
        {#each geologicalTime as division, i}
          <HorizontalTimeDivision
            {division} {startTime} {endTime} {timeToPixel}
            level={0} order={i}
          />
        {/each}
      </div>

      <!-- Shared time scale -->
      <div class="h-scale-row">
        <HorizontalTimeScale {startTime} {endTime} {timeToPixel} />
      </div>

      <!-- Puranic timeline strip -->
      <div class="h-strip">
        <span class="strip-label">PURĀṆIC</span>
        {#each puranictime as division, i}
          <HorizontalTimeDivision
            {division} {startTime} {endTime} {timeToPixel}
            level={0} order={i}
          />
        {/each}
      </div>

      <!-- Puranic event labels — vertical text pointing up toward the strip -->
      <div class="events-row events-bottom">
        {#each visiblePuranicEvents as event}
          <div class="hevent-bottom" style="left: {timeToPixel(event.time)}px">
            <div class="hevent-tick"></div>
            <div class="hevent-label-bottom">{event.event}</div>
          </div>
        {/each}
      </div>
    </div>

  {:else}
    <!-- ══════════════════════════════════════════════
         DESKTOP  —  original vertical layout (unchanged)
    ═══════════════════════════════════════════════════ -->
    <div
      class="mx-auto no-select max-w-screen-2xl"
      style="height: {containerHeight}px;"
    >
      <div class="timelines-wrapper">
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
                {division} {startTime} {endTime} {timeToPixel}
                level={0} order={index}
              />
            {/each}
          </div>

          <div class="w-16">
            <TimeScale {startTime} {endTime} {timeToPixel} />
          </div>

          <div class="timeline">
            {#each puranictime as division, index}
              <TimeDivision
                {division} {startTime} {endTime} {timeToPixel}
                level={0} order={index}
              />
            {/each}
          </div>
        </div>

        <div class="timeline-events">
          <PuranicEvents
            {startTime} {endTime} {timeToPixel}
            puranicPeriods={puranictime}
          />
        </div>
      </div>
    </div>
  {/if}
</section>

<style>
  /* ── Shared ── */
  .no-select {
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
  }

  /* ── Desktop vertical layout ── */
  .timeline-events {
    width: 256px;
  }

  .timelines-wrapper {
    display: flex;
    width: 100%;
    justify-content: center;
    gap: 1.5rem;
  }

  .timeline {
    position: relative;
    flex: 1;
    height: 100%;
    max-width: 384px;
  }

  /* ── Mobile horizontal layout ── */
  .mobile-h-root {
    touch-action: none;
    overflow: hidden;
  }

  /* Event label rows */
  .events-row {
    position: relative;
    height: 55px;
    overflow: hidden;
  }

  /* Geologic events above the strip: label on top, tick at bottom */
  .hevent-top {
    position: absolute;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    transform: translateX(-50%);
  }

  .hevent-label-top {
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    font-size: 9px;
    color: rgba(255, 255, 255, 0.7);
    white-space: nowrap;
    overflow: hidden;
    max-height: 46px;
    line-height: 1.1;
  }

  .hevent-tick {
    width: 1px;
    height: 6px;
    background: #666;
    flex-shrink: 0;
  }

  /* Puranic events below the strip: tick on top, label below */
  .hevent-bottom {
    position: absolute;
    top: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    transform: translateX(-50%);
  }

  .hevent-label-bottom {
    writing-mode: vertical-lr;
    font-size: 9px;
    color: rgba(255, 255, 255, 0.7);
    white-space: nowrap;
    overflow: hidden;
    max-height: 46px;
    line-height: 1.1;
  }

  /* Timeline strips */
  .h-strip {
    position: relative;
    height: 68px;
    overflow: hidden;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .strip-label {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 10;
    background: rgba(20, 20, 20, 0.82);
    padding: 2px 5px;
    font-size: 7px;
    letter-spacing: 0.1em;
    color: rgba(255, 255, 255, 0.38);
    border-bottom-right-radius: 3px;
    pointer-events: none;
  }

  /* Time scale row */
  .h-scale-row {
    position: relative;
    height: 22px;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    background: rgba(0, 0, 0, 0.15);
  }
</style>
