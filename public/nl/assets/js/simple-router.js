/**
 * Simple router for CaseWare Documentation site - Dutch version
 * Works with downloaded documentation files
 */

class SimpleRouter {
    constructor() {
        this.navigationData = null;
        this.currentPage = null;
        this.isLoading = false;
    this.navRendered = false;
        
        // Add global click handler to catch any missed internal links
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href]');
            if (link && !link.hasAttribute('data-router-processed')) {
                const href = link.getAttribute('href');
                // Check if this looks like an internal documentation link
                if (href && 
                    (href.endsWith('.htm') || href.endsWith('.html')) &&
                    !href.startsWith('http') &&
                    !href.startsWith('mailto:') &&
                    !href.startsWith('#')) {
                    
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    
                    // Quick relative path resolution for missed links
                    let routePath = href;
                    if (href.startsWith('../') || href.startsWith('./')) {
                        routePath = this.resolveRelativePath(this.currentPage, href);
                    } else if (!href.startsWith('/')) {
                        routePath = this.resolveRelativePath(this.currentPage, './' + href);
                    }
                    
                    // Clean up path
                    routePath = routePath.replace(/\.html?$/, '');
                    
                    this.navigateTo(routePath);
                    return false;
                }
            }
        });
    }

    async init() {
        // Load navigation data
        try {
            const response = await fetch('/nl/assets/data/navigation.json');
            this.navigationData = await response.json();
            console.log('ROUTER: Navigation data loaded for Dutch (shared TOC handles rendering)');
        } catch (error) {
            console.error('ROUTER: Failed to load navigation data:', error);
        }

        // Handle browser back/forward
        window.addEventListener('popstate', (event) => {
            const path = event.state ? event.state.page : window.location.pathname;
            this.loadPage(path, false);
        });

        // Load initial page
        const currentPath = window.location.pathname;
        console.log('ROUTER: Initial path:', currentPath);
        
        if (currentPath && currentPath !== '/') {
            // For Dutch router, we expect paths to start with /nl/
            if (currentPath.startsWith('/nl/')) {
                console.log('ROUTER: Loading Dutch path directly:', currentPath);
                this.loadPage(currentPath);
            } else if (currentPath.startsWith('/en/') || currentPath.startsWith('/fr/')) {
                // Redirect to Dutch version
                const newPath = '/nl' + currentPath.substring(3);
                console.log('ROUTER: Redirecting to Dutch language path:', newPath);
                history.replaceState({ page: newPath }, document.title, newPath);
                this.loadPage(newPath);
            } else {
                // Assume it's a documentation path, add Dutch prefix
                const newPath = '/nl' + (currentPath.startsWith('/') ? currentPath : '/' + currentPath);
                console.log('ROUTER: Adding Dutch prefix to path:', newPath);
                history.replaceState({ page: newPath }, document.title, newPath);
                this.loadPage(newPath);
            }
        } else {
            this.loadHomePage();
        }
    }

    async loadPage(path, pushState = true) {
        if (this.isLoading) return;
        
        console.log('ROUTER: Loading page:', path);
        this.isLoading = true;
        
        try {
            if (path === '/' || path === '') {
                this.loadHomePage();
                return;
            }

            // Clean up path
            path = path.replace(/\.html?$/, '');
            
            // Check if this is a Dutch language path
            if (path.startsWith('/nl/')) {
                // Pass the full path to loadDocumentationPage
                await this.loadDocumentationPage(path, path, pushState);
            } else if (path.startsWith('/en/') || path.startsWith('/fr/')) {
                // Redirect to Dutch version
                const newPath = '/nl' + path.substring(3);
                this.navigateTo(newPath);
            } else {
                // Assume it's a documentation path, add Dutch prefix
                const dutchPath = '/nl' + (path.startsWith('/') ? path : '/' + path);
                await this.loadDocumentationPage(path, dutchPath, pushState);
            }
        } catch (error) {
            console.error('ROUTER: Error loading page:', error);
            this.showErrorPage();
        } finally {
            this.isLoading = false;
        }
    }

    async loadDocumentationPage(filePath, routePath, pushState = true) {
        try {
            console.log('ROUTER: loadDocumentationPage called with filePath:', filePath, 'routePath:', routePath);
            
            // Try to load the Dutch HTML file from /nl/Content/ path
            let htmlPath;
            if (filePath.includes('.htm')) {
                // Full path with extension already provided
                htmlPath = filePath;
                console.log('ROUTER: Using full path with extension:', htmlPath);
            } else if (filePath.startsWith('/nl/Content/')) {
                // Path already has /nl/Content/ prefix, just add .htm
                htmlPath = filePath + '.htm';
                console.log('ROUTER: Adding .htm to /nl/Content/ path:', htmlPath);
            } else if (filePath.startsWith('/nl/')) {
                // File path has /nl/ prefix, add .htm
                htmlPath = filePath + '.htm';
                console.log('ROUTER: Adding .htm to /nl/ path:', htmlPath);
            } else {
                // Add /nl/Content/ prefix and .htm extension for navigation links
                htmlPath = `/nl/Content/${filePath}.htm`;
                console.log('ROUTER: Adding /nl/Content/ prefix and .htm:', htmlPath);
            }
            
            console.log('ROUTER: Final path to fetch:', htmlPath);
            
            const response = await fetch(htmlPath);
            if (!response.ok) {
                throw new Error(`Failed to load ${htmlPath}: ${response.status}`);
            }
            
            const content = await response.text();
            
            // Parse the content
            const parser = new DOMParser();
            const doc = parser.parseFromString(content, 'text/html');
            
            // Expand MadCap snippet blocks before extracting body content
            try {
                await this.expandMadCapSnippets(htmlPath, doc);
            } catch (e) {
                console.warn('ROUTER: Failed to expand snippets:', e);
            }

            // Extract the body content
            const bodyContent = doc.querySelector('.body-container, .topic-body, main, .content') || doc.body;
            
            if (bodyContent) {
                // Update the content area (not main-content which includes header)
                const contentArea = document.querySelector('#documentationContent');
                if (contentArea) {
                    // Create a properly styled content wrapper for Dutch content
                    const contentWrapper = document.createElement('div');
                    // IMPORTANT: do NOT reuse 'documentation-content' class here because
                    // that class has CSS display:none unless accompanied by .active.
                    // Using it on an inner wrapper hides the loaded page (root cause of blank screen).
                    contentWrapper.className = 'documentation-page-wrapper';
                    contentWrapper.style.cssText = `
                        max-width: 1200px;
                        margin: 0 auto;
                        padding: 2rem;
                        font-family: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        line-height: 1.6;
                        color: #212529;
                    `;
                    
                    // Create inner content container
                    const innerContent = document.createElement('div');
                    innerContent.className = 'topic-content';
                    innerContent.style.cssText = `
                        background: white;
                        border-radius: 8px;
                        padding: 2rem;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        margin-bottom: 2rem;
                    `;
                    
                    // Add the content
                    innerContent.innerHTML = bodyContent.innerHTML;
                    
                    // Apply consistent styling to content elements
                    this.styleDocumentationContent(innerContent);
                    
                    // Add to wrapper
                    contentWrapper.appendChild(innerContent);
                    
                    // Update content area
                    contentArea.innerHTML = '';
                    
                    // Recreate breadcrumb element
                    const breadcrumb = document.createElement('div');
                    breadcrumb.className = 'breadcrumb';
                    breadcrumb.id = 'breadcrumb';
                    contentArea.appendChild(breadcrumb);
                    
                    // Hide homepage content if it exists and show documentation
                    const homepageContent = document.getElementById('homepageContent');
                    if (homepageContent) {
                        homepageContent.classList.add('hidden');
                        console.log('ROUTER DEBUG: Homepage content hidden');
                    }
                    
                    // Show documentation area
                    if (typeof showDocumentation === 'function') {
                        showDocumentation();
                        console.log('ROUTER DEBUG: showDocumentation() called');
                    } else {
                        console.error('ROUTER DEBUG: showDocumentation function not found!');
                    }

                    // Ensure the main documentation container has the active class for visibility
                    if (!contentArea.classList.contains('active')) {
                        contentArea.classList.add('active');
                        console.log('ROUTER DEBUG: Added active class to #documentationContent');
                    }
                    
                    contentArea.appendChild(contentWrapper);
                    console.log('ROUTER DEBUG: Content inserted, contentArea children:', contentArea.children.length);
                    console.log('ROUTER DEBUG: Content wrapper HTML length:', contentWrapper.innerHTML.length);
                    console.log('ROUTER DEBUG: ContentArea display style:', window.getComputedStyle(contentArea).display);
                    console.log('ROUTER DEBUG: ContentArea visibility:', window.getComputedStyle(contentArea).visibility);
                    
                    // Process links in the loaded content
                    this.processContentLinks(contentArea);
                    
                    // Scroll to top
                    window.scrollTo(0, 0);
                    
                    // Update browser history
                    if (pushState) {
                        history.pushState({ page: routePath }, doc.title || 'CaseWare Cloud Documentation', routePath);
                    }
                    
                    // Update current page
                    this.currentPage = routePath;
                    
                    // Update page title
                    const title = doc.querySelector('title');
                    if (title) {
                        document.title = title.textContent;
                    }
                    
                    console.log('ROUTER: Page loaded successfully:', routePath);
                    // Update navigation highlighting
                    this.updateActiveNav(routePath);
                } else {
                    console.error('ROUTER: Main content container not found');
                }
            } else {
                console.error('ROUTER: No content found in loaded page');
            }
            
        } catch (error) {
            console.error('ROUTER: Error loading documentation page:', error);
            this.showErrorPage();
        }
    }

    // Render the left navigation using loaded navigationData
    renderSidebarNavigation() {
        if (this.navRendered || !this.navigationData) return;
        const container = document.getElementById('sidebarNav');
        if (!container) return;
        container.innerHTML = '';
        const tree = document.createElement('ul');
        tree.className = 'nav-tree';
        this.navigationData.forEach(node => {
            const li = this.buildNavNode(node, 0);
            if (li) tree.appendChild(li);
        });
        container.appendChild(tree);
        this.navRendered = true;
    }

    buildNavNode(node, depth) {
        if (!node) return null;
        const hasChildren = Array.isArray(node.children) && node.children.length > 0;
        const li = document.createElement('li');
        li.className = 'nav-tree-item';

        // Compute route path
        let routePath = null;
        if (node.link) {
            // Link paths in JSON are relative to /nl/Content
            routePath = '/nl/Content' + node.link.replace(/^\//, '').replace(/\.html?$/,'');
        }

        if (hasChildren) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'nav-tree-toggle';
            // Keep title text in a span (no inline font-weight; CSS supplies bold)
            btn.innerHTML = `<span class="nav-tree-title">${node.title}</span><span class="nav-tree-arrow">▶</span>`;
            btn.setAttribute('data-depth', depth);
            if (routePath) {
                btn.dataset.route = routePath;
                btn.addEventListener('click', (e) => {
                    // If arrow or toggle clicked without meta keys, navigate then toggle
                    if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                        e.preventDefault();
                        this.navigateTo(routePath);
                    }
                    btn.classList.toggle('expanded');
                    btn.classList.toggle('expanded');
                    // Let CSS handle arrow rotation; toggle child container visibility via class
                    if (childContainer) {
                        if (btn.classList.contains('expanded')) {
                            childContainer.classList.add('expanded');
                            childContainer.style.display = 'block';
                        } else {
                            childContainer.classList.remove('expanded');
                            childContainer.style.display = 'none';
                        }
                    }
                });
            } else {
                btn.addEventListener('click', () => {
                    btn.classList.toggle('expanded');
                    if (childContainer) {
                        if (btn.classList.contains('expanded')) {
                            childContainer.classList.add('expanded');
                            childContainer.style.display = 'block';
                        } else {
                            childContainer.classList.remove('expanded');
                            childContainer.style.display = 'none';
                        }
                    }
                });
            }
            li.appendChild(btn);
            const childContainer = document.createElement('ul');
            childContainer.className = 'nav-tree-children';
            childContainer.style.display = 'none'; // Start collapsed (CSS class expanded will show)
            node.children.forEach(c => {
                const childLi = this.buildNavNode(c, depth + 1);
                if (childLi) childContainer.appendChild(childLi);
            });
            li.appendChild(childContainer);
        } else if (routePath) {
            const a = document.createElement('a');
            a.href = routePath;
            a.className = 'nav-item';
            a.textContent = node.title;
            a.dataset.route = routePath;
            a.addEventListener('click', (e) => {
                if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                    e.preventDefault();
                    this.navigateTo(routePath);
                }
            });
            li.appendChild(a);
        } else {
            // Leaf without link
            const span = document.createElement('span');
            span.className = 'nav-item';
            span.textContent = node.title;
            li.appendChild(span);
        }
        return li;
    }

    updateActiveNav(currentRoute) {
        try {
            const container = document.getElementById('sidebarNav');
            if (!container) return;
            const links = container.querySelectorAll('.nav-item, .nav-tree-toggle');
            links.forEach(el => el.classList.remove('active'));
            // Normalize current route (strip extension, ensure no trailing slash)
            const normalized = currentRoute.replace(/\.html?$/,'').replace(/\/$/, '');
            // Find best match (longest routePath that is prefix of current)
            let best = null;
            let bestLen = -1;
            links.forEach(el => {
                const route = el.dataset.route;
                if (!route) return;
                if (normalized === route || normalized.startsWith(route + '/')) {
                    if (route.length > bestLen) {
                        best = el;
                        bestLen = route.length;
                    }
                }
            });
            if (best) {
                best.classList.add('active');
                // Expand parent chains
                let parent = best.parentElement;
                while (parent && parent !== container) {
                    if (parent.classList.contains('nav-tree-item')) {
                        const toggle = parent.querySelector(':scope > .nav-tree-toggle');
                        const childList = parent.querySelector(':scope > ul.nav-tree-children');
                        if (toggle && childList) {
                            toggle.classList.add('expanded');
                            childList.style.display = 'block';
                        }
                    }
                    parent = parent.parentElement;
                }
            }
        } catch (e) {
            console.warn('ROUTER: Failed to update active nav', e);
        }
    }

    // Expand MadCap snippet blocks (e.g., <MadCap:snippetBlock src="..." />) by inlining their content
    async expandMadCapSnippets(pageHtmlPath, doc) {
        const snippetNodes = doc.querySelectorAll('MadCap\\:snippetBlock, madcap\\:snippetBlock');
        if (!snippetNodes.length) return;
        const pageDir = pageHtmlPath.substring(0, pageHtmlPath.lastIndexOf('/') + 1);

        const tasks = Array.from(snippetNodes).map(async (node) => {
            const src = node.getAttribute('src');
            if (!src) return;
            const resolved = await this.resolveSnippetFetchPath(pageDir, src);
            if (!resolved) return;
            try {
                const resp = await fetch(resolved);
                if (!resp.ok) {
                    console.warn('ROUTER: Snippet fetch failed', resolved, resp.status);
                    return;
                }
                const txt = await resp.text();
                const parser = new DOMParser();
                const snippetDoc = parser.parseFromString(txt, 'text/html');
                const body = snippetDoc.querySelector('body') || snippetDoc;
                const frag = document.createDocumentFragment();
                Array.from(body.childNodes).forEach(ch => frag.appendChild(ch.cloneNode(true)));
                node.replaceWith(frag);
            } catch (err) {
                console.warn('ROUTER: Error expanding snippet', src, err);
            }
        });
        await Promise.allSettled(tasks);
    }

    // Resolve snippet path, with fallbacks for mismatched directory placement (e.g., Resources at different level)
    async resolveSnippetFetchPath(pageDir, src) {
        // Absolute path (already rooted)
        if (src.startsWith('/')) return src;

        const norm = this.normalizeAndJoin(pageDir, src);
        // Primary attempt
        let toTry = [norm];

        // If path includes /Resources/Snippets but in a nested section (e.g., Engagements/Resources) also try moving it up to /Content/Resources
        if (/\/Resources\/Snippets\//i.test(norm)) {
            const suffixIndex = norm.toLowerCase().lastIndexOf('/resources/snippets/');
            if (suffixIndex !== -1) {
                const suffix = norm.substring(suffixIndex); // /Resources/Snippets/...
                // Determine language root (/nl/ or /fr/ etc.)
                const langMatch = norm.match(/^\/(nl|fr|en)\//);
                const langRoot = langMatch ? `/${langMatch[1]}/` : '/nl/';
                const alt = `${langRoot}Content${suffix}`;
                if (alt !== norm) toTry.push(alt);
            }
        }

        for (const p of toTry) {
            try {
                const headResp = await fetch(p, { method: 'HEAD' });
                if (headResp.ok) return p;
            } catch (_) { /* ignore */ }
        }
        return null;
    }

    // Join and normalize path segments handling ../ and ./
    normalizeAndJoin(baseDir, relative) {
        // Ensure baseDir ends with '/'
        let base = baseDir.endsWith('/') ? baseDir : baseDir + '/';
        // Remove leading './'
        let rel = relative.replace(/^\.\//, '');
        const baseParts = base.split('/').filter(Boolean); // filter empties
        // If base refers to a file, remove last part (not expected here)
        if (baseParts[baseParts.length - 1].includes('.')) baseParts.pop();
        const relParts = rel.split('/');
        relParts.forEach(part => {
            if (!part || part === '.') return;
            if (part === '..') {
                if (baseParts.length) baseParts.pop();
            } else {
                baseParts.push(part);
            }
        });
        return '/' + baseParts.join('/');
    }

    loadHomePage() {
        // Load the main documentation home page for Dutch
        const contentArea = document.querySelector('#documentationContent');
        if (contentArea) {
            contentArea.innerHTML = `
                <div class="documentation-page-wrapper" style="max-width: 1200px; margin: 0 auto; padding: 2rem; font-family: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #212529;">
                    <div class="topic-content" style="background: white; border-radius: 8px; padding: 2rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 2rem;">
                        <h1 style="font-size: 2.5rem; font-weight: 700; color: #0066cc; margin-bottom: 1.5rem; margin-top: 0; padding-bottom: 0.5rem; border-bottom: 3px solid #0066cc;">CaseWare Cloud Documentatie</h1>
                        <p style="margin-bottom: 1rem; font-size: 16px; line-height: 1.6;">Welkom bij de CaseWare Cloud documentatie. Gebruik de navigatie aan de linkerkant om door de verschillende onderwerpen te bladeren.</p>
                        
                        <div class="quick-links" style="margin-top: 2rem;">
                            <h2 style="font-size: 1.75rem; font-weight: 600; color: #0052a3; margin-top: 2rem; margin-bottom: 1rem;">Snelle links</h2>
                            <ul style="margin-bottom: 1rem; padding-left: 2rem;">
                                <li style="margin-bottom: 0.5rem; line-height: 1.6;"><a href="/nl/Content/Cloud-Home" data-router-link style="color: #0066cc; text-decoration: none;">Start</a></li>
                                <li style="margin-bottom: 0.5rem; line-height: 1.6;"><a href="/nl/Content/Explore/Getting-Started/Get-started-with-CaseWare-Cloud" data-router-link style="color: #0066cc; text-decoration: none;">Aan de slag met CaseWare Cloud</a></li>
                                <li style="margin-bottom: 0.5rem; line-height: 1.6;"><a href="/nl/Content/Setup/Administration-index" data-router-link style="color: #0066cc; text-decoration: none;">Administratie en instellingen</a></li>
                                <li style="margin-bottom: 0.5rem; line-height: 1.6;"><a href="/nl/Content/Engagements/Engagements-index" data-router-link style="color: #0066cc; text-decoration: none;">Opdrachten</a></li>
                            </ul>
                        </div>
                        
                        <div class="recent-updates" style="margin-top: 2rem;">
                            <h2 style="font-size: 1.75rem; font-weight: 600; color: #0052a3; margin-top: 2rem; margin-bottom: 1rem;">Recente updates</h2>
                            <p style="margin-bottom: 1rem; font-size: 16px; line-height: 1.6;">Ontdek de <a href="/nl/Content/Explore/Whats-New/Whats-new-Cloud" data-router-link style="color: #0066cc; text-decoration: none;">nieuwste functies</a> en verken de <a href="/nl/Content/Explore/Whats-New/Release-history-Cloud-37-0" data-router-link style="color: #0066cc; text-decoration: none;">releasegeschiedenis</a>.</p>
                        </div>
                    </div>
                </div>
            `;
            
            // Process the links we just added
            this.processContentLinks(mainContent);
            
            // Update browser state
            history.replaceState({ page: '/' }, 'CaseWare Cloud Documentatie', '/');
            this.currentPage = '/';
            document.title = 'CaseWare Cloud Documentatie';
        }
    }

    styleDocumentationContent(container) {
        // Style headings
        const h1Elements = container.querySelectorAll('h1');
        h1Elements.forEach(h1 => {
            h1.style.cssText = `
                font-size: 2.5rem;
                font-weight: 700;
                color: #0066cc;
                margin-bottom: 1.5rem;
                margin-top: 0;
                padding-bottom: 0.5rem;
                border-bottom: 3px solid #0066cc;
            `;
        });

        const h2Elements = container.querySelectorAll('h2');
        h2Elements.forEach(h2 => {
            h2.style.cssText = `
                font-size: 1.75rem;
                font-weight: 600;
                color: #0052a3;
                margin-top: 2rem;
                margin-bottom: 1rem;
            `;
        });

        const h3Elements = container.querySelectorAll('h3');
        h3Elements.forEach(h3 => {
            h3.style.cssText = `
                font-size: 1.25rem;
                font-weight: 600;
                color: #0052a3;
                margin-top: 1.5rem;
                margin-bottom: 0.75rem;
            `;
        });

        // Style paragraphs
        const paragraphs = container.querySelectorAll('p');
        paragraphs.forEach(p => {
            p.style.cssText = `
                margin-bottom: 1rem;
                font-size: 16px;
                line-height: 1.6;
            `;
        });

        // Style lists
        const lists = container.querySelectorAll('ul, ol');
        lists.forEach(list => {
            list.style.cssText = `
                margin-bottom: 1rem;
                padding-left: 2rem;
            `;
        });

        const listItems = container.querySelectorAll('li');
        listItems.forEach(li => {
            li.style.cssText = `
                margin-bottom: 0.5rem;
                line-height: 1.6;
            `;
        });

        // Style links
        const links = container.querySelectorAll('a');
        links.forEach(link => {
            link.style.cssText = `
                color: #0066cc;
                text-decoration: none;
                border-bottom: 1px solid transparent;
                transition: all 0.2s ease;
            `;
            
            link.addEventListener('mouseenter', () => {
                link.style.borderBottomColor = '#0066cc';
                link.style.color = '#0052a3';
            });
            
            link.addEventListener('mouseleave', () => {
                link.style.borderBottomColor = 'transparent';
                link.style.color = '#0066cc';
            });
        });

        // Style code elements
        const codeElements = container.querySelectorAll('code');
        codeElements.forEach(code => {
            code.style.cssText = `
                background-color: #f8f9fa;
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
                font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                font-size: 0.875rem;
                border: 1px solid #e9ecef;
            `;
        });

        // Style tables
        const tables = container.querySelectorAll('table');
        tables.forEach(table => {
            table.style.cssText = `
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 1.5rem;
                border: 1px solid #dee2e6;
            `;
            
            const cells = table.querySelectorAll('th, td');
            cells.forEach(cell => {
                cell.style.cssText = `
                    padding: 0.75rem;
                    border: 1px solid #dee2e6;
                    text-align: left;
                `;
            });
            
            const headers = table.querySelectorAll('th');
            headers.forEach(header => {
                header.style.cssText += `
                    background-color: #f8f9fa;
                    font-weight: 600;
                    color: #495057;
                `;
            });
        });

        // Style blockquotes
        const blockquotes = container.querySelectorAll('blockquote');
        blockquotes.forEach(blockquote => {
            blockquote.style.cssText = `
                border-left: 4px solid #0066cc;
                background-color: #f8f9fa;
                padding: 1rem 1.5rem;
                margin: 1.5rem 0;
                font-style: italic;
            `;
        });
    }

    processContentLinks(container) {
        const links = container.querySelectorAll('a[href]');
        links.forEach(link => {
            if (!link.hasAttribute('data-router-processed')) {
                link.setAttribute('data-router-processed', 'true');
                
                const href = link.getAttribute('href');
                
                // Skip external links, mailto, and anchors
                if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('#')) {
                    return;
                }
                
                // Process internal documentation links
                if (href.endsWith('.htm') || href.endsWith('.html') || link.hasAttribute('data-router-link')) {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        let routePath = href;
                        
                        // Handle relative paths
                        if (href.startsWith('../') || href.startsWith('./')) {
                            routePath = this.resolveRelativePath(this.currentPage, href);
                        } else if (!href.startsWith('/')) {
                            // Relative path without ./
                            routePath = this.resolveRelativePath(this.currentPage, './' + href);
                        }
                        
                        // Clean up extension
                        routePath = routePath.replace(/\.html?$/, '');
                        
                        this.navigateTo(routePath);
                    });
                }
            }
        });
    }

    resolveRelativePath(currentPath, relativePath) {
        // Enhanced relative path resolution for MadCap/Flare index pages

        let current = currentPath.split('/').filter(p => p.length > 0);
        const relative = relativePath.split('/').filter(p => p.length > 0);

        // Always treat the current page as a file and remove the last segment (topic or index or extensionless)
        if (current.length > 0) {
            current.pop();
        }

        // Remove duplicate directory segment if present (e.g., Engagements/Engagements)
        if (
            current.length >= 2 &&
            current[current.length - 1].toLowerCase() === current[current.length - 2].toLowerCase()
        ) {
            current.splice(current.length - 1, 1);
        }

        // Now process the relative path
        for (const part of relative) {
            if (part === '..') {
                if (current.length > 0) {
                    current.pop();
                }
            } else if (part !== '.') {
                current.push(part);
            }
        }

        return '/' + current.join('/');
    }

    navigateTo(path) {
        console.log('ROUTER: Navigating to:', path);
        this.loadPage(path);
    }

    showErrorPage() {
        const contentArea = document.querySelector('#documentationContent');
        if (contentArea) {
            contentArea.innerHTML = `
                <div class="documentation-page-wrapper" style="max-width: 1200px; margin: 0 auto; padding: 2rem; font-family: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #212529;">
                    <div class="topic-content" style="background: white; border-radius: 8px; padding: 2rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 2rem;">
                        <h1 style="font-size: 2.5rem; font-weight: 700; color: #dc3545; margin-bottom: 1.5rem; margin-top: 0; padding-bottom: 0.5rem; border-bottom: 3px solid #dc3545;">Pagina niet gevonden</h1>
                        <p style="margin-bottom: 1rem; font-size: 16px; line-height: 1.6;">De opgevraagde pagina kon niet worden gevonden.</p>
                        <p style="margin-bottom: 1rem; font-size: 16px; line-height: 1.6;"><a href="/" data-router-link style="color: #0066cc; text-decoration: none;">Ga terug naar de startpagina</a> of gebruik de navigatie aan de linkerkant om de gewenste inhoud te vinden.</p>
                    </div>
                </div>
            `;
            this.processContentLinks(contentArea);
        }
    }
}

// Initialize router when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.simpleRouter = new SimpleRouter();
    window.simpleRouter.init();
});
