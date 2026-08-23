# Skaut-App
[![Ask DeepWiki](https://devin.ai/assets/askdeepwiki.png)](https://deepwiki.com/code-sada/skaut-app)

Skaut-App is a comprehensive internal information system designed for scout troops. Built with Next.js and Prisma, it provides a centralized platform for managing members, events, meetings, attendance, and important documents, streamlining communication and organization for both leaders and members.

## Key Features

*   **Dashboard:** A central overview of the most important upcoming events and meetings.
*   **Event Management:** Create, edit, and delete troop expeditions and events. Includes detailed views with logistics, pricing, and deadlines.
*   **Attendance System:** Members can RSVP for events and meetings. Leaders have access to a comprehensive attendance dashboard with visual charts and a detailed grid view.
*   **Member Management:** A detailed database of troop members, including personal information, parental contacts, health notes, and dietary restrictions. Features role-based access and a system for requesting and approving profile updates.
*   **Patrols (Družiny):** Organize members into patrols and manage regular meeting schedules and locations.
*   **Meeting Hub:** Schedule individual meetings, generate recurring meeting series, and use the integrated chat for troop communication.
*   **Document Repository:** A centralized place to store and categorize important documents, forms, and links.
*   **Authentication & Roles:** Secure login system with role-based access control (Admin, Leader, Member) to protect sensitive information.
*   **Notifications:** An integrated notification system (bell icon) alerts users to new events and pending actions.

## Tech Stack

*   **Framework:** [Next.js](https://nextjs.org/) (with App Router)
*   **Database ORM:** [Prisma](https://www.prisma.io/)
*   **Database:** [SQLite](https://www.sqlite.org/index.html)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Charting:** [Recharts](https://recharts.org/)

## Getting Started

Follow these instructions to get a local copy of the project up and running.

### Prerequisites

*   Node.js (v18 or later)
*   npm or a compatible package manager

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/code-sada/skaut-app.git
    cd skaut-app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up the database:**
    This command will create the `dev.db` SQLite database file and apply all existing migrations from the `prisma/migrations` directory.
    ```bash
    npx prisma migrate dev
    ```

4.  **Seed the database with initial data:**
    The project includes seed scripts to populate the database with test users, patrols, events, and members.
    ```bash
    npx prisma db seed
    ```
    *Note: The `prisma.seed` command in `package.json` is configured to run `ts-node prisma/seed.ts`.*

5.  **Run the development server:**
    ```bash
    npm run dev
    ```

The application will be available at [http://localhost:3000](http://localhost:3000). You can log in with the seeded admin user:
*   **Email:** `vedouci@skaut.cz`
*   **Password:** `tajneheslo`

## Project Structure

*   `app/`: Contains all the routes, pages, and core application logic using the Next.js App Router. Server actions for data mutation are also located here.
*   `components/`: Reusable React components used across the application, such as `EventCard`, `Sidebar`, and various forms.
*   `prisma/`: Includes the database schema (`schema.prisma`), migrations, and seed scripts.
*   `public/`: Stores static assets like images and fonts.
*   `middleware.ts`: Handles authentication logic, protecting routes and redirecting unauthenticated users.

## Available Scripts

*   `npm run dev`: Starts the development server with hot-reloading.
*   `npm run build`: Creates a production-ready build of the application.
*   `npm start`: Starts the production server.
*   `npm run lint`: Lints the codebase using ESLint.