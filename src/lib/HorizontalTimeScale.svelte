<script>
  export let startTime;
  export let endTime;
  export let timeToPixel;

  let ticks = [];
  $: {
    const range = endTime - startTime;
    const step =
      range < 10 ? 0.25 :
      range < 50 ? 1 :
      range < 200 ? 5 :
      range < 1000 ? 10 : 50;

    ticks = [];
    let t = Math.ceil(startTime / step) * step;
    while (t <= endTime) {
      ticks.push({ time: t, x: timeToPixel(t) });
      t += step;
    }
  }
</script>

<div class="hts">
  {#each ticks as tick}
    <div class="tick" style="left: {tick.x}px">
      <div class="tick-line"></div>
      <div class="tick-label">{tick.time} Ma</div>
    </div>
  {/each}
</div>

<style>
  .hts {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .tick {
    position: absolute;
    top: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    transform: translateX(-50%);
  }

  .tick-line {
    width: 1px;
    height: 7px;
    background: #555;
    flex-shrink: 0;
  }

  .tick-label {
    font-size: 8px;
    color: #666;
    white-space: nowrap;
    margin-top: 2px;
    line-height: 1;
  }
</style>
