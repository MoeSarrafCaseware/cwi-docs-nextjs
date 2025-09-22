'use client';

import { useState } from 'react';
import sidebarData from '../../content/sidebar-navigation-en-us.json';

// TypeScript interfaces for the sidebar data
interface NavigationItem {
    name: string;
    href: string | null;
    children?: NavigationItem[];
}

interface NavigationSection {
    id: string;
    title: string;
    items: NavigationItem[];
}

interface SidebarData {
    language: string;
    region: string;
    navigationSections: NavigationSection[];
}

interface SidebarProps {
    data?: SidebarData;
}

export default function Sidebar({ data = sidebarData }: SidebarProps) {
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
    const [activeItem, setActiveItem] = useState<string | null>(null);
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [showSearch, setShowSearch] = useState<boolean>(false);

    const toggleExpanded = (itemName: string) => {
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(itemName)) {
            newExpanded.delete(itemName);
        } else {
            newExpanded.add(itemName);
        }
        setExpandedItems(newExpanded);
    };

    const expandAll = () => {
        const allItems = new Set<string>();
        const collectItems = (items: NavigationItem[]) => {
            items.forEach(item => {
                if (item.children) {
                    allItems.add(item.name);
                    collectItems(item.children);
                }
            });
        };
        data.navigationSections.forEach(section => collectItems(section.items));
        setExpandedItems(allItems);
    };

    const collapseAll = () => {
        setExpandedItems(new Set());
    };

    const filterItems = (items: NavigationItem[]): NavigationItem[] => {
        if (!searchTerm) return items;
        
        return items.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
            const hasMatchingChildren = item.children ? filterItems(item.children).length > 0 : false;
            return matchesSearch || hasMatchingChildren;
        }).map(item => ({
            ...item,
            children: item.children ? filterItems(item.children) : undefined
        }));
    };

    const renderNavigationItem = (item: NavigationItem, level: number = 0) => {
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedItems.has(item.name);
        const isActive = activeItem === item.name;
        const _isHovered = hoveredItem === item.name;

        return (
            <div key={item.name} className="relative">
                <div className="flex items-center">
                    <button
                        onClick={() => {
                            if (hasChildren) {
                                toggleExpanded(item.name);
                            } else if (item.href) {
                                setActiveItem(item.name);
                            }
                        }}
                        onMouseEnter={() => setHoveredItem(item.name)}
                        onMouseLeave={() => setHoveredItem(null)}
                        className={`flex items-center justify-between w-full text-left py-1 px-2 rounded text-sm transition-all duration-200 ${
                            hasChildren 
                                ? 'cursor-pointer  hover:text-blue-600' 
                                : item.href 
                                    ? 'cursor-pointer  hover:text-blue-600' 
                                    : 'cursor-default'
                        } ${isActive ? 'text-blue-600 ' : 'text-gray-300'}`}
                    >
                        <span className="flex-1">{item.name}</span>
                        {hasChildren && (
                            <svg
                                className={`w-3 h-3 text-gray-400 transition-transform ${
                                    isExpanded ? 'rotate-90' : ''
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                />
                            </svg>
                        )}
                    </button>
                </div>
                
                {/* Blue highlight line for active items */}
                {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-400 z-10"></div>
                )}
                
                {hasChildren && isExpanded && (
                    <div className="ml-4 relative">
                        {/* Continuous vertical line for all children - spans entire nested section */}
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-400"></div>
                        {item.children!.map((child) => renderNavigationItem(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="w-80 bg-black text-white h-screen overflow-y-auto">
            <div className="p-4">
                {/* Search and Controls */}
                <div className="mb-4 space-y-2">
                    <div className="flex items-center justify-between">
                        <h2 className="text-gray-400 text-xs font-mono uppercase tracking-wider">
                            Navigation
                        </h2>
                        <div className="flex space-x-1">
                            <button
                                onClick={() => setShowSearch(!showSearch)}
                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                title="Search"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>
                            <button
                                onClick={expandAll}
                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                title="Expand All"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            <button
                                onClick={collapseAll}
                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                title="Collapse All"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    
                    {showSearch && (
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search navigation..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-2 top-2 text-gray-400 hover:text-blue-600"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Navigation Sections */}
                {data.navigationSections.map((section) => {
                    const filteredItems = filterItems(section.items);
                    if (filteredItems.length === 0 && searchTerm) return null;
                    
                    return (
                        <div key={section.id} className="mb-6">
                            <h2 className="text-gray-400 text-xs font-mono uppercase tracking-wider mb-3">
                                {section.title}
                            </h2>
                            <div className="space-y-0">
                                {filteredItems.map((item) => renderNavigationItem(item))}
                            </div>
                        </div>
                    );
                })}
                
                {searchTerm && data.navigationSections.every(section => filterItems(section.items).length === 0) && (
                    <div className="text-center text-gray-400 py-8">
                        <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <p>No results found for &quot;{searchTerm}&quot;</p>
                    </div>
                )}
            </div>
        </div>
    );
}