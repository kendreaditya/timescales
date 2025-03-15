<script>
  export let startTime;
  export let endTime;
  export let timeToPixel;
  
  // Calculate tick marks
  let ticks = [];
  $: {
    const range = endTime - startTime;
    const step = range < 10 ? 0.25 :
                 range < 50 ? 1 :
                 range < 200 ? 5 :
                 range < 1000 ? 10 : 50;
    
    ticks = [];
    let time = Math.ceil(startTime / step) * step;
    while (time <= endTime) {
      ticks.push({
        time,
        y: timeToPixel(time)
      });
      time += step;
    }
  }
</script>

<div class="time-scale">
  {#each ticks as tick}
    <div 
      class="tick"
      style="transform: translateY({tick.y}px)"
    >
      <div class="tick-line"></div>
      <div class="tick-label">{tick.time} Ma</div>
    </div>
  {/each}
</div>

<style>
  .time-scale {
    position: relative;
    width: 100%;
    height: 100%;
  }
  
  .tick-line {
    width: 100%;
    height: 1px;
    background: #666;
  }

  .tick-label {
    position: absolute;
    font-size: 12px;
    color: #666;
  }
</style>