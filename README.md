# Ricevuta Occasionale (Italian Receipt Generator)

A modern React application for generating, signing, and printing "Prestazione Occasionale" receipts (Italian occasional self-employment receipts).

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-blue)
![Vite](https://img.shields.io/badge/Vite-7-purple)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-cyan)

## 📋 Overview

This tool simplifies the creation of receipts for occasional work in Italy. It automatically calculates the withholding tax (Ritenuta d'Acconto - 20%) and the net amount, providing a clean, printable format.

## ✨ Features

- **Real-time Preview**: See the receipt update instantly as you edit details.
- **Automatic Calculations**: Automatically computes Gross Amount, Withholding Tax (20%), and Net Amount.
- **Digital Signature**:
  - **Draw**: Sign directly on the screen.
  - **Type**: Generate a signature from text.
  - **Pen Mode**: Simulates a realistic pen stroke with smooth interpolation.
- **Print & PDF**: Uses the browser's native print function (optimized with CSS `@media print`) to save as PDF or print directly.
- **Responsive Design**: Works on desktop and mobile devices.

## 🛠️ Tech Stack

- **Framework**: [React](https://react.dev/) (v19)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (v4)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Signature**: [react-signature-canvas](https://github.com/agilgur5/react-signature-canvas)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Alessandroinfo/ricevuta-occasionale.git
   cd ricevuta-occasionale
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser at `http://localhost:5173`.

## 📦 Building for Production

To create a production-ready build:

```bash
npm run build
```

The output will be in the `dist` directory.

## 📄 License

This project is licensed under the MIT License.
