# Are You Free

The easiest way to find a time that works for everyone in your group.
Simply create an event, share the link with your friends, and let everyone pick their available times. The app will automatically find the best times that work for everyone.

_The name "Sync Up" was changed to Are You Free since "Sync Up" was taken :/_

Live Project: [www.areyoufree.xyz](https://areyoufree.xyz)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/eltonSalanic/sync-up.git
cd sync-up
```

### 2. Supabase Database Setup

To get your own database running, you can completely skip the CLI.

1. Create a new project on your [Supabase Dashboard](https://supabase.com/dashboard).
2. Navigate to the **SQL Editor** on the left panel.
3. Copy the entire contents of the `initial_schema.sql` file included in this repository.
4. Paste it into the SQL Editor and click **Run**.

_(This will instantly generate all the necessary tables, relationships, Row Level Security policies, and user constraints required for the app to work!)_

### 3. Set up Environment Variables

Before running the app, you need to connect it to your Supabase project.

1. Copy the example environment file:

   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and add your **Supabase URL**, **Publishable Key**, and **Secret Key**. You can find these in your Supabase project settings.

### 4. Install Dependencies

This project uses `pnpm` as its package manager.
`pnpm install`

### 5. Run the Development Server

Start the local Next.js server:
`pnpm dev`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the app running!

## Application Architecture

```mermaid
flowchart TB

    subgraph Client ["Client (Browser)"]
    end

    subgraph Server ["Next.js App"]
        subgraph ServerActions ["Server Actions"]
        end
    end

    subgraph DB ["Supabase"]
        Postgres[(PostgreSQL)]
        RLS["Row Level Security"]
        RLS --- Postgres
    end

    %% Flows
    Client --> ServerActions
    Client -->|"AnonUser Credentials"| DB

    ServerActions -->|"AdminKey/AnonUser Credentials"| DB


    %% Styles
    classDef clientNode fill:#e0f2fe,stroke:#0284c7,color:#0f172a
    classDef serverNode fill:#f3f4f6,stroke:#374151,color:#0f172a
    classDef dbNode fill:#dcfce7,stroke:#16a34a,color:#0f172a

    class Client clientNode
    class Server serverNode
    class DB dbNode
```

## Database ERD

![Database Schema ERD](./initialDbSchema.png)

## Application Flows

### Create Event Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Browser as Client (Browser)
    participant Server as Next.js (Server Actions)
    participant DB as Supabase

    %% PHASE 1: Anonymous User Creation
    User->>Browser: Navigates to /create/anon-user
    User->>Browser: Fills out AnonUser form & submits

    Browser->>Server: Action: createAnonUser()
    activate Server
    Server->>DB: SignUp Anon User
    Server->>DB: INSERT new anonymous user
    DB ->>Server: Anon User logged in

    %% PHASE 2: Redirect to Event Creation
    Server-->>Browser: redirect('/create/event')
    deactivate Server
    Browser->>User: Renders Event Creation Form

    %% PHASE 3: Event Creation & Admin Assignment
    User->>Browser: Fills out Event form & submits
    Browser->>Server: Action: createEvent()
    activate Server

    Server->>DB: INSERT new Event (Link Anon User to Event as Event)

    DB-->>Server: Returns new Event ID

    %% PHASE 4: Final Redirect
    Server-->>Browser: redirect('/create/event/[eventId]/success')
    deactivate Server
    Browser->>User: Renders Success / Admin Dashboard
```

### User Join Event Flow

```mermaid
    sequenceDiagram
    autonumber
    actor User


    %% PHASE 1: Join via Invite Link
    User->>Browser: Clicks link /create/anon-user?eventId=
    Browser->>User: Renders Create AnonUser form

    %% PHASE 2: Anonymous User Creation & Event Linking
    User->>Browser: Fills out name & submits
    Browser->>Server: Action: createAnonUser(eventId)
    activate Server
    Server->>DB: SignUp & INSERT new Anon User
    Server->>DB: Link Anon User to Event
    DB-->>Server: Anon User created & logged in

    %% PHASE 3: Redirect to Availability Selection
    Server-->>Browser: redirect('/event/[eventId]/availability')
    Browser-->>User: render availability form
    deactivate Server

    %% PHASE 4: Submitting Availability
    User->>Browser: Selects available times & submits
    Browser->>Server: Action: submitAvailability(slots)
    activate Server
    Server->>DB: INSERT availability slots linked to user and event

    %% PHASE 5: Redirect to Confirmation
    Server-->>Browser: redirect('/?success=true')
    deactivate Server
    Browser->>User: Renders Landing Page (Success Banner)
```

### User View Dashboard Flow

```mermaid
    sequenceDiagram
    autonumber
    actor User

    %% PHASE 1: Initial Navigation
    User->>Browser: Navigates to /event/[eventId]/dashboard
    Browser->>Server: GET Request

    activate Server
    Server->>Server: Check for HTTP-only Auth Cookie

    %% PHASE 2: The Conditional Auth Check
    alt Cookie is Missing or Invalid
        Server-->>Browser: Renders PIN Entry Form
        deactivate Server

        User->>Browser: Enters event PIN and submits
        Browser->>Server: Action: verifyPin()
        activate Server
        Server->>Supabase: Validate PIN matches Event ID
        Supabase-->>Server: Verified
        Server->>Server: Set Auth Cookie
        Server-->>Browser: Refresh Page (revalidatePath)
        deactivate Server

        Browser->>Server: GET Request (Now with valid Cookie)
        activate Server
    end

    %% PHASE 3: Dashboard Rendering (Only runs if Authorized)
    Server->>Supabase: Fetch Event Details & Availabilities
    Server-->>Browser: Render Full Dashboard
    deactivate Server

    Browser->>User: Renders dashboard
```
