import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">PromptShare</h3>
            <p className="text-gray-600 text-sm mb-4">
              A platform for discovering, sharing, and using the best AI prompts
            </p>
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} PromptShare. All rights reserved.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/" className="hover:text-primary-500 transition">Home</Link></li>
              <li><Link href="/prompts" className="hover:text-primary-500 transition">All Prompts</Link></li>
              <li><Link href="/search" className="hover:text-primary-500 transition">Search</Link></li>
              <li><Link href="/upload" className="hover:text-primary-500 transition">Upload Prompt</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/about" className="hover:text-primary-500 transition">About Us</Link></li>
              <li><a href="mailto:spirit1024@outlook.com" className="hover:text-primary-500 transition">Contact Us</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Connect</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="mailto:spirit1024@outlook.com" className="hover:text-primary-500 transition">Email</a></li>
              <li><a href="#" className="hover:text-primary-500 transition">Twitter</a></li>
              <li><a href="#" className="hover:text-primary-500 transition">GitHub</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-6 text-center text-sm text-gray-500">
          <p className="mb-2">Have questions or feedback? Contact us at <a href="mailto:spirit1024@outlook.com" className="text-primary-500 hover:underline">spirit1024@outlook.com</a></p>
          <p>© {new Date().getFullYear()} PromptShare. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}