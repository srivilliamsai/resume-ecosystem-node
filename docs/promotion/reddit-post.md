# Reddit Post (r/node, r/typescript, r/webdev, r/programming)

**Title: Built a Next-Gen Resume Ecosystem with Node.js Microservices + Kafka — Open Source, looking for feedback!**

Hey everyone! 👋

I've been working on an open-source project called **Resume Ecosystem** — a platform that automatically builds verified resumes from real achievements (internships, hackathons, courses).

Instead of manually updating a static PDF, the system listens for events (e.g., "Course Completed", "PR Merged") and rebuilds your resume in real-time.

It's built with a modern event-driven stack and I'd love to get some feedback on the architecture!

### 🏗️ The Stack

*   **Runtime:** Node.js 20 (TypeScript)
*   **Framework:** Fastify (for speed & low overhead)
*   **Database:** PostgreSQL + Prisma ORM
*   **Messaging:** Kafka (handling all cross-service communication)
*   **Caching:** Redis
*   **Frontend:** React + Vite

### 🧩 Architecture

It's a monorepo with 8 microservices:

```
Integration → Activity → Verification → Resume → Notification → File Renderer
                       ↘ Auth & JWT Gateway ↗
```

1.  **Activity Service**: Ingests data (e.g., GitHub webhook).
2.  **Verification Service**: Validates authenticity (hash/signature).
3.  **Resume Service**: Consumes `activity.verified` events to re-score and rebuild the resume.
4.  **Notification Service**: Pushes updates via WebSockets/Email.

### 💡 Why I built this?

Most resume builders are just static text editors. I wanted a system where *verified data* drives the resume. If you finish a verified course, it should just appear on your resume with a "Verified" badge, automatically ranked by an algorithm.

### 🔗 Links

*   **GitHub Repo:** https://github.com/srivilliamsai/resume-ecosystem-node
*   **Roadmap:** https://github.com/srivilliamsai/resume-ecosystem-node/blob/main/ROADMAP.md

I'm looking for contributors or just general code reviews! If you have experience with Kafka patterns or microservices in Node, let me know what you think.

Thanks! 🚀
