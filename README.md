# PromptHub - AI Prompt Marketplace

PromptHub is a platform for discovering, sharing, and using the best AI prompts. This is the English-only version ready for deployment to Vercel.

![GitHub](https://img.shields.io/github/license/yourusername/prompthub)
![GitHub issues](https://img.shields.io/github/issues/yourusername/prompthub)
![GitHub stars](https://img.shields.io/github/stars/yourusername/prompthub)

## Features

- 🚀 **Browse and search AI prompts** - Find the perfect prompt for your needs
- 📤 **Upload and share your own prompts** - Contribute to the community
- 🔐 **User authentication with Supabase** - Secure login and registration
- 📱 **Responsive design with Tailwind CSS** - Works on all devices
- 🌐 **English-only interface** - Clean and focused user experience
- 🛠️ **Admin dashboard** - Manage content and users
- 💾 **Supabase backend** - Reliable database and authentication

## Tech Stack

- **Frontend**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Backend**: [Supabase](https://supabase.io/) (PostgreSQL + Auth + Storage)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Deployment**: [Vercel](https://vercel.com/)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A Supabase account
- An OpenAI API key (optional)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/prompthub.git
   cd prompthub
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with your configuration:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   OPENAI_API_KEY=your_openai_api_key
   ```

4. Set up your Supabase database:
   - Follow the instructions in `SUPABASE_SETUP.md`
   - Run the SQL scripts in `supabase_schema.sql`

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Vercel

This version is configured for deployment to Vercel. Follow these steps:

1. Push this code to a GitHub repository
2. Go to [Vercel](https://vercel.com) and create a new project
3. Import your GitHub repository
4. Configure the environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
   - `OPENAI_API_KEY` - Your OpenAI API key (optional)
5. Deploy the project

## Database Setup

Refer to `SUPABASE_SETUP.md` for detailed instructions on setting up your Supabase database, including:
- Creating tables
- Setting up Row Level Security (RLS)
- Creating indexes
- Setting up admin users

## Project Structure

```
my-prompthub/
├── .env.local              # Environment variables (not committed)
├── .env.local.example      # Example environment variables
├── .gitignore              # Git ignore file
├── next.config.js          # Next.js configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
├── package.json            # Project dependencies
├── components.json         # shadcn/ui configuration
│
├── /src
│   ├── /app                # Next.js App Router pages
│   ├── /components         # React components
│   ├── /hooks              # Custom React hooks
│   ├── /lib                # Utility functions and configurations
│   ├── /services           # Business logic and API services
│   ├── /store              # State management (Zustand)
│   ├── /styles             # Global styles
│   └── /types              # TypeScript types
│
├── /public                 # Static assets
└── README.md               # This file
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For questions, suggestions, or feedback, please contact us at:
spirit1024@outlook.com

Or visit our website for more information.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)