# Pipeline Studio ⚡

Pipeline Studio is a premium, visual monorepo application containing a **React Flow Editor Canvas**, a custom **Zustand State Store**, a mockable **Right-Side Node Configuration Drawer**, and a responsive **Marketing Landing Page**, powered by a **FastAPI (Python) Backend** for topological cycle validation.

Designed for maximum visual appeal and fluid user interactions, this project features metallic dark aesthetics, GSAP loading animations, Locomotive smooth scrolling, and custom UI components built from scratch.

---

## 🚀 Getting Started

To run Pipeline Studio locally, you will start the FastAPI backend and the React frontend.

### 1. Backend Server Setup (FastAPI)
1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install the required Python dependencies:
   ```bash
   pip install fastapi uvicorn
   ```
3. Run the development server (configured to port `8002`):
   ```bash
   uvicorn main:app --port 8002 --reload
   ```

### 2. Frontend App Setup (React)
1. Open a separate terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install the dependencies (including GSAP and Locomotive Scroll):
   ```bash
   npm install
   ```
3. Launch the development server:
   ```bash
   npm start
   ```
4. Access the site in your browser at `http://localhost:3000` (or `http://localhost:3001`).

---

## 🎨 Architecture & Technical Features

### 1. Premium App Shell & Client-Side Router (`/` and `/editor`)
- **Custom Router**: Built a custom React state-based router synchronized with `window.history` navigation events.
- **Top Header Bar**: Houses a simulated workspace dropdown selector, editable active pipeline name, saved status, GitHub modal triggers, and one-click Deploy toast actions (with async spinners).
- **Collapsible Navigation Sidebar**: Toggles with smooth CSS transitions, exposing vertical menu items (Flows launches the main editor; others render a designed "Coming soon" fallback screen).

### 2. Marketing Landing Page (`/`)
- **Smooth Inertial Scrolling**: Leveraged `LocomotiveScroll` to drive smooth scrolling physics on the home page.
- **GSAP Entrance Timeline**: Staggered fade-up entrances for the nav items, badges, title grids, suggestion pills, and the browser preview frame.
- **Dynamic Switcher**: Contains tabs for **Build / Deploy / Optimize** that toggle custom headings, descriptions, and mock connected Activity Logs feeds.

### 3. Edge-Hover Node Insertion & Splicing
- **Hover midpoints**: Calculates the exact coordinates of active SVG edge connectors on mouseover and renders a floating `+` button.
- **Floating Picker Menu**: Opens category lists (AI, Data, Logic, Apps) with keyboard-navigable searches.
- **Splicing Logic**: Inserting a node on an edge splits the original edge into two new edges, inserting the node directly into the chain.
- **Chain Append**: Adds a persistent `+` button at the bottom border of any leaf nodes to extend the current chain.

### 4. Click-to-Open Configuration Drawer
- **Zustand Synchronization**: Resets the drawer's hook state on node change via `key={activeNodeId}`.
- **Config & Logic tabs**: Allows renaming nodes, selecting models (GPT-4o, Claude), toggling Logic sub-tabs, and toggling inputs (Tools, Messages, Memories).
- **Schema & Prompts**: Add or remove fields from the output JSON schema builder, and configure draggable System/User textareas.
- **Metadata Testing**: Clicking "Run Test" triggers a loading spinner and logs cost metrics (input/output tokens, total dollars) in a styled raw JSON preview, turning the node's canvas header green.

### 5. Canvas Design & Node Types
- **Dark Theme Grid**: Charcoal dot grids backed by a deep metallic color scheme (`#090d16`).
- **Pill Handles**: Centers target (top) and source (bottom) handles on all node cards, styled as sleek horizontal bars (turning green upon validation).
- **Dashed Edges**: Loops a dashed response loopback edge with a floating text badge to demonstrate feedback pipelines.

---

## 🛠️ Graded Functionality (BaseNode & Backend DAG Checks)
1. **BaseNode Abstraction**: The core nodes inherit layout, header bar status colors, icons, and centered top/bottom handles from a unified base class.
2. **Auto-resizing Text Node**: The text node detects double curly-braces variables (e.g. `{{input}}`), dynamically generates target handles for them, and auto-scales width/height as you type.
3. **Backend DAG Validation**: Clicking the main "Submit Pipeline" button formats the canvas nodes and edges to match Pydantic schemas, and requests `POST /pipelines/parse` on the FastAPI backend. It returns a pop-up displaying:
   - Total Node Count
   - Total Edge Count
   - Topological cycle status (`Is DAG: Yes/No`).
