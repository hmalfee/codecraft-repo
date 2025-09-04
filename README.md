# CodeCraft-Repo

A full-stack Todo application with Next.js, TypeScript, Drizzle ORM, and TRPC.

## Features & Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: TRPC, Node.js 22, PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth with email/password login
- **DevOps**: GitHub Actions, Terraform, Vercel deployment
- **Infrastructure**: PostgreSQL database hosted on Neon

## Getting Started

### Prerequisites

- Node.js v22, PNPM v10, Terraform CLI, Docker

### Local Development

```bash
# Clone repository
git clone git@github.com:hmalfee/coding-challenge-repo.git
cd coding-challenge-repo

# Setup and install
pnpm setup-git-hooks
pnpm install

# Configure environment
# Copy .env.example to .env and fill in required values

# Start development server
pnpm dev
```

## Deployment

### GitHub Setup

Set the following GitHub secrets in your `codecraft-repo` repository:

- `TERRAFORM_API_TOKEN`: Terraform Cloud API token
- `VERCEL_API_TOKEN`: Vercel API token
- `NEON_API_KEY`: Neon account API key
- `GH_PAT`: Personal access token from Github developer settings and if you're using fine-grained tokens (the newer type), you need these repository permissions:
  Actions: Write
  Secrets: Write
  Variables: Write
  Contents: Read
  Metadata: Read

### Workflow Guidelines

**Initial Setup:**

```bash
# Clone and install
git clone https://github.com/hmalfee/codecraft-repo.git
cd coding-challenge-repo
rm -rf .git
# Change your folder name to your repo's name
# use VSCode to search "acme" and replace it with your project name, dont search for "acme-repo"
# change your database schema anf genwerate migratoon filed
git init
git add .
git commit -m "First commit"
git remote add origin https://github.com/hmalfee/codecraft-repo.git
git branch -M main
git push -u origin main
```

**Development Workflow:**

```bash
pnpm setup-git-hooks
pnpm install

# Create feature branch (direct commits to main not allowed)
git checkout -b feature/my-new-feature

# Make changes and commit
git add .
git commit -m "feat: implement new feature"

# Push for preview deployment
git push origin feature/my-new-feature

# After PR approval, deploy to production
git checkout main
git merge feature/my-new-feature
git push origin main
```

## Project Structure

- `src/` - Application source code (app/, components/, lib/, server/)
- `infra/` - Terraform configuration files
- `scripts/` - Utility scripts and git hooks
