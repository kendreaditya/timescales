# Timescales

A visual comparison of geological and purāṇic time scales with interactive navigation.

## Overview

This application provides an interactive visualization of both geological and purāṇic time scales, allowing users to compare and explore various time periods and significant events across both systems. The timeline spans from present day to 4.54 billion years ago (the approximate age of Earth) with the ability to zoom and navigate throughout the entire history.

## Features

- **Interactive Timeline**: Zoom in/out and pan through time using mouse wheel or touch gestures
- **Dual Time Scales**: Side-by-side comparison of geological and purāṇic time periods
- **Event Markers**: Important events from both systems displayed at appropriate time points
- **Responsive Design**: Works across devices with touch support
- **Visual Hierarchy**: Time periods are displayed with nested hierarchy for clear understanding

## Getting Started

### Prerequisites

- Node.js (v16 or newer)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd timescales
```

2. Install dependencies:
```bash
npm install
# or
yarn
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:5173`

## How to Use

- **Zoom**: Use mouse wheel or pinch gesture on touchscreen
- **Pan**: Click and drag or touch and drag to move through time
- **View Details**: Hover over time periods or events to see additional information

## Technology Stack

- [Svelte](https://svelte.dev/) - Frontend framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety and improved developer experience
- [Vite](https://vitejs.dev/) - Fast build tool and development server
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

## Project Structure

```
/src
  /assets
    - geologicevents.json  # Geological events data
    - geologictime.json    # Geological time periods data
    - puranicevents.json   # Purāṇic events data
    - puranictime.ts       # Purāṇic time periods generation
  /lib
    - TimeDivision.svelte  # Time division component
    - TimeScale.svelte     # Timeline scale component
    - GeologicEvents.svelte # Geological events component
    - PuranicEvents.svelte # Purāṇic events component
  - App.svelte             # Main application component
  - main.ts               # Application entry point
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the [MIT License](LICENSE).