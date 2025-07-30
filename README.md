# SisuKai eLearning Platform

A comprehensive, adaptive eLearning platform built with Next.js 14, TypeScript, and Tailwind CSS. SisuKai provides personalized learning experiences with gamification, adaptive algorithms, and comprehensive administrative tools.

## 🚀 Features

### For Learners
- **Adaptive Learning Paths**: Personalized content based on mastery levels
- **Interactive Lessons**: Engaging content with real-time feedback
- **Comprehensive Exam System**: Full simulations, quick quizzes, and domain-specific practice
- **Gamification**: XP points, streaks, levels, and achievements
- **Progress Tracking**: Detailed analytics and performance insights

### For Administrators
- **User Management**: Comprehensive user and role management
- **Content Management**: AI-powered content generation and curation
- **Analytics Dashboard**: Platform statistics and performance metrics
- **Certification Management**: Complete certification lifecycle management
- **Payment Integration**: Subscription and tier management

## 🛠 Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS with custom components
- **Icons**: Lucide React
- **State Management**: React Context API
- **Testing**: Jest with comprehensive unit tests
- **Data**: Mock data system for development

## 📦 Getting Started

### Prerequisites
- Node.js 20.18.0 or later
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone git@github.com:SisuKai-AI/sisukai-app.git
cd sisukai-app
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run unit tests
- `npm run test:coverage` - Run tests with coverage report

## 🧪 Testing

The project includes comprehensive unit tests for critical backend functions:

- **Adaptive Learning Algorithm Tests**: 12 tests validating learning path generation
- **Mastery Calculation Tests**: 16 tests ensuring accurate progress tracking
- **Payment Webhook Tests**: 14 tests covering subscription management

Run tests with:
```bash
npm test
```

## 👥 User Types

### Free User (Alex Johnson)
- Limited access to 3 topics
- Basic learning features
- Upgrade prompts and limitations

### Pro User (Sarah Chen)
- Full access to all content
- Adaptive learning paths
- Advanced gamification features

### Admin User (Jordan Smith)
- Complete platform management
- User and content administration
- Analytics and reporting tools

## 🏗 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard and tools
│   ├── certifications/    # Certification catalog
│   ├── dashboard/         # User dashboards
│   ├── exam/              # Exam system
│   ├── learn/             # Learning interface
│   └── ...
├── components/            # Reusable UI components
├── contexts/              # React Context providers
├── lib/                   # Utilities and mock data
└── __tests__/             # Unit test suite
```

## 🔧 Configuration

The application uses several configuration files:

- `next.config.js` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `jest.config.js` - Jest testing configuration
- `tsconfig.json` - TypeScript configuration

## 📊 Features Overview

### Authentication System
- Multi-user type selection
- Role-based access control
- Persistent authentication state

### Learning Management
- Interactive lesson interface
- Adaptive content delivery
- Progress tracking and analytics

### Exam System
- Full simulation exams with timers
- Quick assessments and practice tests
- Comprehensive results and feedback

### Administrative Tools
- User management with role controls
- Content generation and management
- Platform analytics and reporting

## 🚀 Deployment

The application is optimized for deployment on modern hosting platforms:

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## 🤝 Contributing

This project follows modern development practices:

- TypeScript for type safety
- Comprehensive testing with Jest
- Component-based architecture
- Responsive design principles

## 📄 License

This project is part of the SisuKai AI platform development.

## 🔗 Links

- **Live Demo**: [SisuKai Platform](https://3003-im7v3y0wdj4tx2lpkzauo-02606e23.manusvm.computer)
- **Documentation**: Comprehensive docs included in project
- **Testing Report**: See `SisuKai_Unit_Testing_Report.md`

---

Built with ❤️ by the SisuKai AI team using Next.js and modern web technologies.

