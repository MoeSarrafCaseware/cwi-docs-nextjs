"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaChevronDown } from "react-icons/fa6";
import { useLanguage } from "./LanguageProvider";

type NavigationItem = {
  name: string;
  href: string;
  children?: NavigationItem[];
};

type NavigationSection = {
  id: string;
  title: string;
  items: NavigationItem[];
};

type SidebarProps = {
  itemPaddingClass?: string;
  indicatorOffsetClass?: string; // e.g. 'left-3'
  indicatorWidthClass?: string; // e.g. 'w-[2px]'
};

// Recursive component for rendering navigation items
function NavigationItemComponent({ 
  item, 
  level = 0, 
  pathname, 
  expandedItems, 
  setExpandedItems,
  parentPath = ""
}: {
  item: NavigationItem;
  level: number;
  pathname: string;
  expandedItems: Set<string>;
  setExpandedItems: (items: Set<string>) => void;
  parentPath?: string;
}) {
  // Use href field directly for navigation, fallback to name-based slug
  const itemSlug = item.href ? item.href : item.name.toLowerCase().replace(/\s+/g, "-");
  const itemPath = item.href ? `/docs${item.href}` : (parentPath ? `${parentPath}/${itemSlug}` : `/docs${itemSlug}`);
  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = expandedItems.has(item.name);
  
  // Check if this item or any of its children are active
  const isActive = (() => {
    if (pathname === itemPath) return true;
    if (hasChildren) {
      const checkChildren = (children: NavigationItem[], currentParentPath: string): boolean => {
        return children.some(child => {
          const childSlug = child.href ? child.href : child.name.toLowerCase().replace(/\s+/g, "-");
          const childPath = child.href ? `/docs${child.href}` : (currentParentPath ? `${currentParentPath}/${childSlug}` : `/docs${childSlug}`);
          if (pathname === childPath) return true;
          if (child.children) return checkChildren(child.children, childPath);
          return false;
        });
      };
      return checkChildren(item.children!, itemPath);
    }
    return false;
  })();

  const toggleExpanded = () => {
    const newExpandedItems = new Set(expandedItems);
    if (isExpanded) {
      newExpandedItems.delete(item.name);
    } else {
      newExpandedItems.add(item.name);
    }
    setExpandedItems(newExpandedItems);
  };

  const marginLeft = level * 16; // 16px per level

  return (
    <li className="relative group">
      <div className="flex items-center">
        {hasChildren ? (
          // Parent items with children are only expandable, not navigable
          <div
            className={`block px-3 py-2 text-sm transition-colors relative flex-1 cursor-pointer hover:bg-gray-800 ${
              isActive
                ? "text-white font-bold border-l border-blue-500 sidebar-active-item"
                : "text-gray-300 hover:text-white"
            }`}
            style={{ marginLeft: `${marginLeft}px` }}
            onClick={toggleExpanded}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleExpanded();
              }
            }}
            aria-expanded={isExpanded}
          >
            {item.name}
          </div>
        ) : (
          // Leaf items without children are navigable links
          <Link
            href={itemPath}
            className={`block px-3 py-2 text-sm transition-colors relative flex-1 ${
              isActive
                ? "text-white font-bold border-l border-blue-500 sidebar-active-item"
                : "text-gray-300 hover:text-white hover:border-l hover:border-red-500"
            }`}
            style={{ marginLeft: `${marginLeft}px` }}
          >
            {item.name}
          </Link>
        )}
        {hasChildren && (
          <button
            className="p-1 text-gray-400 hover:text-white transition-transform"
            onClick={toggleExpanded}
            aria-expanded={isExpanded}
          >
            <FaChevronDown className={`${isExpanded ? "rotate-0" : "-rotate-90"} transform duration-200`} />
          </button>
        )}
      </div>
      {hasChildren && isExpanded && (
        <ul className="space-y-1.5  ml-2">
          {item.children!.map((child, index) => (
            <NavigationItemComponent
              key={index}
              item={child}
              level={level + 1}
              pathname={pathname}
              expandedItems={expandedItems}
              setExpandedItems={setExpandedItems}
              parentPath={itemPath}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function Sidebar({
  itemPaddingClass: _itemPaddingClass = "py-2",
  indicatorOffsetClass: _indicatorOffsetClass = "left-3",
  indicatorWidthClass: _indicatorWidthClass = "w-[2px]",
}: SidebarProps) {
  const { currentLanguage, currentRegion, setLanguage: _setLanguage } = useLanguage();
  const [navigationSections, setNavigationSections] = useState<NavigationSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  // Note: Removed automatic language detection from pathname
  // Language selection should be controlled by the user via the header dropdown
  // The sidebar will only respond to language changes, not initiate them

  // Load navigation data for the current language
  useEffect(() => {
    const loadNavigation = async () => {
      setIsLoading(true);
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
  
  // Track which section id is expanded (accordion behavior)
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);
  
  // Track which items are expanded (for nested items)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  
  // Find which section contains the current page and expand it after hydration
  useEffect(() => {
    const findCurrentSectionAndItems = () => {
      const newExpandedItems = new Set<string>();
      let currentSectionId: string | null = null;

      for (const section of navigationSections) {
        const findInItems = (items: NavigationItem[], parentPath = ""): boolean => {
          for (const item of items) {
            const itemSlug = item.href ? item.href : item.name.toLowerCase().replace(/\s+/g, "-");
            const itemPath = item.href ? `/docs${item.href}` : (parentPath ? `${parentPath}/${itemSlug}` : `/docs${itemSlug}`);
            
            if (pathname === itemPath) {
              currentSectionId = section.id;
              return true;
            }
            if (item.children) {
              if (findInItems(item.children, itemPath)) {
                newExpandedItems.add(item.name);
                return true;
              }
            }
          }
          return false;
        };

        if (findInItems(section.items)) {
          break;
        }
      }

      return { currentSectionId, newExpandedItems };
    };
    
    const { currentSectionId, newExpandedItems } = findCurrentSectionAndItems();
    if (currentSectionId) {
      setExpandedSectionId(currentSectionId);
    }
    setExpandedItems(newExpandedItems);

    // Auto-scroll to the active item after a short delay to allow for expansion
    setTimeout(() => {
      const activeItem = document.querySelector('.sidebar-active-item');
      const sidebarContainer = document.querySelector('aside.w-64.bg-gray-900');
      
      if (activeItem && sidebarContainer) {
        // Get the position of the active item relative to the sidebar container
        const activeItemRect = activeItem.getBoundingClientRect();
        const sidebarRect = sidebarContainer.getBoundingClientRect();
        
        // Calculate the scroll position needed to center the active item
        const itemTop = activeItemRect.top - sidebarRect.top + sidebarContainer.scrollTop;
        const itemHeight = activeItemRect.height;
        const containerHeight = sidebarContainer.clientHeight;
        
        // Calculate the target scroll position to center the item
        const targetScrollTop = itemTop - (containerHeight / 2) + (itemHeight / 2);
        
        // Smooth scroll within the sidebar container only
        sidebarContainer.scrollTo({
          top: Math.max(0, targetScrollTop),
          behavior: 'smooth'
        });
      }
    }, 100);
  }, [pathname, navigationSections]);

  if (isLoading) {
    return (
      <aside className="w-64 bg-gray-900 text-white overflow-y-auto h-[calc(100vh-4rem)] sticky top-16">
        <nav className="p-4">
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-400">Loading navigation...</div>
          </div>
        </nav>
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-gray-900 text-white overflow-y-auto h-[calc(100vh-4rem)] sticky top-16">
      <nav className="p-4">
        {/* Documentation Sections */}
        {navigationSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-6">
            <div 
              className="flex items-center justify-between cursor-pointer hover:bg-gray-800 px-2 py-1 transition-colors"
              onClick={() =>
                setExpandedSectionId(prev => (prev === section.id ? null : section.id))
              }
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setExpandedSectionId(prev => (prev === section.id ? null : section.id));
                }
              }}
              aria-expanded={expandedSectionId === section.id}
              aria-controls={`section-list-${section.id}`}
            >
              <h3 id={`section-${section.id}`} className="text-xs font-semibold text-gray-400 uppercase tracking-wider my-2">
                {section.title}
              </h3>
              <div className="my-2 text-gray-400 hover:text-white transition-transform">
                <FaChevronDown className={`${expandedSectionId === section.id ? "rotate-0" : "-rotate-90"} transform duration-200`} />
              </div>
            </div>
            {expandedSectionId === section.id && (
              <ul className="space-y-1.5  ml-2">
                {section.items.map((item: NavigationItem, itemIndex: number) => (
                  <NavigationItemComponent
                    key={itemIndex}
                    item={item}
                    level={0}
                    pathname={pathname}
                    expandedItems={expandedItems}
                    setExpandedItems={setExpandedItems}
                    parentPath=""
                  />
                ))}
              </ul>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
