import Link from 'next/link';

export const metadata = {
  title: 'My App',
  description: 'This is my app where you can chat and view history.',
};

export default function Layout({ children }) {
  return (
    <html lang="en">
      <head>
    
      </head>
      <body className="font-sans bg-gray-100 text-gray-900">
        <div className="flex flex-col min-h-screen">
     
          <nav className="bg-gray-800 text-white py-4 shadow-md">
            <div className="container mx-auto flex justify-center space-x-6">
              <Link href="/chat" className="hover:text-indigo-500 text-lg font-semibold">Chat</Link>
              <Link href="/history" className="hover:text-indigo-500 text-lg font-semibold">History</Link>
            </div>
          </nav>

          <main className="flex-grow p-8">
            {children}
          </main>
          
        
          <footer className="bg-gray-800 text-white py-4 text-center">
            <p>&copy; 2025 My App. All rights reserved.</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
