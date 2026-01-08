'use client';

import { useState } from 'react';
import StoryTab from '@/components/StoryTab';
import InteractiveTab from '@/components/InteractiveTab';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'story' | 'interactive'>('story');

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-primary-600 text-white py-6 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                State Millionaire Surtax Calculator
              </h1>
              <p className="text-primary-100 mt-1 text-sm md:text-base">
                Explore how millionaire surtaxes could affect your state taxes
              </p>
            </div>
            <a
              href="https://policyengine.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-primary-100 transition-colors"
            >
              <img
                src="https://policyengine.org/images/logos/policyengine/white.svg"
                alt="PolicyEngine"
                className="h-8 md:h-10"
              />
            </a>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('story')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'story'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              The Story
            </button>
            <button
              onClick={() => setActiveTab('interactive')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'interactive'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Interactive Calculator
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto">
        {activeTab === 'story' ? <StoryTab /> : <InteractiveTab />}
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-600 text-sm">
          <p>
            Built by{' '}
            <a
              href="https://policyengine.org"
              className="text-primary-600 hover:text-primary-700"
            >
              PolicyEngine
            </a>
            . Data and calculations powered by{' '}
            <a
              href="https://github.com/PolicyEngine/policyengine-us"
              className="text-primary-600 hover:text-primary-700"
            >
              PolicyEngine US
            </a>
            .
          </p>
        </div>
      </footer>
    </main>
  );
}
