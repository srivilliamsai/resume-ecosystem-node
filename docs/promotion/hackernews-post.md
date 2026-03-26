**Title: Show HN: Resume Ecosystem – auto-generates verified resumes from real achievements using Kafka + Node.js microservices**

I built a system where verified achievements (GitHub PRs, course completions, hackathon wins) **automatically update your resume** via an event-driven architecture.

**The Problem:** Most resume builders are static text editors. We forget achievements, misrepresent them, or fail to verify them.

**The Solution:** An event bus (Kafka) connects integration services (GitHub, Coursera, etc.) to a Resume Builder Service.
1.  **Integration Service** receives a webhook (e.g., "Course Completed").
2.  **Activity Service** creates an unverified activity record.
3.  **Verification Service** checks the hash/signature/OAuth token.
4.  **Resume Service** listens for `activity.verified` events and rebuilds the resume score.
5.  **Notification Service** pushes updates to the user.

**Stack:**
*   **Runtime:** Node.js 20 (TypeScript)
*   **Framework:** Fastify (low overhead)
*   **DB:** Postgres + Prisma ORM
*   **Cache:** Redis
*   **Messaging:** Kafka
*   **Frontend:** React + Vite

**Architecture Decision:**
I chose **Kafka** over REST/gRPC for internal communication to decouple the heavy "Verification" and "Resume Building" steps from the user-facing "Activity Creation".

**Open Source:**
The project is fully open source (MIT). I'm looking for feedback on the microservices pattern and contributions for more integrations!

**Repo:** https://github.com/srivilliamsai/resume-ecosystem-node
