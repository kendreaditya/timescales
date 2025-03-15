// puranictime.ts
export interface TimeUnit {
  name: string;
  start: number;
  end: number;
  color?: string;
  children?: TimeUnit[];
}

const generateYugas = (startTime: number, divya_to_solar_factor = 0.00036, yugaDurations = { kali: 1200, dwapara: 2400, treta: 3600, satya: 4800 }): TimeUnit[] => {
  for (const key in yugaDurations) {
    if (yugaDurations.hasOwnProperty(key)) {
      yugaDurations[key] *= divya_to_solar_factor;
    }
  }

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

const generateChaturYugas = (startTime: number, cycleNumber: number, divya_to_solar_factor = 0.00036): TimeUnit => {
  return {
    name: `C. ${cycleNumber}`,
    start: startTime,
    end: startTime + ((4.32 / 0.00036) * divya_to_solar_factor),
    children: generateYugas(startTime)
  };
};

export const generatePuranicPeriods = (divya_to_solar_factor = 0.00036): TimeUnit[] => {
  const sandhyaDuration = 4800 * divya_to_solar_factor;
  const currentManvantara = 7;
  const cyclesPerManvantara = 71;
  const currentCycle = 28;

  let periods: TimeUnit[] = [];
  let currentTime = 0;

  // Current Manvantara (7th)
  let currentManvantaraChildren: TimeUnit[] = [];
  
  // Current cycle (28th) with special timing
  let currentChaturYugas = generateYugas(currentTime, divya_to_solar_factor, { kali: (0.005/0.00036), dwapara: 2400, treta: 3600, satya: 4800 });
  currentManvantaraChildren.push({
    name: "C. 28",
    start: currentTime,
    end: currentChaturYugas[3].end,
    children: currentChaturYugas,
  });
  currentTime += currentChaturYugas[3].end;

  // Remaining cycles in current Manvantara
  for (let i = currentCycle - 1; i >= 1; i--) {
    currentManvantaraChildren.push(generateChaturYugas(currentTime, i));
    currentTime += ((4.32 / 0.00036) * divya_to_solar_factor);
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
      currentTime += ((4.32 / 0.00036) * divya_to_solar_factor);
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