interface Event {
  // time: number;
  start: number;
  end: number;
  event: string;
  reference?: string;
}

interface TimelineOptions {
  startTime?: number;
  endTime?: number;
  timeToPixel: (time: number) => number;
}

class Timeline {
  container: HTMLElement;
  data: Event[];
  startTime: number;
  endTime: number;
  timeToPixel: (time: number) => number;
  labelSpacing: number;
  idealTicksContainer: HTMLElement | null = null;
  adjustedTicksContainer: HTMLElement | null = null;
  labelsContainer: HTMLElement | null = null;
  connectingLinesContainer: HTMLElement | null = null;
  visibleEvents: Event[] = [];
  tickGap: number = 20; // Increased gap between ideal and adjusted columns
  
  constructor(container: HTMLElement, data: Event[], { startTime, endTime, timeToPixel }: TimelineOptions) {
    if (!container) throw new Error("Container element is required");
    this.container = container;
    this.data = data;
    console.log("Data", data);
    this.startTime = startTime || 0;
    this.endTime = endTime || 100;
    this.timeToPixel = timeToPixel;
    this.labelSpacing = 0;
    this.init();
    console.log("Timeline initialized with", this.data.length, "events");
  }

  init() {
    if (this.container) {
      this.container.innerHTML = '';
    }
    
    // Updated HTML structure to support two columns
    this.container.innerHTML = `
      <div class="timeline-container">
        <div class="ideal-ticks-column"></div>
        <svg class="connecting-lines"></svg>
        <div class="adjusted-column">
          <div class="adjusted-ticks"></div>
          <div class="event-labels"></div>
        </div>
      </div>
    `;
    
    // Add base styles
    const style = document.createElement('style');
    style.textContent = `
      .timeline-container {
        position: relative;
        display: grid;
        grid-template-columns: 5px ${this.tickGap}px 1fr;
        width: 100%;
        height: 100%;
      }
      
      .ideal-ticks-column {
        position: relative;
      }
      
      .adjusted-column {
        position: relative;
      }
      
      .connecting-lines {
        position: relative;
        height: 100%;
        width: 100%;
      }
      
      .tick-line {
        position: absolute;
        height: 2px;
        background: rgb(146 146 146);
      }
      
      .ideal-tick {
        right: 0;
        width: 10px;
      }
      
      .adjusted-tick {
        left: 0;
        width: 10px;
      }
      
      .event-labels {
        position: relative;
        margin-left: 25px;
      }
      
      .event {
        position: absolute;
        left: 0;
      }
    `;
    document.head.appendChild(style);
    
    this.idealTicksContainer = this.container.querySelector(".ideal-ticks-column");
    this.adjustedTicksContainer = this.container.querySelector(".adjusted-ticks");
    this.labelsContainer = this.container.querySelector(".event-labels");
    this.connectingLinesContainer = this.container.querySelector(".connecting-lines");
    
    // Set SVG dimensions and properties
    if (this.connectingLinesContainer instanceof SVGElement) {
      this.connectingLinesContainer.setAttribute('preserveAspectRatio', 'none');
      this.connectingLinesContainer.style.overflow = 'visible';
    }
    
    this.visibleEvents = this.data
      .filter((event) => event.end <= this.endTime && event.start >= this.startTime)
      .sort((a, b) => a.start - b.start);
      
    this.renderEvents();
  }

  renderEvents() {
    let lastLabelBottom = -Infinity;
    
    this.visibleEvents.forEach((event, index) => {
      const idealPosition = this.timeToPixel(event.start);
      const endPosition = this.timeToPixel(event.end);
      const adjustedPosition = Math.max(
        idealPosition,
        lastLabelBottom + this.labelSpacing
      );

      // Create and render ideal tick mark
      const idealTick = this.createTickMark(event, idealPosition, 'ideal');
      this.idealTicksContainer?.appendChild(idealTick);

      // Create and render adjusted tick mark
      const adjustedTick = this.createTickMark(event, adjustedPosition, 'adjusted');
      this.adjustedTicksContainer?.appendChild(adjustedTick);

      // Create connecting line if positions are different
      this.createConnectingLine(idealPosition, endPosition);

      // Create and render label
      const label = this.createLabel(event);
      label.style.top = `${adjustedPosition}px`;
      this.labelsContainer?.appendChild(label);

      lastLabelBottom = adjustedPosition + label.getBoundingClientRect().height;
    });
  }

  createTickMark(event: Event, position: number, type: 'ideal' | 'adjusted'): HTMLElement {
    const tick = document.createElement("div");
    tick.className = `tick-line ${type}-tick`;
    tick.style.top = `${position}px`;
    return tick;
  }

  createConnectingLine(idealPosition: number, adjustedPosition: number) {
    if (!(this.connectingLinesContainer instanceof SVGElement)) return;
    
    const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
    
    // Calculate the points for the diagonal line
    const startX = 0; // Start at the left edge of the SVG (end of ideal column)
    const endX = this.tickGap; // End at the right edge of the SVG (start of adjusted column)
    const startY = idealPosition;
    const endY = adjustedPosition;
    
    // Create SVG path with curved line
    const d = `M ${startX} ${startY+1} L ${endX} ${endY+1}`;
    
    line.setAttribute("d", d);
    line.setAttribute("stroke", "rgb(146 146 146)");
    line.setAttribute("stroke-width", "2");
    line.setAttribute("stroke-linecap", "round"); // Add rounded edges
    
    this.connectingLinesContainer.appendChild(line);
  }

  createLabel(event: Event): HTMLElement {
    const label = document.createElement("div");
    label.className = "event";
    label.innerHTML = `
      <div class="event-content">
        <div class="event-time">${event.start.toFixed(2)} Ma</div>
        <div class="event-name">${event.event}</div>
        ${event.reference ? `<div class="event-reference">${event.reference}</div>` : ""}
      </div>
    `;
    return label;
  }
}

export default Timeline;