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
- **PostgreSQL** - Production database (SQLite supported for local development)
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

For development, use the development configuration:

```bash
cp .env.development.example .env.development
# Edit .env.development with your development values
```

See [Environment Configuration](#-environment-configuration) section for details on setting up different environments.

4. **Set up the database**

For local development, you can use SQLite. Update `prisma/schema.prisma` to use `provider = "sqlite"` and set `DATABASE_URL="file:./dev.db"` in your `.env` file.

```bash
npm run db:generate
npm run db:push
```

**Note:** For production deployment on Railway, PostgreSQL is used automatically. The schema is already configured for PostgreSQL.

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
6. **Confirmation** - User confirmation before final export to Google Sheets

All input is validated using Zod schemas before being accepted. Once confirmed, the report is automatically saved to the configured Google Sheet.

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
   - Place JSON key file in `src/services/credentials/` directory
   - Name it `service-account-key.json` (or update path in `.env`)
   - Update `GOOGLE_CREDENTIALS_PATH` in `.env` to point to the JSON file
   - Update `GOOGLE_SHEETS_ID` in `.env` with your Google Sheet ID
   - Optionally set `GOOGLE_SHEETS_RANGE` (default: `Sheet1!A:J`)

**Important:** The Service Account JSON file is excluded from git (see `.gitignore`). Never commit credentials to version control.

### **Sheet Structure**

The bot exports data to Google Sheets with the following structure (12 columns):

| Column | Type    | Description                                    |
| ------ | ------- | ---------------------------------------------- |
| A      | Date    | Report date (format: yyyy-MM-dd)               |
| B      | Numeric | Total Sales (net sales amount)                 |
| C      | Numeric | Total Amount of the Day (gross: cash + card)   |
| D      | Numeric | Cash Amount (calculated: white + black)        |
| E      | Numeric | White Cash amount                              |
| F      | Numeric | Black Cash amount                              |
| G      | Text    | Black Cash location (weekday)                  |
| H      | Numeric | Card Sales amount                              |
| I      | Numeric | Total Expenses (sum of all expenses)           |
| J      | Text    | Expenses Details (semicolon-separated list)    |
| K      | Numeric | Cashbox Amount (calculated, can be negative)   |
| L      | Text    | Optional notes/comments                        |

**Note:** The default range is `Sheet1!A:J`, but actual data spans 12 columns (A-L). Make sure your Google Sheet has headers in the first row and enough columns to accommodate all data.

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

### **Railway (Recommended for Production)**

Railway provides a simple, free-tier friendly deployment option with automatic deployments from GitHub.

#### **Prerequisites**

- Railway account (sign up at [railway.app](https://railway.app))
- GitHub repository connected to Railway

#### **Step 1: Create Railway Project**

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `DailyBudgetBot` repository
5. Railway will automatically detect the Dockerfile and start building

#### **Step 2: Add PostgreSQL Database (Optional)**

If you plan to use the database in the future, you can add PostgreSQL:

1. In your Railway project, click "+ New"
2. Select "Database" → "Add PostgreSQL"
3. Railway will automatically create a PostgreSQL database and add `DATABASE_URL` environment variable
4. The database will be automatically connected to your bot service

**Note:** No tables will be created automatically. You can create them later when needed using Prisma migrations.

#### **Step 3: Configure Environment Variables**

Go to your bot service → Settings → Variables and add:

| Variable                  | Description                                                                 | Required |
| ------------------------- | --------------------------------------------------------------------------- | -------- |
| `BOT_TOKEN`               | Telegram bot token from @BotFather                                        | Yes      |
| `DATABASE_URL`            | Automatically set by Railway when PostgreSQL is added (or set manually)   | Auto     |
| `GOOGLE_SHEETS_ID`        | Google Sheet ID (from URL)                                                | Yes      |
| `GOOGLE_SHEETS_RANGE`     | Sheet range (default: `Sheet1!A:J`)                                       | No       |
| `GOOGLE_CREDENTIALS_JSON` | Service Account JSON as single-line string (see below)                    | Yes      |
| `NODE_ENV`                | Set to `production`                                                        | Yes      |
| `LOG_LEVEL`               | Logging level (error/warn/info/debug)                                     | No       |

**Important:** Do NOT set `GOOGLE_CREDENTIALS_PATH` on Railway. Use `GOOGLE_CREDENTIALS_JSON` instead.

#### **Step 4: Prepare Google Credentials for Railway**

Convert your `service-account-key.json` to a single-line JSON string:

```bash
# Option 1: Using jq (recommended)
cat src/services/credentials/service-account-key.json | jq -c

# Option 2: Manual - remove all line breaks and ensure it's valid JSON
```

Copy the output and paste it as the value for `GOOGLE_CREDENTIALS_JSON` in Railway.

#### **Step 5: Deploy**

1. Railway will automatically deploy on every push to your connected branch (usually `main` or `master`)
2. Check the "Deployments" tab to see build logs
3. Once deployed, check the "Logs" tab to verify the bot is running

#### **Step 6: Verify Deployment**

1. Check Railway logs for "Bot started successfully!"
2. Test your bot on Telegram
3. Monitor logs for any errors

#### **Railway Free Tier**

- $5 in credits per month (usually sufficient for small bots)
- Automatic deployments from GitHub
- Built-in logging and monitoring

#### **Troubleshooting**

- **Build fails**: Check Dockerfile and ensure all dependencies are listed in `package.json`
- **Bot doesn't start**: Check logs for missing environment variables
- **Google Sheets errors**: Verify `GOOGLE_CREDENTIALS_JSON` is valid JSON and the Service Account has access to the sheet

## 🔄 CI/CD

The project uses GitHub Actions for continuous integration and deployment.

### **GitHub Actions Workflow**

The CI pipeline (`.github/workflows/ci.yml`) runs on every push and pull request:

1. **Code Checkout** - Checks out the repository
2. **Node.js Setup** - Sets up Node.js 22.20.0
3. **Dependencies** - Installs npm dependencies
4. **Prisma Client** - Generates Prisma client
5. **Linting & Formatting** - Runs Biome checks (`npm run check:ci`)
6. **Type Checking** - Validates TypeScript types
7. **Tests** - Runs test suite with coverage (`npm run test:ci`)

### **Workflow Triggers**

- Push to `main`, `master`, or `develop` branches
- Pull requests to `main`, `master`, or `develop` branches

### **Viewing CI Results**

- Go to your GitHub repository
- Click on "Actions" tab
- View workflow runs and their results

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

### **Environment Configuration**

The bot supports multiple environments (development, production) to safely develop and test without affecting production users.

#### **Setting Up Different Environments**

1. **Create a Test Bot (Recommended for Development)**

   - Go to [@BotFather](https://t.me/BotFather) on Telegram
   - Send `/newbot` command
   - Follow instructions to create a test bot (e.g., `DailyBudgetBotDev`)
   - Save the development bot token

2. **Create Separate Google Sheets**

   - Create a separate Google Sheet for development/testing
   - Share it with your Service Account (same as production)
   - Use different `GOOGLE_SHEETS_ID` for dev and prod

3. **Configure Environment Files**

   The application automatically loads environment variables based on `NODE_ENV`:
   - `.env.local` (highest priority, not in git) - local overrides
   - `.env.{NODE_ENV}` (e.g., `.env.development`, `.env.production`) - environment-specific
   - `.env` (lowest priority) - default fallback

   **For Development:**
   ```bash
   cp .env.development.example .env.development
   # Edit .env.development with your development bot token and test Google Sheet
   ```

   **For Production (Railway):**
   - Set environment variables in Railway dashboard
   - Use `GOOGLE_CREDENTIALS_JSON` instead of file path

4. **Run with Different Environments**

   ```bash
   # Development (uses .env.development)
   NODE_ENV=development npm run dev

   # Production (uses .env.production or Railway variables)
   NODE_ENV=production npm start
   ```

#### **Environment File Priority**

When loading environment variables, the following priority is used (higher priority overrides lower):

1. System environment variables (set in Railway, shell, etc.)
2. `.env.local` (local overrides, not committed to git)
3. `.env.{NODE_ENV}` (e.g., `.env.development`, `.env.production`)
4. `.env` (default fallback)

#### **Best Practices**

- ✅ **Always use a separate test bot** for development to avoid affecting production users
- ✅ **Use separate Google Sheets** for dev and prod to avoid data mixing
- ✅ **Never commit** `.env`, `.env.development`, `.env.production` files (only `.example` files)
- ✅ **Use Railway environment variables** for production instead of `.env.production` file
- ✅ **Use `.env.local`** for personal local overrides that shouldn't be shared

### **Environment Variables**

| Variable                  | Description                                                                 | Required | Notes                                    |
| ------------------------- | --------------------------------------------------------------------------- | -------- | ---------------------------------------- |
| `BOT_TOKEN`               | Telegram bot token from @BotFather                                        | Yes      |                                          |
| `DATABASE_URL`            | Database connection string                                                 | Yes      | Auto-set by Railway for PostgreSQL       |
| `GOOGLE_SHEETS_ID`        | Google Sheet ID (from URL)                                                | Yes      |                                          |
| `GOOGLE_SHEETS_RANGE`     | Sheet range (default: `Sheet1!A:J`)                                       | No       |                                          |
| `GOOGLE_CREDENTIALS_PATH` | Path to Service Account JSON key file                                     | Yes*     | For local development only               |
| `GOOGLE_CREDENTIALS_JSON` | Service Account JSON as single-line string                                | Yes*     | For Railway/production deployment        |
| `NODE_ENV`                | Environment (development/production)                                       | No       | Default: `development`                   |
| `LOG_LEVEL`               | Logging level (error/warn/info/debug)                                     | No       | Default: `info`                         |

\* Either `GOOGLE_CREDENTIALS_PATH` (local) or `GOOGLE_CREDENTIALS_JSON` (production) must be provided

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

### **git-secrets Integration**

The project uses [git-secrets](https://github.com/awslabs/git-secrets) from AWS Labs to automatically detect and prevent committing secrets (API keys, passwords, tokens) to the repository.

#### **Installation**

1. **Install git-secrets system-wide:**

```bash
git clone https://github.com/awslabs/git-secrets.git
cd git-secrets
sudo make install
```

2. **Initialize git-secrets in the repository:**

```bash
npm run secrets:init
```

3. **Configure detection patterns:**

```bash
npm run secrets:setup
```

This will:
- Register AWS patterns (for detecting AWS keys)
- Add custom patterns for Telegram bot tokens
- Add patterns for Google API keys
- Add patterns for private keys

#### **How It Works**

- **Pre-commit hook**: Scans only staged files before each commit (fast)
- **Pre-push hook**: Scans entire repository history before push (thorough)

If git-secrets is not installed, hooks will show a warning but allow the operation to proceed.

#### **Available Commands**

```bash
npm run secrets:check   # Check if git-secrets is installed
npm run secrets:init    # Initialize git-secrets in repository
npm run secrets:setup   # Configure detection patterns
```

#### **Handling False Positives**

If git-secrets detects a false positive (safe pattern that looks like a secret), you can add it to the allowlist:

```bash
git secrets --add --allowed "your-safe-pattern"
```

#### **Troubleshooting**

- **git-secrets not found**: Make sure you've installed it system-wide (see Installation step 1)
- **False positives**: Use `git secrets --add --allowed` to allow safe patterns
- **Hooks not running**: Make sure Husky is initialized (`npm run prepare`)

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
