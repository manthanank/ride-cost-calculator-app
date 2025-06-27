# Ride Cost Calculator App

This is an Angular-based web application for calculating ride costs. The app allows users to input ride details and receive an estimated cost based on configurable parameters.

## Features

- User-friendly interface for entering ride details
- Real-time cost calculation
- Supports multiple currencies (₹, $, €) and distance units (km, mi)
- Ride history saved locally in your browser
- Export ride history as CSV
- Print ride receipts
- Clear ride history
- Responsive design for mobile and desktop

## Tech Stack & Dependencies

- **Angular 20**
- **Tailwind CSS 4** (configured via `.postcssrc.json` and imported in `src/styles.css`)
- **TypeScript** (strict mode enabled)

## Getting Started

### Prerequisites

- Node.js (v16 or higher recommended)
- npm (v8 or higher recommended)
- Angular CLI (recommended):

  ```sh
  npm install -g @angular/cli
  ```

### Installation

1. Clone the repository:

   ```sh
   git clone <repository-url>
   cd ride-cost-calculator-app
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

### Running the App (Development)

To start the development server:

```sh
ng serve
```

The app will be available at `http://localhost:4200/` by default.

### Running Tests

To execute unit tests:

```sh
ng test
```

### Building for Production

To build the project for production:

```sh
ng build --configuration production
```

The build artifacts will be stored in the `dist/` directory.

## Usage

1. Select your preferred currency (₹, $, €) and distance unit (km, mi).
2. Enter the ride distance, vehicle mileage (km/l), and petrol price per liter.
3. Click **Calculate** to see the total cost.
4. Your ride history is saved locally and shown below the calculator.
5. Export your ride history as a CSV file or print a receipt for any ride.
6. Use **Clear** to remove all ride history.

## Project Structure

- `src/app/` - Main application code (`app.ts`, `app.html`, `app.css`)
- `public/` - Static assets, icons, and manifest (`site.webmanifest`)
- `src/styles.css` - Imports Tailwind CSS
- `.postcssrc.json` - PostCSS config for Tailwind

## Styling

Tailwind CSS is used for utility-first styling. You can customize styles in `src/styles.css` and configure plugins in `.postcssrc.json`.

## PWA & Icons

- The app includes a web manifest and icons for installation on mobile devices.
- **Note:** No service worker is registered by default, so offline support is limited.

## TypeScript

- The project uses strict TypeScript settings for better code quality and maintainability.

## Further Help

To get more help on the Angular CLI, use:

```sh
ng help
```

Or refer to the [Angular CLI documentation](https://angular.io/cli).

## License

[MIT](LICENSE)
