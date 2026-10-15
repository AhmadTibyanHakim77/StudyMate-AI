```markdown
# StudyMate AI

> An AI-powered learning companion for smarter, more organized, and personalized studying.

StudyMate AI is a modern web-based learning platform designed to help students manage study materials, understand learning content, and improve their study process through AI-assisted learning features.

The application combines document management, AI-powered study tools, authentication, analytics, and a structured dashboard into a single learning environment.

Built with **Next.js, React, TypeScript, Tailwind CSS, NextAuth, Prisma, and PostgreSQL**.

---

## ✨ Features

### 🔐 Authentication

Secure user authentication with credential-based registration and login.

- User registration
- User login
- Session management
- Protected dashboard
- Server-side authentication
- User profile management

### 📚 Study Materials

Manage learning materials from a centralized workspace.

- Upload study materials
- View material information
- Access individual materials
- File processing architecture
- Private local file storage
- S3-compatible storage architecture for production

### 📝 AI Summaries

Transform learning materials into structured study summaries using AI.

The summary workflow is designed to help students identify and review important information from their learning materials.

### 🧠 AI Tutor

Interact with an AI-powered tutor for learning assistance.

The AI Tutor architecture supports:

- Interactive conversations
- Conversation history
- Context-based responses
- Study content retrieval
- AI-assisted explanations

### 🎯 AI Quizzes

Generate and manage quizzes based on learning content.

The quiz workflow includes:

- Quiz generation
- Quiz management
- Quiz attempts
- Assessment-oriented learning

### 🗂️ AI Flashcards

Create and review flashcards to support active recall.

The flashcard module includes:

- Flashcard decks
- Deck management
- Individual flashcard review
- Review workflow
- AI-generated flashcard architecture

### 📊 Learning Analytics

Monitor learning-related activity through an analytics dashboard.

The analytics module provides a foundation for tracking learning progress and presenting meaningful study information.

### ⚙️ User Settings

Manage user-related preferences through a dedicated settings interface.

---

## 🖥️ Application Modules

```text
StudyMate AI
│
├── Landing Page
│
├── Authentication
│   ├── Register
│   └── Login
│
└── Dashboard
    ├── Overview
    ├── Study Materials
    ├── AI Summaries
    ├── AI Quizzes
    ├── AI Flashcards
    ├── AI Tutor
    ├── Learning Analytics
    └── Settings
```

---

## 🏗️ Architecture

StudyMate AI follows a full-stack architecture using the Next.js App Router.

```text
┌─────────────────────────────────────────────┐
│                  StudyMate AI               │
├─────────────────────────────────────────────┤
│                  Frontend                   │
│          Next.js + React + TypeScript       │
├─────────────────────────────────────────────┤
│                 UI Layer                    │
│                 Tailwind CSS                │
├─────────────────────────────────────────────┤
│                 API Layer                   │
│          Next.js Route Handlers             │
├─────────────────────────────────────────────┤
│              Application Layer              │
│   AI Service | Auth | Storage | Retrieval   │
├─────────────────────────────────────────────┤
│              Data Access Layer              │
│                   Prisma                   │
├─────────────────────────────────────────────┤
│                  Database                   │
│                 PostgreSQL                  │
└─────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| **Next.js 16** | Full-stack React framework |
| **React 19** | User interface |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** | Responsive UI styling |
| **NextAuth** | Authentication and session management |
| **Prisma** | Database ORM |
| **PostgreSQL** | Relational database |
| **Vitest** | Unit testing |
| **Docker** | Local database environment |
| **OpenAI-Compatible API** | AI-powered learning features |
| **S3-Compatible Storage** | Production file storage |
| **npm** | Package management |

---

## 📁 Project Structure

```text
AI-STUDY-COMPANION/
│
├── prisma/
│   └── schema.prisma
│
├── public/
│   └── studymate-mark.svg
│
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── analytics/
│   │   │   ├── auth/
│   │   │   ├── flashcards/
│   │   │   ├── materials/
│   │   │   ├── quizzes/
│   │   │   ├── settings/
│   │   │   ├── summaries/
│   │   │   └── tutor/
│   │   │
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   └── register/
│   │   │
│   │   ├── dashboard/
│   │   │   ├── analytics/
│   │   │   ├── flashcards/
│   │   │   ├── materials/
│   │   │   ├── quizzes/
│   │   │   ├── settings/
│   │   │   ├── summaries/
│   │   │   └── tutor/
│   │   │
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   │   ├── dashboard/
│   │   ├── flashcards/
│   │   ├── materials/
│   │   ├── quizzes/
│   │   ├── settings/
│   │   ├── summaries/
│   │   ├── tutor/
│   │   └── ui/
│   │
│   └── lib/
│       ├── documents/
│       ├── i18n/
│       ├── server/
│       ├── tutor/
│       ├── ai.ts
│       ├── analytics.ts
│       ├── auth.ts
│       ├── prisma.ts
│       ├── storage.ts
│       └── utils.ts
│
├── uploads/
├── .env.example
├── .gitignore
├── AGENTS.md
├── AUDIT.md
├── IMPLEMENTATION_PLAN.md
├── README.md
├── next.config.js
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
└── vitest.config.mts
```

---

## 🚀 Getting Started

### Prerequisites

Make sure the following tools are installed:

- Node.js
- npm
- Docker
- PostgreSQL

The project requires a PostgreSQL database accessible through `DATABASE_URL`.

### 1. Clone the Repository

```bash
git clone https://github.com/AhmadTibyanHakim77/AI-STUDY-COMPANION.git
cd AI-STUDY-COMPANION
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a local `.env` file from the example:

```bash
cp .env.example .env
```

Configure the required variables:

```env
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

AI_API_KEY=
AI_API_URL=
AI_MODEL=

MAX_FILE_SIZE_MB=25

S3_BUCKET=
S3_REGION=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_ENDPOINT=
```

> **Important:** Never commit `.env` or expose real credentials in `.env.example`.

---

## 🗄️ Local Database

StudyMate AI uses PostgreSQL as its relational database.

For local development, the project can use the existing Docker PostgreSQL container:

```bash
docker start studymate-postgres-local
```

To stop the container:

```bash
docker stop studymate-postgres-local
```

The local database uses the persistent Docker volume:

```text
studymate-local-postgres-data
```

The database is bound to:

```text
127.0.0.1:5432
```

### Prisma

Validate the Prisma schema:

```bash
npm exec -- prisma validate
```

The repository currently does not contain a checked-in Prisma migration history.

For shared or production databases, use reviewed Prisma migrations rather than assuming that `prisma db push` is safe for an existing database.

---

## 💻 Run the Application

Start the development server:

```bash
npm run dev
```

Open the application:

```text
http://localhost:3000
```

If port `3000` is already occupied, Next.js automatically selects another available port.

---

## 🧪 Testing & Validation

Run the following commands before committing major changes.

### Lint

```bash
npm run lint
```

### Unit Tests

```bash
npm test
```

### Type Checking

```bash
npm exec -- tsc --noEmit
```

### Prisma Validation

```bash
npm exec -- prisma validate
```

### Production Build

```bash
npm run build
```

### Complete Validation

```bash
npm run lint
npm test
npm exec -- tsc --noEmit
npm exec -- prisma validate
npm run build
```

The current unit test suite covers AI configuration and request validation as well as lexical tutor retrieval.

Additional API, database, and browser workflows require manual verification.

---

## 🔑 Environment Variables

### Database

#### `DATABASE_URL`

PostgreSQL connection string used by Prisma and the application.

```env
DATABASE_URL=postgresql://username:password@localhost:5432/studymate
```

### Authentication

#### `NEXTAUTH_SECRET`

Server-side secret used for authentication security.

#### `NEXTAUTH_URL`

Application URL used by NextAuth.

For local development:

```env
NEXTAUTH_URL=http://localhost:3000
```

### AI Provider

StudyMate AI uses an OpenAI-compatible `/chat/completions` protocol.

```env
AI_API_KEY=
AI_API_URL=
AI_MODEL=
```

These settings are required for:

- AI Summaries
- AI Quizzes
- AI Flashcards
- AI Tutor

Without a valid AI provider configuration, the affected routes return `503` and identify the missing configuration.

Never expose the AI API key in client-side code.

### File Upload

```env
MAX_FILE_SIZE_MB=25
```

The application supports a maximum upload size of 25 MB.

During local development, uploaded files are stored in:

```text
uploads/
```

The `uploads/` directory is excluded from Git.

### S3-Compatible Storage

Production deployments can use private S3-compatible object storage:

```env
S3_BUCKET=
S3_REGION=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_ENDPOINT=
```

Storage credentials must remain server-side.

---

## 🔒 Security

StudyMate AI handles authentication data, study materials, database credentials, and AI provider credentials.

Current security practices include:

- `.env` is excluded from Git
- API credentials remain server-side
- Database credentials remain server-side
- Protected dashboard routes require authentication
- Local uploaded files are stored privately
- Production storage is designed for private object storage

Before production deployment, additional security work is required:

- Rate limiting
- File upload security validation
- Authentication and authorization review
- API abuse protection
- Browser security testing
- Production storage security review
- End-to-end security testing

---

## 📊 Development Status

StudyMate AI is currently under active development.

| Module | Status |
|---|:---:|
| Landing Page | ✅ |
| User Registration | ✅ |
| User Login | ✅ |
| Session Management | ✅ |
| Protected Dashboard | ✅ |
| Study Materials Architecture | ✅ |
| Summary API | ✅ |
| Quiz API | ✅ |
| Flashcard API | ✅ |
| AI Tutor API | ✅ |
| Analytics Architecture | ✅ |
| Prisma Integration | ✅ |
| PostgreSQL Integration | ✅ |
| AI Provider Configuration | ⚙️ |
| AI End-to-End Testing | ⚙️ |
| Production Object Storage | ⚙️ |
| Rate Limiting | ⏳ |
| Security Audit | ⏳ |
| Production Deployment | ⏳ |

### Status Legend

- ✅ Implemented
- ⚙️ Requires configuration or verification
- ⏳ Planned

---

## 🗺️ Roadmap

### Phase 1: Core Platform

- [x] Landing page
- [x] User registration
- [x] User login
- [x] Session management
- [x] Protected dashboard
- [x] PostgreSQL integration
- [x] Study material architecture

### Phase 2: AI Learning Features

- [x] Summary API
- [x] Quiz API
- [x] Flashcard API
- [x] AI Tutor API
- [ ] Complete AI provider testing
- [ ] Improve generated content quality
- [ ] Improve context retrieval

### Phase 3: Learning Experience

- [ ] Enhanced learning analytics
- [ ] Personalized study recommendations
- [ ] Improved document processing
- [ ] Advanced quiz evaluation
- [ ] Flashcard review optimization
- [ ] Learning progress visualization

### Phase 4: Production Readiness

- [ ] Managed PostgreSQL
- [ ] Production Prisma migrations
- [ ] Private object storage
- [ ] Rate limiting
- [ ] Security audit
- [ ] Browser and integration testing
- [ ] Production deployment

---

## 📖 Documentation

Additional project documentation is available in the repository.

### `AUDIT.md`

Contains the verified implementation status, manual checks, known blockers, and areas requiring further validation.

### `IMPLEMENTATION_PLAN.md`

Contains the project's implementation plan and development direction.

### `AGENTS.md`

Contains project-specific development instructions and guidelines.

---

## 🤝 Contributing

Contributions and improvements are welcome during the development phase.

### Development Workflow

Create a feature branch:

```bash
git checkout -b feat/your-feature
```

Run validation:

```bash
npm run lint
npm test
npm exec -- tsc --noEmit
npm exec -- prisma validate
npm run build
```

Commit your changes:

```bash
git add .
git commit -m "feat: add your feature"
```

Push the branch:

```bash
git push origin feat/your-feature
```

Then open a Pull Request.

---

## 📄 License

This project currently does not specify a license.

A suitable open-source license should be added before distributing the project publicly or accepting external contributions.

---

## 👨‍💻 Author

**Ahmad Tibyan Hakim**

Full Stack Developer · Data Analyst · Data Science Enthusiast

GitHub:  
https://github.com/AhmadTibyanHakim77

---

## 🔗 Repository

**StudyMate AI**

https://github.com/AhmadTibyanHakim77/AI-STUDY-COMPANION

---
