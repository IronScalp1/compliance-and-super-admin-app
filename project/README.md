# Fellow Carer - Multi-Tenant Compliance Platform

A comprehensive web application for homecare agencies to manage carers, track documents, and maintain compliance with intelligent automation and real-time monitoring.

## Features

### For Care Agencies
- **Carer Management**: Complete profiles with real-time compliance status
- **Document Storage**: Secure file uploads with expiry tracking
- **Compliance Engine**: Intelligent RAG (Red/Amber/Green) status system
- **Smart Alerts**: Automated email reminders for expiring documents
- **Professional Reports**: Export compliance summaries with Fellow Carer branding
- **Team Collaboration**: Role-based access for owners, admins, managers, and viewers

### For Super Admins (Fellow Carer HQ)
- **Multi-Tenant Management**: Control all agency accounts from one dashboard
- **Subscription Management**: Stripe integration for billing and seat limits
- **Global Templates**: Centralized document template library with version control
- **Audit Logging**: Complete activity tracking with impersonation capabilities
- **Health Monitoring**: System health dashboard with performance metrics
- **Impersonation**: Safely view any agency account with full audit trail

## Tech Stack

- **Frontend**: React 18 + TypeScript, Vite, Tailwind CSS
- **UI Components**: shadcn/ui, Lucide React icons
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **State Management**: TanStack Query, Zustand
- **Forms**: React Hook Form + Zod validation
- **Payments**: Stripe (Checkout + Customer Portal + Webhooks)
- **Security**: Row Level Security (RLS), signed URLs, JWT tokens

## Quick Start

### Prerequisites
- Node.js 18+ and npm/pnpm
- Supabase project
- Stripe account

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd fellow-carer
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

3. **Database Setup**
   - Connect your Supabase project using the "Connect to Supabase" button
   - Run migrations: `npm run db:migrate`
   - Seed test data: `npm run db:seed`

4. **Start Development Server**
   ```bash
   npm run dev
   ```

### Stripe Setup

1. Create a Stripe account and get your API keys
2. Set up webhook endpoint: `your_domain/webhooks/stripe`
3. Subscribe to these events:
   - `customer.subscription.created`
   - `customer.subscription.updated` 
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

## Database Schema

The application uses a multi-tenant architecture with strict row-level security:

### Core Tables
- `agencies` - Tenant organizations
- `users` - Global user accounts  
- `agency_members` - User-tenant relationships
- `carers` - Care workers managed by agencies
- `document_templates` - Global template library
- `carer_documents` - Uploaded compliance files
- `compliance_snapshots` - Historical compliance data
- `audit_logs` - System activity tracking

### Security Model
- **Row Level Security**: All tenant data is isolated using RLS policies
- **Super Admin Access**: Service role can bypass RLS for management tasks
- **Signed URLs**: All file access uses temporary signed URLs
- **Audit Trail**: All privileged actions are logged with context

## Compliance Engine

The intelligent compliance system automatically calculates status using:

- **Green** (✓): Documents valid for >30 days
- **Amber** (⚠): Documents expire within 30 days  
- **Red** (✕): Missing or expired documents

Agency scores are calculated as weighted averages of all carers' individual compliance status.

## Multi-Tenancy

### Tenant Isolation
- Each agency operates in its own secure environment
- Data access controlled by Supabase RLS policies
- Shared database with complete logical separation

### Super Admin Features
- Impersonate any agency with full audit logging
- Manage subscriptions and billing centrally
- Push template updates to all agencies
- Monitor system health and performance

## API & Integrations

### Supabase Edge Functions
- `compliance-calculator` - Nightly compliance scoring
- `stripe-webhooks` - Payment processing
- `email-notifications` - Automated reminders
- `pdf-generator` - Report generation

### Stripe Integration
- Subscription management with seat-based billing
- Customer portal for self-service billing
- Webhook processing for real-time updates
- Failed payment handling and retry logic

## Testing

```bash
# Run unit tests
npm run test

# Run E2E tests
npm run test:e2e

# Type checking
npm run type-check

# Linting
npm run lint
```

### Test Coverage
- Authentication flows
- RLS policy enforcement
- File upload and storage
- Compliance calculations
- Stripe webhook processing

## Deployment

### Frontend (Vercel)
```bash
npm run build
vercel --prod
```

### Database (Supabase)
- Migrations are automatically applied
- Edge functions deploy with CLI or GitHub Actions

### Environment Variables
Set these in your production environment:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`  
- `VITE_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

## Development Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run preview         # Preview production build

# Database
npm run db:migrate      # Run database migrations
npm run db:seed         # Seed test data
npm run db:reset        # Reset database (dev only)

# Testing
npm run test            # Run unit tests
npm run test:e2e        # Run end-to-end tests
npm run type-check      # TypeScript checking
npm run lint            # ESLint checking

# Super Admin
npm run admin:create    # Create super admin user
```

## Happy Path Checklist

### Agency Onboarding
- [ ] Sign up with email/password
- [ ] Complete agency setup wizard
- [ ] Choose subscription plan (Starter/Team/Business)
- [ ] Add first carer with basic details
- [ ] Upload first compliance document
- [ ] View compliance status update to Green
- [ ] Receive email confirmation

### Super Admin Workflow
- [ ] Access super admin panel
- [ ] View all agencies and their status
- [ ] Impersonate an agency (with banner)
- [ ] Make changes as agency
- [ ] Exit impersonation mode
- [ ] View audit log of impersonation

### Billing Integration
- [ ] Upgrade subscription plan
- [ ] Add additional seats
- [ ] Access Stripe customer portal
- [ ] Update payment method
- [ ] View billing history

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is proprietary software owned by Fellow Carer Ltd.

## Support

For technical support or questions:
- Email: support@fellowcarer.com
- Documentation: https://docs.fellowcarer.com
- Status Page: https://status.fellowcarer.com