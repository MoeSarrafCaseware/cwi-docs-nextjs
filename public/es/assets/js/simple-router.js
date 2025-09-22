/**
 * LEGACY (deprecated) Spanish locale router.
 * Retained temporarily for rollback. Functionality superseded by /assets/js/shared-router.js.
 * Safe to delete once shared router parity confirmed.
 */
class SimpleRouter {
	constructor(){
		this.navigationData=null;
		this.currentPage=null;
		this.isLoading=false;
		this.init();
	}

	async init(){
		try {
			await this.loadNavigationData();
		} catch(e){ console.error('ES ROUTER: load nav failed', e); }

		// History navigation
		window.addEventListener('popstate', (evt)=>{
			const path = evt.state? evt.state.page : window.location.pathname;
			this.loadPage(path,false);
		});

		// Global link handler
		document.addEventListener('click',(e)=>{
			const link=e.target.closest('a[href]');
			if(!link) return;
			const href=link.getAttribute('href');
			if(this.shouldSkip(href, link)) return;
			// Internal doc link?
			if(/\.html?$/.test(href)||href.endsWith('.htm')||href.startsWith('/es/Content/')){
				e.preventDefault();
				this.navigateTo(href);
			}
		});

		// Initial load
		const path=window.location.pathname;
		if(path==='/'||path==='/es/'||path===''){ this.loadHomePage(); } else { this.loadPage(path); }
	}

	shouldSkip(href, link){
		if(!href) return true;
		if(href.startsWith('http') && !href.includes(window.location.hostname)) return true;
		if(href.startsWith('#')) return true;
		if(link && (link.getAttribute('target')==='_blank'||link.hasAttribute('download'))) return true;
		return false;
	}

	async loadNavigationData(){
		try {
			const r=await fetch('/es/assets/data/navigation.json');
			if(!r.ok) throw new Error(r.status);
			this.navigationData=await r.json();
			console.log('ES ROUTER: navigation loaded');
		} catch(e){
			console.error('ES ROUTER: failed to load navigation', e);
			this.navigationData=[];
		}
	}

	loadHomePage(){
		if(typeof showHomepage==='function') showHomepage();
		history.replaceState({page:'/es/'}, document.title, '/es/');
	}

	async navigateTo(path){
		// Normalize
		if(!path) return;
		if(!path.startsWith('/')) path='/es/Content/'+path.replace(/^\/+/,'');
		// Add /es prefix if missing
		if(!path.startsWith('/es/')) path='/es'+(path.startsWith('/')?path:'/'+path);
		await this.loadPage(path);
	}

	async loadPage(path, pushState=true){
		if(this.isLoading) return; this.isLoading=true;
		try {
			if(path==='/'||path==='/es/'||path===''){ this.loadHomePage(); return; }

			// Clean .html extension if present
			path=path.replace(/\.html?$/,'');

			// Derive file fetch path
			let fetchPath;
			if(path.endsWith('.htm')) fetchPath=path; else if(path.startsWith('/es/Content/')) fetchPath=path+'.htm'; else fetchPath='/es/Content'+(path.startsWith('/')?path:'/'+path)+'.htm';

			const resp=await fetch(fetchPath);
			if(!resp.ok) throw new Error('HTTP '+resp.status+' for '+fetchPath);
			const html=await resp.text();
			const parser=new DOMParser();
			const doc=parser.parseFromString(html,'text/html');
			const bodyContent=doc.querySelector('.body-container, .topic-body, main, .content')||doc.body;
			const container=document.getElementById('documentationContent');
			if(container){
				if(typeof showDocumentation==='function') showDocumentation();
				container.innerHTML='';
				const breadcrumb=document.createElement('div'); breadcrumb.id='breadcrumb'; breadcrumb.className='breadcrumb'; container.appendChild(breadcrumb);
				const wrapper=document.createElement('div'); wrapper.className='documentation-page-wrapper'; wrapper.style.cssText='max-width:1200px;margin:0 auto;padding:2rem;';
				const topic=document.createElement('div'); topic.className='topic-content'; topic.style.cssText='background:#fff;border-radius:8px;padding:2rem;box-shadow:0 2px 4px rgba(0,0,0,0.05);';
				topic.innerHTML=bodyContent.innerHTML;
				wrapper.appendChild(topic); container.appendChild(wrapper);
			}
			this.currentPage=path;
			if(pushState) history.pushState({page:path}, document.title, path);
			// Dispatch event for TOC highlight
			window.dispatchEvent(new CustomEvent('docPageLoaded',{detail:{path}}));
			// Fix internal relative links inside loaded content
			this.rewriteInternalLinks(container, path);
		} catch(e){
			console.error('ES ROUTER: Failed to load page', e);
			const container=document.getElementById('documentationContent');
			if(container){ container.innerHTML='<div style="padding:2rem"><h1>Página no encontrada</h1><p>No se pudo cargar: '+path+'</p></div>'; }
		} finally { this.isLoading=false; }
	}

	rewriteInternalLinks(container, currentPath){
		if(!container) return;
		container.querySelectorAll('a[href]').forEach(a=>{
			const href=a.getAttribute('href');
			if(!href||href.startsWith('http')||href.startsWith('#')||href.startsWith('mailto:')) return;
			// Relative link? assume same directory
			if(!href.startsWith('/')){
				// Build absolute path relative to current file
				const base=currentPath.replace(/\/[^\/]*$/,'');
				let newPath=base+'/'+href; newPath=newPath.replace(/\/\.\//g,'/');
				newPath=newPath.replace(/\/[^\/]+\/\.\./g,'');
				a.href=newPath.replace(/\.html?$/,'');
				a.addEventListener('click',(e)=>{e.preventDefault(); this.navigateTo(a.getAttribute('href'));});
			} else if(href.startsWith('/Content/')) {
				// Spanish content root
				a.href='/es'+href.replace(/\.html?$/,'');
				a.addEventListener('click',(e)=>{e.preventDefault(); this.navigateTo(a.getAttribute('href'));});
			}
		});
	}
}

// Expose globally
window.SimpleRouter=SimpleRouter;
