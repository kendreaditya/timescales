<script>
  import HorizontalTimeDivision from "./HorizontalTimeDivision.svelte";

  export let division;
  export let startTime;
  export let endTime;
  export let timeToPixel;
  export let level = 0;
  export let order = 0;

  const LEVEL_INDENT = 10; // px per hierarchy level, from the top

  $: left = timeToPixel(Math.max(startTime, division.start));
  $: right = timeToPixel(Math.min(endTime, division.end));
  $: width = right - left;
  $: visible = division.end >= startTime && division.start <= endTime && width >= 3;

  $: bgColor = `hsl(${((level + 2) * 10) % 360}, 100%, ${100 - Math.exp(-order / 4) * 30}%)`;
  $: topOffset = level * LEVEL_INDENT;
  $: fontSize = Math.max(7, 12 - level * 1.5) + "px";
</script>

{#if visible}
  <div class="htd-wrapper">
    <div
      class="htd-block"
      style="left: {left}px; width: {width}px; top: {topOffset}px; height: calc(100% - {topOffset}px); background-color: {bgColor};"
    >
      {#if width > 14}
        <span class="htd-label" style="font-size: {fontSize};">{division.name}</span>
      {/if}
    </div>

    {#if division.children && division.children.length > 0}
      {#each division.children as child, i}
        <HorizontalTimeDivision
          division={child}
          {startTime}
          {endTime}
          {timeToPixel}
          level={level + 1}
          order={i}
        />
      {/each}
    {/if}
  </div>
{/if}

<style>
  .htd-block {
    position: absolute;
    overflow: hidden;
    transition: background-color 0.2s;
  }

  .htd-label {
    position: absolute;
    left: 3px;
    top: 2px;
    white-space: nowrap;
    color: rgba(0, 0, 0, 0.75);
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: calc(100% - 6px);
    pointer-events: none;
    line-height: 1.2;
  }
</style>
