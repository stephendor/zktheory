import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Navigation item types
export interface NavigationItem {
  id: string;
  title: string;
  path: string;
  type: 'page' | 'tool' | 'documentation' | 'blog';
  category?: string;
  tags?: string[];
  relatedConcepts?: string[];
  description?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  estimatedReadTime?: number;
}

// Breadcrumb item
export interface BreadcrumbItem {
  title: string;
  path: string;
  isCurrentPage?: boolean;
}

// Cross-reference suggestion
export interface CrossReference {
  id: string;
  title: string;
  path: string;
  type: 'related' | 'prerequisite' | 'next-step' | 'application';
  reason: string;
  relevanceScore: number;
}

// Navigation preferences
export interface NavigationPreferences {
  preferredLayout: 'detailed' | 'compact';
  showBreadcrumbs: boolean;
  showCrossReferences: boolean;
  maxCrossReferences: number;
  autoExpandSubNavs: boolean;
}

// Navigation state interface
interface NavigationState {
  // Current navigation state
  currentPath: string;
  breadcrumbs: BreadcrumbItem[];
  crossReferences: CrossReference[];
  
  // Navigation items registry
  navigationItems: NavigationItem[];
  recentPages: NavigationItem[];
  
  // User preferences
  preferences: NavigationPreferences;
  
  // UI state
  isSearchOpen: boolean;
  isMobileMenuOpen: boolean;
  expandedSubNavs: string[];
  
  // Actions
  setCurrentPath: (path: string) => void;
  updateBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
  generateCrossReferences: (currentItem: NavigationItem) => void;
  addToRecentPages: (item: NavigationItem) => void;
  updatePreferences: (preferences: Partial<NavigationPreferences>) => void;
  setSearchOpen: (open: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  toggleSubNav: (id: string) => void;
  registerNavigationItem: (item: NavigationItem) => void;
  findRelatedItems: (item: NavigationItem) => NavigationItem[];
}

// Default navigation items (mathematical tools and documentation)
const defaultNavigationItems: NavigationItem[] = [
  {
    id: 'cayley-graph',
    title: 'Cayley Graph Explorer',
    path: '/projects/cayleygraph',
    type: 'tool',
    category: 'Group Theory',
    tags: ['group-theory', 'visualization', 'interactive', 'algebra'],
    relatedConcepts: ['finite-groups', 'generators', 'group-structure', 'symmetry'],
    description: 'Interactive exploration of Cayley graphs for finite groups',
    difficulty: 'intermediate',
    estimatedReadTime: 10
  },
  {
    id: 'tda-explorer',
    title: 'TDA Explorer',
    path: '/projects/tda-explorer',
    type: 'tool',
    category: 'Topology',
    tags: ['topology', 'data-analysis', 'persistent-homology', 'visualization'],
    relatedConcepts: ['homology', 'persistence', 'point-clouds', 'mapper'],
    description: 'Topological Data Analysis with persistence diagrams and barcodes',
    difficulty: 'advanced',
    estimatedReadTime: 15
  },
  {
    id: 'cayley-notebook',
    title: 'Cayley Graph Jupyter Notebook',
    path: '/projects/cayley-notebook',
    type: 'documentation',
    category: 'Group Theory',
    tags: ['jupyter', 'sagemath', 'group-theory', 'computational'],
    relatedConcepts: ['finite-groups', 'computational-algebra', 'sagemath'],
    description: 'Complete SageMath implementation with interactive widgets',
    difficulty: 'intermediate',
    estimatedReadTime: 20
  },
  {
    id: 'library',
    title: 'Mathematical Library',
    path: '/library',
    type: 'documentation',
    category: 'Reference',
    tags: ['reference', 'definitions', 'theorems', 'library'],
    relatedConcepts: ['mathematics', 'reference', 'definitions'],
    description: 'Comprehensive mathematical reference and definitions',
    difficulty: 'beginner',
    estimatedReadTime: 5
  },
  {
    id: 'blog',
    title: 'Research Blog',
    path: '/blog',
    type: 'blog',
    category: 'Research',
    tags: ['research', 'articles', 'insights', 'mathematics'],
    relatedConcepts: ['research', 'mathematics', 'insights'],
    description: 'Latest research insights and mathematical explorations',
    difficulty: 'intermediate',
    estimatedReadTime: 8
  }
];

// Default preferences
const defaultPreferences: NavigationPreferences = {
  preferredLayout: 'detailed',
  showBreadcrumbs: true,
  showCrossReferences: true,
  maxCrossReferences: 4,
  autoExpandSubNavs: false
};

export const useNavigationStore = create<NavigationState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentPath: '/',
      breadcrumbs: [],
      crossReferences: [],
      navigationItems: defaultNavigationItems,
      recentPages: [],
      preferences: defaultPreferences,
      isSearchOpen: false,
      isMobileMenuOpen: false,
      expandedSubNavs: [],

      // Actions
      setCurrentPath: (path: string) => {
        set({ currentPath: path });
        
        // Auto-generate breadcrumbs based on path
        const pathSegments = path.split('/').filter(Boolean);
        const breadcrumbs: BreadcrumbItem[] = [
          { title: 'Home', path: '/' }
        ];
        
        let currentPath = '';
        pathSegments.forEach((segment, index) => {
          currentPath += '/' + segment;
          const isLast = index === pathSegments.length - 1;
          
          // Find navigation item for this path
          const navItem = get().navigationItems.find(item => item.path === currentPath);
          const title = navItem?.title || segment.charAt(0).toUpperCase() + segment.slice(1);
          
          breadcrumbs.push({
            title,
            path: currentPath,
            isCurrentPage: isLast
          });
        });
        
        get().updateBreadcrumbs(breadcrumbs);
        
        // Generate cross-references for current page
        const currentItem = get().navigationItems.find(item => item.path === path);
        if (currentItem) {
          get().generateCrossReferences(currentItem);
          get().addToRecentPages(currentItem);
        }
      },

      updateBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => {
        set({ breadcrumbs });
      },

      generateCrossReferences: (currentItem: NavigationItem) => {
        const allItems = get().navigationItems;
        const crossReferences: CrossReference[] = [];
        
        // Find related items based on shared concepts, tags, and categories
        allItems.forEach(item => {
          if (item.id === currentItem.id) return;
          
          let relevanceScore = 0;
          let reason = '';
          let type: CrossReference['type'] = 'related';
          
          // Check for shared concepts
          const sharedConcepts = currentItem.relatedConcepts?.filter(concept =>
            item.relatedConcepts?.includes(concept)
          ) || [];
          
          // Check for shared tags
          const sharedTags = currentItem.tags?.filter(tag =>
            item.tags?.includes(tag)
          ) || [];
          
          // Check for same category
          const sameCategory = currentItem.category === item.category;
          
          // Calculate relevance score
          if (sharedConcepts.length > 0) {
            relevanceScore += sharedConcepts.length * 3;
            reason = `Shares ${sharedConcepts.join(', ')} concepts`;
          }
          
          if (sharedTags.length > 0) {
            relevanceScore += sharedTags.length * 2;
            if (reason) reason += '; ';
            reason += `Related by ${sharedTags.join(', ')} tags`;
          }
          
          if (sameCategory) {
            relevanceScore += 1;
            if (reason) reason += '; ';
            reason += `Same ${currentItem.category} category`;
          }
          
          // Determine type based on difficulty and content type
          if (currentItem.difficulty === 'beginner' && item.difficulty === 'intermediate') {
            type = 'next-step';
          } else if (currentItem.difficulty === 'intermediate' && item.difficulty === 'beginner') {
            type = 'prerequisite';
          } else if (currentItem.type === 'documentation' && item.type === 'tool') {
            type = 'application';
          } else if (currentItem.type === 'tool' && item.type === 'documentation') {
            type = 'prerequisite';
          }
          
          if (relevanceScore > 0) {
            crossReferences.push({
              id: item.id,
              title: item.title,
              path: item.path,
              type,
              reason,
              relevanceScore
            });
          }
        });
        
        // Sort by relevance and limit to user preference
        const maxRefs = get().preferences.maxCrossReferences;
        const sortedRefs = crossReferences
          .sort((a, b) => b.relevanceScore - a.relevanceScore)
          .slice(0, maxRefs);
        
        set({ crossReferences: sortedRefs });
      },

      addToRecentPages: (item: NavigationItem) => {
        const recent = get().recentPages;
        const filtered = recent.filter(page => page.id !== item.id);
        const updated = [item, ...filtered].slice(0, 10); // Keep last 10 pages
        set({ recentPages: updated });
      },

      updatePreferences: (newPreferences: Partial<NavigationPreferences>) => {
        const current = get().preferences;
        set({ preferences: { ...current, ...newPreferences } });
      },

      setSearchOpen: (open: boolean) => {
        set({ isSearchOpen: open });
      },

      setMobileMenuOpen: (open: boolean) => {
        set({ isMobileMenuOpen: open });
      },

      toggleSubNav: (id: string) => {
        const expanded = get().expandedSubNavs;
        const isExpanded = expanded.includes(id);
        
        if (isExpanded) {
          set({ expandedSubNavs: expanded.filter(navId => navId !== id) });
        } else {
          set({ expandedSubNavs: [...expanded, id] });
        }
      },

      registerNavigationItem: (item: NavigationItem) => {
        const items = get().navigationItems;
        const existing = items.find(navItem => navItem.id === item.id);
        
        if (existing) {
          // Update existing item
          const updated = items.map(navItem =>
            navItem.id === item.id ? { ...navItem, ...item } : navItem
          );
          set({ navigationItems: updated });
        } else {
          // Add new item
          set({ navigationItems: [...items, item] });
        }
      },

      findRelatedItems: (item: NavigationItem) => {
        const allItems = get().navigationItems;
        return allItems.filter(navItem => {
          if (navItem.id === item.id) return false;
          
          const hasSharedConcepts = item.relatedConcepts?.some(concept =>
            navItem.relatedConcepts?.includes(concept)
          );
          
          const hasSharedTags = item.tags?.some(tag =>
            navItem.tags?.includes(tag)
          );
          
          const sameCategory = item.category === navItem.category;
          
          return hasSharedConcepts || hasSharedTags || sameCategory;
        });
      }
    }),
    {
      name: 'navigation-store',
      // Only persist user preferences and recent pages
      partialize: (state) => ({
        preferences: state.preferences,
        recentPages: state.recentPages
      })
    }
  )
);