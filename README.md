# IncHub CRM - Client Portal & Admin Frontend

A premium Next.js frontend built with TypeScript and TailwindCSS, serving as the client portal and business suite interface.

## 🚀 Getting Started

### Prerequisites
- Node.js (v20+)

### Environment Setup
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

---

## ☁️ AWS Production Deployment

The frontend application is configured for deployment on **AWS Amplify**.

### Deployment steps:
1. Push your branch to GitHub.
2. Open the **AWS Console** and navigate to **AWS Amplify**.
3. Select **Create new app**, choose **GitHub**, and link the repository.
4. Set the environment variable `NEXT_PUBLIC_API_URL` to point to your backend endpoint (ECS Fargate Public IP/DNS or Load Balancer).
5. Click **Deploy**. AWS Amplify handles the serverless Next.js build and serves it with built-in CDN caching and SSL.
