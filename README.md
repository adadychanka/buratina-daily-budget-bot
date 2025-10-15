# Daily Budget Bot

A Telegram bot for automated daily reporting with Google Sheets integration. The bot uses a step-by-step FSM (Finite State Machine) approach to collect structured data from users and exports it to Google Sheets for centralized storage and analysis.

## 🚀 Tech Stack

### **Runtime & Language**

- **Node.js 22.20.0 LTS** - Latest stable version
- **TypeScript 5.7+** - Type safety and better development experience
- **ES2024** - Modern JavaScript features

### **Telegram Bot Framework**

- **Telegraf 4.16.3** - Modern Telegram Bot API library
- **Session Management** - User session handling
- **Scene Management** - FSM (Finite State Machine) for step-by-step input

### **Database & ORM**

- **Prisma 6.17.1** - Modern ORM with excellent TypeScript support
- **SQLite** - Database (easily migratable to PostgreSQL)
- **@prisma/client 6.17.1** - Prisma client for database operations

### **Google Sheets Integration**

- **googleapis 163.0.0** - Official Google library for Node.js
- **google-auth-library 9.0.0** - JWT authentication via Service Account

### **Validation & Type Safety**

- **Zod 4.1.12** - Schema validation with TypeScript inference
- **class-validator** (optional) - Decorators for validation

### **Configuration & Utilities**

- **dotenv 16.4.0** - Environment variable management
- **winston 3.18.3** - Structured logging
- **helmet** (optional) - HTTP security headers

### **Code Quality & Testing**

- **@biomejs/biome 2.2.6** - Modern linter and formatter (replaces ESLint + Prettier)
- **Vitest 3.2.4** - Modern testing framework
- **@vitest/ui 3.2.4** - Web interface for tests

### **Containerization & Deployment**

- **Docker** - Application containerization
- **Docker Compose** - Container orchestration
- **Multi-stage builds** - Optimized images

## 📁 Project Structure

```
DailyBudgetBot/
├── src/
│   ├── bot/                    # Bot logic
│   │   ├── handlers/          # Command handlers (/start, /help, /history)
│   │   ├── keyboards/         # Inline and Reply keyboards
│   │   ├── middleware/        # Bot middleware
│   │   └── scenes/           # FSM scenes for step-by-step input
│   ├── config/                # Configuration
│   │   ├── settings.ts       # App settings with validation
│   │   └── logger.ts         # Winston logger configuration
│   ├── database/              # Database operations
│   │   ├── models/           # Prisma models (if custom needed)
│   │   └── connection.ts     # Database connection
│   ├── services/              # External services
│   │   ├── google-sheets.ts  # Google Sheets service
│   │   ├── report.ts         # Report business logic
│   │   └── credentials/      # Service Account keys (NOT in git!)
│   ├── types/                 # TypeScript type definitions
│   │   ├── bot.ts            # Bot types
│   │   ├── report.ts         # Report types
│   │   └── database.ts       # Database types
│   ├── utils/                 # Utilities
│   │   ├── validators.ts     # Input validators with Zod
│   │   ├── formatters.ts     # Data formatters
│   │   └── constants.ts      # App constants
│   └── index.ts              # Application entry point
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── migrations/           # Database migrations
├── tests/                     # Test files
├── .env.example              # Environment variables template
├── .gitignore
├── .dockerignore
├── biome.json                # Biome configuration
├── vitest.config.ts          # Vitest configuration
├── Dockerfile                # Docker configuration
├── docker-compose.yml        # Production Docker Compose
├── docker-compose.dev.yml    # Development Docker Compose
├── package.json
├── tsconfig.json
└── README.md
```

## 🛠️ Installation & Setup

### **Prerequisites**

- Node.js 22.20.0+ (LTS recommended)
- Docker & Docker Compose (for containerized deployment)
- Google Cloud Console account (for Google Sheets integration)

### **Local Development**

1. **Clone the repository**

```bash
git clone <repository-url>
cd DailyBudgetBot
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.example .env
# Edit .env with your actual values
```

4. **Set up the database**

```bash
npm run db:generate
npm run db:push
```

5. **Start development server**

```bash
npm run dev
```

### **Docker Deployment**

1. **Build the image**

```bash
npm run docker:build
```

2. **Run in production**

```bash
npm run docker:prod
```

3. **Run in development**

```bash
npm run docker:dev
```

## 📋 Available Commands

### **Development**

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm run start        # Start production server
```

### **Database**

```bash
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema changes to database
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma Studio
```

### **Testing**

```bash
npm run test         # Run tests in watch mode
npm run test:ui      # Open test UI
npm run test:run     # Run tests once
npm run test:coverage # Run tests with coverage report
npm run test:ci      # Run tests for CI/CD
```

### **Code Quality**

```bash
npm run check        # Run Biome checks (lint + format)
npm run check:fix    # Auto-fix issues
npm run lint         # Lint only
npm run format       # Format only
```

### **Docker**

```bash
npm run docker:build # Build Docker image
npm run docker:run   # Run container with .env file
npm run docker:dev   # Development with Docker Compose
npm run docker:prod  # Production with Docker Compose
```

## 🤖 Bot Commands

- `/start` - Initialize bot and show welcome message
- `/help` - Display help information and available commands
- `/report` - Start data collection process (FSM scene entry)
- `/history` - Display user's submission history (database query)

## 📊 Data Collection Process

The bot guides users through a step-by-step FSM process to collect structured data:

1. **Numeric Input Fields** - Validated numeric data collection
2. **Text Input Fields** - Text data with optional validation
3. **Optional Fields** - Support for skippable data points
4. **Multi-entry Support** - Ability to add multiple entries (e.g., expense items)
5. **Data Review** - Summary view before submission
6. **Confirmation** - User confirmation before final export

All input is validated using Zod schemas before being accepted.

## 🔐 Google Sheets Setup

### **Service Account Setup**

1. **Create a Google Cloud Project**

   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one

2. **Enable Google Sheets API**

   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Sheets API" and enable it

3. **Create Service Account**

   - Go to "IAM & Admin" > "Service Accounts"
   - Click "Create Service Account"
   - Name: "daily-budget-bot"
   - Create and download JSON key

4. **Share Google Sheet**

   - Open your Google Sheet
   - Click "Share" button
   - Add Service Account email as "Editor"
   - Email format: `service-account@project.iam.gserviceaccount.com`

5. **Configure Environment**
   - Place JSON key in `src/services/credentials/`
   - Update `GOOGLE_CREDENTIALS_PATH` in `.env`

### **Sheet Structure**

The bot exports data to Google Sheets with the following structure:

| Column | Type    | Description                      |
| ------ | ------- | -------------------------------- |
| A      | Date    | Auto-generated timestamp         |
| B      | Numeric | Calculated total                 |
| C-G    | Numeric | Individual numeric fields        |
| H      | Numeric | Sum of multi-entry items         |
| I      | Text    | Concatenated multi-entry details |
| J      | Numeric | Final numeric value              |
| K      | Text    | Optional notes/comments          |

You can customize the column mapping by modifying the `formatReportForSheets()` function in `src/utils/formatters.ts`.

## 🚀 Deployment Options

### **VPS with Docker (Recommended)**

1. **Set up server with Docker**

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

2. **Deploy application**

```bash
git clone <repository-url>
cd DailyBudgetBot
cp .env.example .env
# Edit .env with production values
docker-compose up -d
```

### **Heroku**

1. **Create Heroku app**

```bash
heroku create daily-budget-bot
```

2. **Set environment variables**

```bash
heroku config:set BOT_TOKEN=your_token
heroku config:set DATABASE_URL=your_database_url
# ... other variables
```

3. **Deploy**

```bash
git push heroku main
```

### **Railway**

1. **Connect GitHub repository**
2. **Set environment variables in Railway dashboard**
3. **Deploy automatically on push**

## 🧪 Testing

### **Running Tests**

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Open test UI
npm run test:ui
```

### **Test Structure**

- Tests are located in `tests/` directory
- Use `.test.ts` or `.spec.ts` naming convention
- Vitest provides Jest-compatible API

## 🔧 Configuration

### **Environment Variables**

| Variable                  | Description                           | Required |
| ------------------------- | ------------------------------------- | -------- |
| `BOT_TOKEN`               | Telegram bot token                    | Yes      |
| `DATABASE_URL`            | Database connection string            | Yes      |
| `GOOGLE_SHEETS_ID`        | Google Sheet ID                       | Yes      |
| `GOOGLE_CREDENTIALS_PATH` | Path to Service Account JSON          | Yes      |
| `NODE_ENV`                | Environment (development/production)  | No       |
| `LOG_LEVEL`               | Logging level (error/warn/info/debug) | No       |

### **Biome Configuration**

The project uses Biome for linting and formatting. Configuration is in `biome.json`:

- **Linting**: TypeScript/JavaScript rules
- **Formatting**: Consistent code style
- **Organize Imports**: Automatic import sorting

### **TypeScript Configuration**

TypeScript is configured in `tsconfig.json` with:

- Strict mode enabled
- Path mapping for clean imports
- Source maps for debugging
- ES2022 target

## 📈 Performance & Monitoring

### **Logging**

- **Winston** for structured logging
- Console logging in development
- File logging in production
- Different log levels for different environments

### **Error Handling**

- Global error handlers for uncaught exceptions
- Graceful shutdown on SIGINT/SIGTERM
- Bot error handling with user feedback

### **Health Checks**

- Docker health check every 30 seconds
- Bot status monitoring
- Database connection monitoring

## 🔒 Security

### **Best Practices**

- Service Account for Google Sheets (no user auth needed)
- Environment variables for sensitive data
- Credentials not committed to git
- Input validation with Zod schemas
- Type safety with TypeScript

### **Docker Security**

- Non-root user in container
- Minimal base image (Alpine)
- No unnecessary packages
- Read-only credentials mount

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

### **Development Guidelines**

- Follow TypeScript best practices
- Write tests for new features
- Use meaningful commit messages
- Update documentation as needed

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:

1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed description
4. Contact the development team

---

**Built with modern TypeScript stack**
