<script>
  import TimeDivision from "./TimeDivision.svelte";

  export let division;
  export let startTime;
  export let endTime;
  export let timeToPixel;
  export let level = 0;
  export let order = 0;

  // Compute styles algorithmically
  let styles = {
    class: `level-${level}`,
    fontSize: `${16 - level * 2}px`,
    leftOffset: level * 35,
    backgroundColor: `hsl(${((level + 2) * 10) % 360}, 100%, ${100 - Math.exp(-order / 4) * 30}%)`,
  };

  // Determine if the division has children
  $: hasChildren = division.children && division.children.length > 0;
</script>

{#if division.end >= startTime && division.start <= endTime && (timeToPixel(Math.min(endTime, division.end)) - timeToPixel(Math.max(startTime, division.start))) >= 5}
  <div class="time-division-wrapper">
    <!-- Positioned element -->
    <div
      class="time-division {styles.class}"
      style="
        top: {timeToPixel(Math.max(startTime, division.start))}px;
        height: {timeToPixel(Math.min(endTime, division.end)) - timeToPixel(Math.max(startTime, division.start))}px;
        left: {styles.leftOffset}px;
        width: calc(100% - {styles.leftOffset}px);
        background-color: {styles.backgroundColor};
      "
    > 
      <div
        class="label {hasChildren ? 'vertical-text' : ''}"
        style="font-size: {styles.fontSize}"
      >
        <span class="font-semibold">{division.name}</span>
        {#if hasChildren}
          <div class="time-label">{division.start.toFixed(2)} - {division.end.toFixed(2)} Ma</div>
        {:else}
          <span class="time-label">{division.start.toFixed(2)} - {division.end.toFixed(2)} Ma</span>
        {/if}
      </div>
    </div>

    <!-- Nested child components -->
    {#if hasChildren}
      {#each division.children as child, index}
        <TimeDivision
          division={child}
          {startTime}
          {endTime}
          {timeToPixel}
          level={level + 1}
          order={index}
        />
      {/each}
    {/if}
  </div>
{/if}

<style>
  .time-division {
    position: absolute;
    transition: background-color 0.2s;
    overflow: hidden;
  }

  .label {
    position: absolute;
    left: 10px;
    top: 5px;
    white-space: nowrap;
    color: rgba(0, 0, 0, 0.8);
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
    max-height: 100%;
  }

  .vertical-text {
    writing-mode: vertical-rl;
    bottom: 0;
    left: 5px;
    transform: rotate(180deg);
    text-align: center;
  }

  .vertical-text .time-label {
    margin-right: 5px;
  }

  .time-label {
    margin-left: 10px;
    font-size: 12px;
    color:rgba(0, 0, 0, 0.6);
  }
</style>