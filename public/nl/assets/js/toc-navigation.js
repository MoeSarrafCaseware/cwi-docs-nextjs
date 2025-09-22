// Dynamic TOC navigation based on region - Dutch version
(async function(){
  function getCurrentRegion() {
    // Get region from selector or default to 'nl' for Dutch
    const regionSelector = document.getElementById('regionSelector');
    return regionSelector ? regionSelector.value : 'nl';
  }
  
  function getCurrentLanguage() {
    // Return 'nl' for Dutch version
    return 'nl';
  }
  
  async function loadTOC(){
    const region = getCurrentRegion();
    let tocFile;
    switch(region) {
      case 'nl':
        tocFile = '/nl/assets/data/navigation.json';
        break;
      case 'ca':
        tocFile = '/en/assets/data/toc-canada.json';
        break;
      case 'us':
        tocFile = '/en/assets/data/toc-us.json';
        break;
      default:
        tocFile = '/nl/assets/data/navigation.json'; // Default to Dutch navigation for Dutch router
    }
    
    try{
      console.log('Loading Dutch TOC for region:', region, 'from file:', tocFile);
      const r = await fetch(tocFile); 
      if(!r.ok) throw new Error(`HTTP ${r.status}`); 
      return await r.json();
    }catch(e){
      console.error('Dutch TOC load failed for', tocFile, e); 
      return null;
    }
  }
  function build(container, structure){
    container.innerHTML='';
    const ul=rootList();
    structure.forEach(node=>ul.appendChild(renderNode(node,0)));
    container.appendChild(ul);
  }
  function rootList(){const ul=document.createElement('ul'); ul.className='toc-root'; ul.style.listStyle='none'; ul.style.margin=0; ul.style.padding=0; return ul;}
  function renderNode(node, level){
    const li=document.createElement('li'); li.style.margin=0; const hasKids=node.children&&node.children.length; const indent=level*12;

    // If children, prepare container first
    let inner=null; if(hasKids){ inner=document.createElement('ul'); inner.style.listStyle='none'; inner.style.margin=0; inner.style.padding=0; inner.style.display='none'; node.children.forEach(ch=>inner.appendChild(renderNode(ch,level+1))); }

    if(node.link){
      const a=document.createElement('a');
      a.textContent=node.title;
      a.href=node.link?`/nl/Content${node.link.replace(/\.html?$/,'')}`:'/';
      a.style.display='block';
      a.style.padding='6px 12px';
      a.style.paddingLeft=(12+indent)+'px';
      a.style.textDecoration='none';
      a.style.fontSize='14px';
      a.style.color='#495057';
      a.style.borderLeft='3px solid transparent';
      a.style.transition='all 0.2s ease';

      a.addEventListener('mouseenter',()=>{ if(!a.classList.contains('active')){ a.style.background='#e9ecef'; a.style.color='#FF6B35'; }});
      a.addEventListener('mouseleave',()=>{ if(!a.classList.contains('active')){ a.style.background='none'; a.style.color='#495057'; }});

      a.addEventListener('click',e=>{ e.preventDefault(); const href=a.getAttribute('href'); if(window.router&&typeof window.router.navigateTo==='function'){ window.router.navigateTo(href); setActive(a);} else { window.location.href=href; }});
      li.appendChild(a);
    } else {
      const btn=document.createElement('button'); btn.type='button'; btn.textContent=node.title; btn.style.display='block'; btn.style.width='100%'; btn.style.border='none'; btn.style.background='none'; btn.style.textAlign='left'; btn.style.cursor='pointer'; btn.style.padding='6px 12px'; btn.style.paddingLeft=(12+indent)+'px'; btn.style.fontWeight='600'; btn.style.position='relative'; btn.style.fontSize='14px'; btn.style.color='#495057'; btn.style.borderLeft='3px solid transparent'; btn.style.transition='all 0.2s ease';

      btn.addEventListener('mouseenter',()=>{ if(!btn.classList.contains('expanded')) { btn.style.background='#e9ecef'; btn.style.color='#FF6B35'; }});
      btn.addEventListener('mouseleave',()=>{ if(!btn.classList.contains('expanded')) { btn.style.background='none'; btn.style.color='#495057'; }});

      if(hasKids){
        const indicator=document.createElement('span'); indicator.textContent='▶'; indicator.style.position='absolute'; indicator.style.right='12px'; indicator.style.fontSize='10px'; indicator.style.transition='transform 0.2s ease'; indicator.style.color='#6c757d'; btn.appendChild(indicator);
        let expanded=false;
        btn.addEventListener('click',()=>{ expanded=!expanded; if(inner){ inner.style.display=expanded?'block':'none'; } indicator.textContent=expanded?'▼':'▶'; btn.classList.toggle('expanded',expanded); if(expanded){ btn.style.background='#fff5f2'; btn.style.color='#FF6B35'; btn.style.borderLeftColor='#FF6B35'; } else { btn.style.background='none'; btn.style.color='#495057'; btn.style.borderLeftColor='transparent'; }});
      }
      li.appendChild(btn);
    }

    if(hasKids && inner){ li.appendChild(inner); }
    return li;    
  }
  function expand(container, path){
    if(!path) return; 
    const parts=path.split('/').filter(p=>p); 
    let current=container.querySelector('.toc-root'); 
    for(const part of parts){
      if(!current) break; 
      const button=Array.from(current.querySelectorAll('.toc-branch-button')).find(btn=>btn.textContent.toLowerCase().includes(part.toLowerCase())); 
      if(button){button.click(); current=button.parentElement.querySelector('ul');} else break;
    }
  }
  
  // Initialize TOC
  const container = document.getElementById('sidebarNav');
  if (container) {
    loadTOC().then(toc => {
      if (toc) {
        build(container, toc);
        console.log('Dutch TOC navigation loaded successfully');
        
        // Auto-expand based on current path
        const currentPath = window.location.pathname;
        if (currentPath && currentPath !== '/') {
          expand(container, currentPath);
        }
      } else {
        console.error('Failed to load Dutch TOC data');
        container.innerHTML = '<p style="padding: 16px; color: #666;">Navigation kon niet worden geladen</p>';
      }
    });
  }
  
  // Helper functions for navigation highlighting
  function setActive(a){ document.querySelectorAll('#sidebarNav a').forEach(el=>{el.classList.remove('active'); el.style.background=''; el.style.color='#495057'; el.style.borderLeftColor='transparent';}); a.classList.add('active'); a.style.background='#fff5f2'; a.style.color='#FF6B35'; a.style.borderLeftColor='#FF6B35'; }
  function normalize(p){return p.replace(/^\//,'').replace(/#.*/,'');}
  
  // Reload navigation function
  async function reloadNavigation() {
    const toc = await loadTOC();
    const container = document.getElementById('sidebarNav');
    if (toc && container) {
      const structure = Array.isArray(toc) ? toc : toc.structure;
      if(structure) {
        build(container, structure);
        console.log('Dutch TOC: Navigation reloaded successfully');
      }
    }
  }
  
  // Listen for page load events to highlight current page
  window.addEventListener('docPageLoaded',e=>{const p=normalize(e.detail.path); document.querySelectorAll('#sidebarNav a').forEach(a=>{const target=normalize(a.getAttribute('href')); if(target===p||target===p+'.htm'||target+'.htm'===p){setActive(a);} });});
  
  // Listen for TOC reload events from main page
  window.addEventListener('tocReload', async (event) => {
    console.log('Dutch TOC: Received tocReload event');
    const container = document.getElementById('sidebarNav');
    if (container && event.detail && event.detail.tocData) {
      // Handle both formats: direct array or object with structure property
      const structure = Array.isArray(event.detail.tocData) ? event.detail.tocData : event.detail.tocData.structure;
      if(structure) {
        console.log('Dutch TOC: Rebuilding navigation from event data');
        build(container, structure);
      }
    } else {
      console.log('Dutch TOC: Reloading navigation from fresh data');
      await reloadNavigation();
    }
  });

  // Add region change listener
  document.addEventListener('DOMContentLoaded', () => {
    const regionSelector = document.getElementById('regionSelector');
    if (regionSelector) {
      regionSelector.addEventListener('change', async () => {
        console.log('Dutch TOC: Region changed to:', regionSelector.value);
        await reloadNavigation();
      });
    }
  });

  // Listen for navigation changes to update TOC highlighting
  window.addEventListener('popstate', () => {
    const currentPath = window.location.pathname;
    if (currentPath && container) {
      // Remove current highlighting
      container.querySelectorAll('.toc-leaf-link').forEach(link => {
        link.style.backgroundColor = 'transparent';
        link.style.borderLeftColor = 'transparent';
      });
      
      // Highlight current page
      const currentLink = container.querySelector(`a[href="${currentPath}"]`);
      if (currentLink) {
        currentLink.style.backgroundColor = '#e8f4f8';
        currentLink.style.borderLeftColor = '#0066cc';
      }
    }
  });

  // Initial load - ensure TOC loads on script execution
  const initialLoad = async () => {
    const toc = await loadTOC(); 
    const container = document.getElementById('sidebarNav'); 
    if(toc && container) {
      // Handle both formats: direct array or object with structure property
      const structure = Array.isArray(toc) ? toc : toc.structure;
      if(structure) {
        build(container, structure);
        console.log('Dutch TOC: Initial navigation built successfully');
      }
    }
  };
  
  // Execute initial load when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialLoad);
  } else {
    initialLoad();
  }
})();
