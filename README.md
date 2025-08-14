
<div align="center">
  <h1>🎨 LetMeSketch</h1>
  <p>
    <strong>A modern, collaborative drawing application inspired by Excalidraw</strong>
  </p>
  <p>
    Create beautiful hand-drawn style diagrams, wireframes, and sketches with real-time collaboration
  </p>
</div>

<div align="center">

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8)](https://tailwindcss.com/)

</div>

## ✨ Features

- 🎨 **Intuitive Drawing Tools** - Pen, shapes, arrows, text, and more
- 🤝 **Real-time Collaboration** - Work together with others in real-time
- 🌓 **Dark/Light Mode** - Seamless theme switching with theme-aware stroke colors
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- ⚡ **Perfect-Freehand Integration** - Realistic pressure-sensitive drawing
- 🔄 **Undo/Redo** - Full history management with 50-step memory
- 🔍 **Zoom & Pan** - Navigate large canvases with ease
- 📤 **Export Options** - PNG, SVG, and JSON export formats
- 💾 **Auto-save** - Never lose your work with automatic local storage
- ⌨️ **Keyboard Shortcuts** - Speed up your workflow
- 🎯 **Precise Selection** - Select, move, resize, and rotate elements
- 📐 **Grid System** - Optional grid for precise alignment
- ✏️ **Double-Click Text Creation** - Double-click anywhere to add text instantly
- 📝 **Inline Text Editing** - Edit text directly on canvas without modals
- 🎨 **Advanced Color Picker** - Stroke and fill color selection with opacity control

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/HassanXTech/letmesketch.git
cd letmesketch
````

2. **Install dependencies**

```bash
npm install
# or
yarn install
```

3. **Set up environment variables**

```bash
cp .env.example .env.local
```

Add your Supabase credentials for collaboration features.

4. **Run the development server**

```bash
npm run dev
# or
yarn dev
```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Tech Stack

* **Framework**: [Next.js 14](https://nextjs.org/) with App Router
* **Language**: [TypeScript](https://www.typescriptlang.org/)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/)
* **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
* **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
* **Drawing**: [Perfect-Freehand](https://github.com/steveruizok/perfect-freehand)
* **Database**: [Supabase](https://supabase.com/) (for collaboration)
* **Deployment**: [Vercel](https://vercel.com/)

## ⌨️ Keyboard Shortcuts

| Action      | Shortcut               |
| ----------- | ---------------------- |
| Select Tool | `V`                    |
| Pen Tool    | `P`                    |
| Rectangle   | `R`                    |
| Circle      | `O`                    |
| Arrow       | `A`                    |
| Line        | `L`                    |
| Text        | `T`                    |
| Hand Tool   | `H`                    |
| Undo        | `Ctrl + Z`             |
| Redo        | `Ctrl + Y`             |
| Delete      | `Delete` / `Backspace` |
| Zoom In     | `Ctrl + +`             |
| Zoom Out    | `Ctrl + -`             |
| Reset Zoom  | `Ctrl + 0`             |
| Toggle Grid | `Ctrl + '`             |

## 🎯 Usage

### Drawing

1. Select a tool from the toolbar
2. Click and drag on the canvas to draw
3. Use the color picker and stroke width controls to customize your drawings

### Text Creation

1. **Method 1**: Select the text tool (T) and click on the canvas
2. **Method 2**: Double-click anywhere on the canvas to instantly create text
3. Type your text and press Enter to confirm, or Escape to cancel

### Text Editing

1. Use the select tool (V) and double-click on existing text to edit it
2. Text editing happens directly on the canvas for a seamless experience

### Collaboration

1. Click the "Collaborate" button in the top-right
2. Create a new session or join an existing one
3. Share the session link with others
4. See real-time cursors and changes from collaborators

### Exporting

1. Use the Export/Import buttons in the top-left
2. Choose from PNG, SVG, or JSON formats
3. Save your work locally or export for sharing

## 🎨 Advanced Features

### Theme-Aware Drawing

* Stroke colors automatically adjust when switching between light and dark modes
* White strokes in dark mode for better visibility
* Grid visibility optimized for both themes

### Grid System

* Toggle grid visibility with the grid button in the toolbar
* Snap-to-grid functionality for precise alignment
* Customizable grid spacing and opacity

### Selection and Manipulation

* Multi-select with Shift+click
* Resize handles for precise scaling
* Drag to move selected objects
* Visual feedback with selection indicators

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**

```bash
git checkout -b feature/amazing-feature
```

3. **Make your changes**
4. **Commit your changes**

```bash
git commit -m 'Add some amazing feature'
```

5. **Push to the branch**

```bash
git push origin feature/amazing-feature
```

6. **Open a Pull Request**

### Development Guidelines

* Follow the existing code style
* Add TypeScript types for new features
* Test your changes thoroughly
* Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

* Inspired by [Excalidraw](https://excalidraw.com/)
* Built with [Perfect-Freehand](https://github.com/steveruizok/perfect-freehand) for realistic drawing
* UI components from [shadcn/ui](https://ui.shadcn.com/)

## 📧 Contact

**Hassan** - [@HassanXTech](https://github.com/HassanXTech)

Project Link: [https://github.com/HassanXTech/letmesketch](https://github.com/HassanXTech/letmesketch)

---

<div align="center">
  <p>Made with ❤️ by <a href="https://github.com/HassanXTech">Hassan</a></p>
</div>
