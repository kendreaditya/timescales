// lib/puranicEventsUtils.ts
export function calculateEventTime(event: PuranicEvent, puranicPeriods: TimeUnit[]): number {
  // Handle Sandhya periods
  if (event.manvantar_sandhya) {
    const sandhya = puranicPeriods.find(p => 
      p.name === `Sandhya ${event.manvantar_sandhya}`);
    
    if (sandhya) {
      switch (event.position) {
        case "end": return sandhya.start;
        case "middle": return (sandhya.start + sandhya.end) / 2;
        case "start": return sandhya.end;
        default: return sandhya.start;
      }
    }
    return 0;
  }

  // Rest of the function remains the same...
  const manvantara = puranicPeriods.find(p => 
    p.name === `Manvantara ${event.manvantar}`);
  
  if (!manvantara) return 0;

  switch (event.position) {
    case "end": return manvantara.start;
    case "middle": return (manvantara.start + manvantara.end) / 2;
    case "start": return manvantara.end;
    case "range":
      if (event.chaturyuga && manvantara.children) {
        const chaturYuga = manvantara.children.find(c => 
          c.name === `C. ${event.chaturyuga}`);
        
        if (chaturYuga && event.yuga && chaturYuga.children) {
          const yuga = chaturYuga.children.find(y => 
            y.name.toLowerCase().startsWith(event.yuga.toLowerCase()));
          return yuga ? yuga.start : chaturYuga.start;
        }
        return chaturYuga ? chaturYuga.start : manvantara.start;
      }
      return manvantara.start;
    default:
      return manvantara.start;
  }
}

export function calculateEventTimes(event: PuranicEvent, puranicPeriods: TimeUnit[]): { start: number, end: number } {
  if (event.manvantar_sandhya) {
    const sandhya = puranicPeriods.find(p => 
      p.name === `Sandhya ${event.manvantar_sandhya}`);
    
    if (sandhya) {
      return { start: sandhya.start, end: sandhya.end };
    }
    return { start: 0, end: 0 };
  }

  const manvantara = puranicPeriods.find(p => 
    p.name === `Manvantara ${event.manvantar}`);
  
  if (!manvantara) return { start: 0, end: 0 };

  switch (event.position) {
    case "end": return { start: manvantara.start, end: manvantara.end };
    case "middle": return { start: (manvantara.start + manvantara.end) / 2, end: (manvantara.start + manvantara.end) / 2 };
    case "start": return { start: manvantara.start, end: manvantara.end };
    case "range":
      if (event.chaturyuga && manvantara.children) {
        const chaturYuga = manvantara.children.find(c => 
          c.name === `C. ${event.chaturyuga}`);
        
        if (chaturYuga && event.yuga && chaturYuga.children) {
          const yuga = chaturYuga.children.find(y => 
            y.name.toLowerCase().startsWith(event.yuga.toLowerCase()));
          return yuga ? { start: yuga.start, end: yuga.end } : { start: chaturYuga.start, end: chaturYuga.end };
        }
        return chaturYuga ? { start: chaturYuga.start, end: chaturYuga.end } : { start: manvantara.start, end: manvantara.end };
      }
      return { start: manvantara.start, end: manvantara.end };
    default:
      return { start: manvantara.start, end: manvantara.end };
  }
}