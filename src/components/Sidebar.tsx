'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import { useRouter, usePathname } from 'next/navigation';

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

export default function Sidebar({ data: _data }: SidebarProps) {
    const { currentLanguage, currentRegion } = useLanguage();
    const router = useRouter();
    const pathname = usePathname();
    const [navigationSections, setNavigationSections] = useState<NavigationSection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
    const [activeItem, setActiveItem] = useState<string | null>(null);
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);

    // Load navigation data for the current language
    useEffect(() => {
        const loadNavigation = async () => {
            setIsLoading(true);
            // Clear state when language changes to prevent conflicts
            setExpandedItems(new Set());
            setActiveItem(null);
            setHoveredItem(null);
            
            try {
                // Try to load language-region specific navigation first
                const response = await fetch(`/api/navigation/${currentLanguage}?region=${currentRegion}`);
                if (response.ok) {
                    const data = await response.json();
                    setNavigationSections(data.navigationSections || []);
                } else {
                    // Fallback to default navigation
                    const fallbackResponse = await fetch('/api/navigation');
                    if (fallbackResponse.ok) {
                        const fallbackData = await fallbackResponse.json();
                        setNavigationSections(fallbackData.navigationSections || []);
                    } else {
                        // No fallback - show empty navigation
                        setNavigationSections([]);
                    }
                }
            } catch (error) {
                console.error('Failed to load navigation:', error);
                // No fallback - show empty navigation
                setNavigationSections([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadNavigation();
    }, [currentLanguage, currentRegion]);

    // Detect active item and expand parent items based on current pathname
    useEffect(() => {
        if (navigationSections.length === 0) return;

        const findActiveItemAndExpandParents = () => {
            const newExpandedItems = new Set<string>();
            let foundActiveItem: string | null = null;

            // Extract the href path from the current pathname
            // For /docs/en/Content/Explore/Whats-New/Whats-new-Cloud.htm
            // We want to find the item with href="/en/Content/Explore/Whats-New/Whats-new-Cloud.htm"
            const pathSegments = pathname.split('/');
            const docsIndex = pathSegments.findIndex(segment => segment === 'docs');
            
            if (docsIndex !== -1) {
                // Reconstruct the href path starting from the language segment
                const hrefPath = '/' + pathSegments.slice(docsIndex + 1).join('/');
                
                // Find the matching item in navigation
                const findItem = (items: NavigationItem[], parentPath = ""): boolean => {
                    for (const item of items) {
                        if (item.href === hrefPath) {
                            foundActiveItem = item.name;
                            return true;
                        }
                        if (item.children) {
                            if (findItem(item.children, item.href || parentPath)) {
                                newExpandedItems.add(item.name);
                                return true;
                            }
                        }
                    }
                    return false;
                };

                for (const section of navigationSections) {
                    if (findItem(section.items)) {
                        break;
                    }
                }
            }

            setActiveItem(foundActiveItem);
            setExpandedItems(newExpandedItems);
        };

        // Add a small delay to ensure navigation data is fully loaded
        const timeoutId = setTimeout(findActiveItemAndExpandParents, 100);
        return () => clearTimeout(timeoutId);
    }, [pathname, navigationSections]);

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
        navigationSections.forEach(section => collectItems(section.items));
        setExpandedItems(allItems);
    };

    const collapseAll = () => {
        setExpandedItems(new Set());
    };


    const handleItemClick = (item: NavigationItem) => {
        if (item.href) {
            // Navigate to the HTML file in the docs route
            router.push(`/docs${item.href}`);
            setActiveItem(item.name);
        }
    };

    const renderNavigationItem = (item: NavigationItem, level: number = 0, parentPath: string = '', index: number = 0) => {
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedItems.has(item.name);
        const isActive = activeItem === item.name;
        const _isHovered = hoveredItem === item.name;

        // Create unique key by combining language, region, item name, href, parent path, level, and index
        // This ensures uniqueness even for items with the same name and no href
        const uniqueKey = `${currentLanguage}-${currentRegion}-${parentPath}-${item.name}-${item.href || 'no-href'}-${level}-${index}`;

        return (
            <div key={uniqueKey} className="relative">
                <div className="flex items-center">
                    <button
                        onClick={() => {
                            if (hasChildren) {
                                toggleExpanded(item.name);
                            } else if (item.href) {
                                handleItemClick(item);
                            }
                        }}
                        onMouseEnter={() => setHoveredItem(item.name)}
                        onMouseLeave={() => setHoveredItem(null)}
                        className={`flex items-center justify-between w-full text-left py-1 px-2 rounded text-sm transition-all duration-200 ${
                            hasChildren 
                                ? 'cursor-pointer hover:text-purple-400' 
                                : item.href 
                                    ? 'cursor-pointer hover:text-cyan-400' 
                                    : 'cursor-default'
                        } ${isActive ? 'text-cyan-400' : 'text-gray-300'}`}
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
                
                {/* Purple highlight line for active items */}
                {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-purple-400 z-10"></div>
                )}
                
                {hasChildren && isExpanded && (
                    <div className="ml-4 relative">
                        {/* Continuous vertical line for all children - spans entire nested section */}
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-cyan-400/50"></div>
                        {item.children!.map((child, childIndex) => renderNavigationItem(child, level + 1, `${parentPath}-${item.name}`, childIndex))}
                    </div>
                )}
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="w-80 bg-black text-white h-screen overflow-y-auto border-r border-purple-900/30">
                <div className="p-4">
                    <div className="flex items-center justify-center h-32">
                        <div className="text-purple-400">Loading navigation...</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-80 bg-black text-white h-screen overflow-y-auto border-r border-purple-900/30">
            <div className="p-4">
                {/* Navigation Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-purple-400 text-xs font-mono uppercase tracking-wider">
                            Navigation
                        </h2>
                        <div className="flex space-x-1">
                            <button
                                onClick={expandAll}
                                className="p-1 text-gray-400 hover:text-purple-400 transition-colors"
                                title="Expand All"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            <button
                                onClick={collapseAll}
                                className="p-1 text-gray-400 hover:text-purple-400 transition-colors"
                                title="Collapse All"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Navigation Sections */}
                {navigationSections.map((section) => (
                    <div key={section.id} className="mb-6">
                        <h2 className="text-cyan-400 text-xs font-mono uppercase tracking-wider mb-3">
                            {section.title}
                        </h2>
                        <div className="space-y-0">
                            {section.items.map((item, index) => renderNavigationItem(item, 0, section.id, index))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
