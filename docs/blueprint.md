# **App Name**: CubeMiner

## Core Features:

- Account Generation via LinkPays: Generates a unique shortlink via LinkPays API that redirects to the /claim page upon completion. Link is: https://linkpays.in/st?api=3295db9608441da32b8049d61b1675cde9802c5d&url=https://yourdomain.com/claim
- Account Claim: Retrieves the first unclaimed Minecraft account from Firestore, displays the credentials, and marks the account as claimed.
- Admin Authentication: Firebase Authentication system for admin login using email and password.
- Account Upload: Admin interface to upload new Minecraft accounts (email, password, status) to Firestore with a default status of 'unclaimed'.
- Account Management: Table view in the admin dashboard to manage accounts, including marking as claimed/unclaimed and deleting accounts.
- Confetti Animation: Implement 3D confetti animation or cube spin celebration upon successful account claim to enhance user experience.
- Account Distribution Analysis: AI tool to identify and manage invalid/unusable credentials, thus optimizing resource allocation and claim protection. AI analyzes logs to discover trends/correlations.

## Style Guidelines:

- Primary color: Cyan (#00FFFF) to capture the neon glow aesthetic.
- Background color: Dark gray (#222222) for a strong contrast to the neon elements.
- Accent color: Purple (#800080) as a secondary neon glow color to complement the cyan.
- Headline font: 'Space Grotesk' (sans-serif) for titles and prominent text. Body font: 'Inter' (sans-serif) for standard paragraphs and labels.
- Use custom-designed icons that fit the Minecraft aesthetic; icons should be simple, geometric, and have a neon glow effect.
- Implement a modern 3D layout using Three.js for interactive design; ensure all elements are fully responsive and mobile-friendly.
- Incorporate smooth page transitions and button hover effects; include a loading spinner animation while generating links.