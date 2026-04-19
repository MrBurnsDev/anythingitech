'use client';

import { useState, useMemo } from 'react';
import { Business, towns, getAllCategories } from '@/data/directory';
import BusinessCard from './BusinessCard';

interface DirectorySearchProps {
  businesses: Business[];
  showTownFilter?: boolean;
}

export default function DirectorySearch({ businesses, showTownFilter = true }: DirectorySearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTown, setSelectedTown] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = useMemo(() => getAllCategories(), []);

  const filteredBusinesses = useMemo(() => {
    return businesses.filter(business => {
      const matchesSearch = searchTerm === '' ||
        business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTown = selectedTown === '' || business.town === selectedTown;
      const matchesCategory = selectedCategory === '' || business.category === selectedCategory;

      return matchesSearch && matchesTown && matchesCategory;
    });
  }, [businesses, searchTerm, selectedTown, selectedCategory]);

  return (
    <div>
      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-[var(--color-border-light)] p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="md:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
              Search Businesses
            </label>
            <div className="relative">
              <input
                type="text"
                id="search"
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-10 border border-[var(--color-border-light)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
          </div>

          {/* Town Filter */}
          {showTownFilter && (
            <div>
              <label htmlFor="town" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                Town
              </label>
              <select
                id="town"
                value={selectedTown}
                onChange={(e) => setSelectedTown(e.target.value)}
                className="w-full px-4 py-3 border border-[var(--color-border-light)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent bg-white"
              >
                <option value="">All Towns</option>
                {towns.map(town => (
                  <option key={town.slug} value={town.slug}>{town.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Category Filter */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
              Category
            </label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 border border-[var(--color-border-light)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent bg-white"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-[var(--color-text-secondary)] mt-4">
          Showing {filteredBusinesses.length} of {businesses.length} businesses
        </p>
      </div>

      {/* Results Grid */}
      {filteredBusinesses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBusinesses.map(business => (
            <BusinessCard key={business.id} business={business} showTown={showTownFilter} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-[var(--color-text-secondary)]">
            No businesses found matching your criteria.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedTown('');
              setSelectedCategory('');
            }}
            className="mt-4 text-[var(--color-primary)] hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
