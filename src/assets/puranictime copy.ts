// puranictime.ts -- orginal with solar as defults
export interface TimeUnit {
  name: string;
  start: number;
  end: number;
  color?: string;
  children?: TimeUnit[];
}

const generateYugas = (startTime: number, yugaDurations = { kali: 0.432, dwapara: 0.864, treta: 1.296, satya: 1.728 }): TimeUnit[] => {
  return [
    {
      name: "Kali Yuga",
      start: startTime,
      end: startTime + yugaDurations.kali,
    },
    {
      name: "Dwapara Yuga",
      start: startTime + yugaDurations.kali,
      end: startTime + yugaDurations.kali + yugaDurations.dwapara,
    },
    {
      name: "Treta Yuga",
      start: startTime + yugaDurations.kali + yugaDurations.dwapara,
      end: startTime + yugaDurations.kali + yugaDurations.dwapara + yugaDurations.treta,
    },
    {
      name: "Satya Yuga",
      start: startTime + yugaDurations.kali + yugaDurations.dwapara + yugaDurations.treta,
      end: startTime + yugaDurations.kali + yugaDurations.dwapara + yugaDurations.treta + yugaDurations.satya,
    },
  ];
};

const generateChaturYugas = (startTime: number, cycleNumber: number): TimeUnit => {
  return {
    name: `C. ${cycleNumber}`,
    start: startTime,
    end: startTime + 4.32,
    children: generateYugas(startTime)
  };
};

export const generatePuranicPeriods = (): TimeUnit[] => {
  const manvantaraDuration = 306.72;
  const sandhyaDuration = 1.728;
  const currentManvantara = 7;
  const cyclesPerManvantara = 71;
  const currentCycle = 28;

  let periods: TimeUnit[] = [];
  let currentTime = 0;

  // Current Manvantara (7th)
  let currentManvantaraChildren: TimeUnit[] = [];
  
  // Current cycle (28th) with special timing
  currentManvantaraChildren.push({
    name: "C. 28",
    start: currentTime,
    end: currentTime + 1.728 + 1.296 + 0.864 + 0.005,
    children: generateYugas(currentTime, { kali: 0.005, dwapara: 0.864, treta: 1.296, satya: 1.728 })
  });
  currentTime += 1.728 + 1.296 + 0.864 + 0.005;

  // Remaining cycles in current Manvantara
  for (let i = currentCycle - 1; i >= 1; i--) {
    currentManvantaraChildren.push(generateChaturYugas(currentTime, i));
    currentTime += 4.32;
  }

  periods.push({
    name: "Manvantara 7",
    start: 0,
    end: currentTime,
    children: currentManvantaraChildren
  });

  // Add Sandhya after current Manvantara
  periods.push({
    name: "Sandhya 7",
    start: currentTime,
    end: currentTime + sandhyaDuration
  });

  currentTime += sandhyaDuration;

  // Previous Manvantaras (6 to 1)
  for (let i = currentManvantara - 1; i >= 1; i--) {
    let manvantaraChildren: TimeUnit[] = [];
    const manvantaraStart = currentTime;

    for (let cycle = cyclesPerManvantara; cycle >= 1; cycle--) {
      manvantaraChildren.push(generateChaturYugas(currentTime, cycle));
      currentTime += 4.32;
    }

    periods.push({
      name: `Manvantara ${i}`,
      start: manvantaraStart,
      end: currentTime,
      children: manvantaraChildren
    });

    // Add Sandhya after each Manvantara
    periods.push({
      name: `Sandhya ${i}`,
      start: currentTime,
      end: currentTime + sandhyaDuration
    });
    currentTime += sandhyaDuration;
  }

  return periods;
};