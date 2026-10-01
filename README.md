# Outlook Email Scanner

A personal Outlook email scanner web app built with Next.js, TypeScript, and Microsoft Graph API. Securely scan and summarize your Outlook emails with AI-powered insights.

## Features

- 🔐 Secure authentication with Microsoft Entra ID (Azure AD)
- 📧 Read-only access to your Outlook mailbox via Microsoft Graph API
- 🤖 AI-powered email summarization (Google Gemini API with fallback to local summarization)
- 📊 Dashboard with email statistics and visualizations
- 📋 Email summaries list with search, filtering, and pagination
- 🌓 Light/dark mode with system preference detection
- 🚀 Deployable for free on Vercel
- 🔒 Privacy-focused: emails processed only for summarization, never stored

## Tech Stack

- [Next.js 14](https://nextjs.org/) (App Router) with TypeScript
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [shadcn/ui](https://ui.shadcn.com/) for reusable components
- [Lucide React](https://lucide.dev/) for icons
- [NextAuth.js v5](https://next-auth.js.org/) with Microsoft Entra ID provider
- [Microsoft Graph API](https://learn.microsoft.com/en-us/graph/) for email access
- [Recharts](https://recharts.org/) for data visualization
- [Google Gemini API](https://ai.google.dev/) (optional) for AI summarization

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Microsoft account (personal Outlook.com/Hotmail or work/school account)
- [Optional] Google Gemini API key for AI-powered summarization

### 1. Register an App in Microsoft Entra ID

1. Go to the [Microsoft Entra admin center](https://entra.microsoft.com/)
2. Navigate to **Identity > Applications > App registrations > New registration**
3. Enter a name for your app (e.g., "Outlook Email Scanner")
4. Supported account types: Select **Accounts in any organizational directory (Any Azure AD directory - Multitenant) and personal Microsoft accounts (e.g. Skype, Xbox)** 
5. Redirect URI: 
   - For development: `http://localhost:3000/api/auth/callback/microsoft-entra-id`
   - For production: `https://your-vercel-domain.vercel.app/api/auth/callback/microsoft-entra-id`
6. Click **Register**

### 2. Configure API Permissions

1. In your app registration, go to **API permissions > Add a permission**
2. Choose **Microsoft Graph > Delegated permissions**
3. Add these permissions:
   - `User.Read` (for basic user profile)
   - `Mail.Read` (for reading emails)
4. Click **Add permissions**
5. Click **Grant admin consent** (if you have admin privileges)

### 3. Create a Client Secret

1. In your app registration, go to **Certificates & secrets > New client secret**
2. Enter a description and set an expiration
3. Click **Add** and copy the client secret value (you won't see it again!)

### 4. Set Up Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Fill in the values:
   - `AUTH_SECRET`: Generate a random string (32+ characters)
   - `AUTH_MICROSOFT_ENTRA_ID_ID`: Your app's client ID from Azure Portal
   - `AUTH_MICROSOFT_ENTRA_ID_SECRET`: The client secret you just created
   - `AUTH_MICROSOFT_ENTRA_ID_TENANT_ID`: Use `common` for multi-tenant or your specific tenant ID
   - `AUTH_URL`: `http://localhost:3000` for development
   - `GEMINI_API_KEY`: [Optional] Get a free key from [Google AI Studio](https://aistudio.google.com/)

### 5. Install Dependencies

```bash
npm install
```

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. Deploy to Vercel

1. Push your code to a GitHub repository
2. Import the project in [Vercel](https://vercel.com/)
3. Add the same environment variables in Vercel's project settings
4. Vercel will automatically build and deploy your app

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `AUTH_SECRET` | Secret for encrypting NextAuth JWT session | Yes |
| `AUTH_MICROSOFT_ENTRA_ID_ID` | Microsoft Entra ID application client ID | Yes |
| `AUTH_MICROSOFT_ENTRA_ID_SECRET` | Microsoft Entra ID application client secret | Yes |
| `AUTH_MICROSOFT_ENTRA_ID_TENANT_ID` | Tenant ID (use `common` for multi-tenant) | No (defaults to `common`) |
| `AUTH_URL` | Base URL for authentication callbacks | No (defaults to `http://localhost:3000`) |
| `GEMINI_API_KEY` | Google Gemini API key for AI summarization | No (fallback to local summarization) |
| `NEXT_PUBLIC_APP_URL` | Public URL of the application | No |

## How It Works

### Authentication

- Uses NextAuth.js v5 with Microsoft Entra ID provider
- Implements refresh token rotation to avoid frequent re-authentication
- Stores tokens in encrypted JWT session (HTTP-only cookies)
- Middleware protects all routes except `/login` and API auth routes

### Email Processing

- Fetches emails via Microsoft Graph API with selective fields:
  ```http
  GET /me/messages?$select=id,subject,from,receivedDateTime,isRead,bodyPreview,body&$orderby=receivedDateTime desc&$top=25
  ```
- Strips HTML from email bodies before processing
- Summarizes emails server-only (never in the browser)
- Caches summaries per message ID to avoid re-processing
- Falls back to local extractive summarization if Gemini API key not provided

### Summarization

- **With Gemini API**: Uses Google's free tier Gemini Pro model for high-quality summaries
- **Without Gemini API**: Falls back to extracting first 1-2 sentences from cleaned body preview
- All processing happens on the server - no email content reaches the browser

### Privacy & Security

- ✅ All Graph API calls happen server-side
- ✅ Tokens never reach the browser
- ✅ Read-only mail access only (no send/delete permissions)
- ✅ Email content processed only for summarization, never stored
- ✅ All secrets stored in environment variables
- ✅ No database required - uses Graph's `isRead` field for read/unread state

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── login/              # Login page
│   ├── summaries/          # Email summaries page
│   ├── dashboard/          # Analytics dashboard
│   └── page.tsx            # Home page
├── components/             # Reusable UI components
├── lib/                    # Utility functions
│   ├── auth.ts             # NextAuth configuration
│   ├── graph.ts            # Microsoft Graph API client
│   └── summarize.ts        # Email summarization logic
├── hooks/                  # Custom React hooks
│   └── use-emails.ts       # Email fetching with summarization
└── utils/                  # Utility functions
```

## Customization

### Adjusting Email Fetch Limits

To change how many emails are fetched per request, modify the `fetchEmails` function in `src/lib/graph.ts`:

```typescript
// In fetchEmails function
$top: '50', // Change from 25 to desired number
```

### Changing Summary Length

To adjust the length of email summaries, modify the summarization options in `src/hooks/use-emails.ts`:

```typescript
// In useEmails hook
const summary = await getCachedSummary(
  email.id,
  email.bodyPreview || email.subject,
  { maxLength: 3 } // Change from 2 to desired number of sentences
);
```

## Troubleshooting

### Authentication Issues

- **Invalid client ID/secret**: Double-check your Microsoft Entra ID app credentials
- **Redirect URI mismatch**: Ensure the redirect URI in Azure Portal matches what NextAuth expects
- **Insufficient permissions**: Verify `User.Read` and `Mail.Read` delegated permissions are granted

### API Rate Limits

- Microsoft Graph API has rate limits - the app includes basic error handling for 429 responses
- Consider implementing exponential backoff for production use
- The free tier of Gemini API also has rate limits

### Development Issues

- **NextAuth error about missing secret**: Generate a strong `AUTH_SECRET` (32+ random characters)
- **CSS not purging**: Ensure Tailwind is configured correctly in `tailwind.config.js`
- **TypeScript errors**: Check that all `.env` variables are properly typed if needed

## License

MIT License - feel free to customize and use for your personal needs.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Authentication powered by [NextAuth.js](https://next-auth.js.org/)
- Email data from [Microsoft Graph API](https://learn.microsoft.com/en-us/graph/)
- UI components inspired by [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Charts powered by [Recharts](https://recharts.org/)