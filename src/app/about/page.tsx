'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AboutPage() {
  const [email] = useState('spirit1024@outlook.com');

  const handleEmailClick = () => {
    window.location.href = `mailto:${email}`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-12">About PromptShare</h1>
          
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p className="text-gray-700 mb-6">
              PromptShare is dedicated to creating a vibrant community where AI enthusiasts, 
              developers, and creative professionals can discover, share, and collaborate on 
              the best AI prompts. We believe that the power of AI can be unlocked through 
              well-crafted prompts that inspire innovation and productivity.
            </p>
            
            <h2 className="text-2xl font-semibold mb-4">What We Offer</h2>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
              <li>A vast collection of curated AI prompts for various use cases</li>
              <li>Easy search and filtering by category, model, and tags</li>
              <li>Community-driven platform for sharing and rating prompts</li>
              <li>Support for multiple AI models including GPT, Claude, and more</li>
              <li>User-friendly interface for prompt creation and management</li>
            </ul>
            
            <h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>
            <p className="text-gray-700 mb-4">
              Have questions, suggestions, or feedback? We'd love to hear from you!
            </p>
            <p className="text-gray-700 mb-6">
              If you encounter any issues or have ideas for improving PromptShare, 
              please don't hesitate to reach out to us:
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
              <p className="text-lg mb-4">Contact Email:</p>
              <button 
                onClick={handleEmailClick}
                className="text-xl font-semibold text-blue-600 hover:text-blue-800 underline"
              >
                {email}
              </button>
              <p className="mt-4 text-gray-600">
                Click the email address above to send us a message
              </p>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">What is PromptShare?</h3>
                <p className="text-gray-700">
                  PromptShare is a platform for discovering, sharing, and using AI prompts. 
                  Whether you're a beginner or an expert, you can find prompts that help 
                  you get the most out of AI tools.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">How do I contribute prompts?</h3>
                <p className="text-gray-700">
                  After signing up for an account, you can upload your own prompts through 
                  the "Upload Prompt" button in the header. Make sure your prompts are 
                  well-documented and categorized properly.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Is there a cost to use PromptShare?</h3>
                <p className="text-gray-700">
                  PromptShare is completely free to use. We may introduce premium features 
                  in the future, but core functionality will always remain free.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}