// Spanish TOC navigation (mirrors French/Dutch behavior)
(async function(){
	function getCurrentRegion(){ const sel=document.getElementById('regionSelector'); return sel?sel.value:'es'; }
	function getCurrentLanguage(){ return 'es'; }
	async function loadTOC(){
		const region=getCurrentRegion();
		let tocFile;
		switch(region){
			case 'es': tocFile='/es/assets/data/navigation.json'; break;
			case 'ca': tocFile='/en/assets/data/toc-canada.json'; break;
			case 'us': tocFile='/en/assets/data/toc-us.json'; break;
			default: tocFile='/es/assets/data/navigation.json';
		}
		try { const r=await fetch(tocFile); if(!r.ok) throw new Error(r.status); return await r.json(); }
		catch(e){ console.error('ES TOC: load failed', e); return null; }
	}
	function build(container, structure){ container.innerHTML=''; const ul=root(); structure.forEach(n=>ul.appendChild(render(n,0))); container.appendChild(ul); }
	function root(){ const ul=document.createElement('ul'); ul.className='toc-root'; ul.style.listStyle='none'; ul.style.margin=0; ul.style.padding=0; return ul; }
	function render(node, level){
		const li=document.createElement('li'); const hasKids=node.children&&node.children.length; const indent=level*12; let inner=null;
		if(hasKids){ inner=document.createElement('ul'); inner.style.listStyle='none'; inner.style.margin=0; inner.style.padding=0; inner.style.display='none'; node.children.forEach(ch=>inner.appendChild(render(ch, level+1))); }
		if(node.link){
			const a=document.createElement('a'); a.textContent=node.title; a.href=`/es${node.link}`.replace(/\.html?$/,''); a.style.display='block'; a.style.padding='6px 12px'; a.style.paddingLeft=(12+indent)+'px'; a.style.textDecoration='none'; a.style.fontSize='14px'; a.style.color='#495057'; a.style.borderLeft='3px solid transparent'; a.style.transition='all 0.2s ease';
			a.addEventListener('mouseenter',()=>{ if(!a.classList.contains('active')){ a.style.background='#e9ecef'; a.style.color='#FF6B35'; }});
			a.addEventListener('mouseleave',()=>{ if(!a.classList.contains('active')){ a.style.background='none'; a.style.color='#495057'; }});
			a.addEventListener('click',(e)=>{ e.preventDefault(); const href=a.getAttribute('href'); if(window.router&&window.router.navigateTo){ window.router.navigateTo(href);} else { window.location.href=href; } setActive(a); });
			li.appendChild(a);
		} else {
			const btn=document.createElement('button'); btn.type='button'; btn.textContent=node.title; btn.style.display='block'; btn.style.width='100%'; btn.style.border='none'; btn.style.background='none'; btn.style.textAlign='left'; btn.style.cursor='pointer'; btn.style.padding='6px 12px'; btn.style.paddingLeft=(12+indent)+'px'; btn.style.fontWeight='600'; btn.style.position='relative'; btn.style.fontSize='14px'; btn.style.color='#495057'; btn.style.borderLeft='3px solid transparent'; btn.style.transition='all 0.2s ease';
			btn.addEventListener('mouseenter',()=>{ if(!btn.classList.contains('expanded')){ btn.style.background='#e9ecef'; btn.style.color='#FF6B35'; }});
			btn.addEventListener('mouseleave',()=>{ if(!btn.classList.contains('expanded')){ btn.style.background='none'; btn.style.color='#495057'; }});
			if(hasKids){ const indicator=document.createElement('span'); indicator.textContent='▶'; indicator.style.position='absolute'; indicator.style.right='12px'; indicator.style.fontSize='10px'; indicator.style.transition='transform 0.2s ease'; indicator.style.color='#6c757d'; btn.appendChild(indicator); let expanded=false; btn.addEventListener('click',()=>{ expanded=!expanded; if(inner){ inner.style.display=expanded?'block':'none'; } indicator.textContent=expanded?'▼':'▶'; btn.classList.toggle('expanded', expanded); if(expanded){ btn.style.background='#fff5f2'; btn.style.color='#FF6B35'; btn.style.borderLeftColor='#FF6B35'; } else { btn.style.background='none'; btn.style.color='#495057'; btn.style.borderLeftColor='transparent'; }}); }
			li.appendChild(btn);
		}
		if(hasKids&&inner) li.appendChild(inner);
		return li;
	}
	function setActive(a){ document.querySelectorAll('#sidebarNav a').forEach(el=>{ el.classList.remove('active'); el.style.background=''; el.style.color='#495057'; el.style.borderLeftColor='transparent'; }); a.classList.add('active'); a.style.background='#fff5f2'; a.style.color='#FF6B35'; a.style.borderLeftColor='#FF6B35'; }
	function normalize(p){ return p.replace(/^\//,'').replace(/#.*/,''); }
	async function reloadNav(){ const toc=await loadTOC(); const c=document.getElementById('sidebarNav'); if(toc&&c){ const structure=Array.isArray(toc)?toc:toc.structure; if(structure) build(c, structure); }}
	window.addEventListener('docPageLoaded', e=>{ const p=normalize(e.detail.path); document.querySelectorAll('#sidebarNav a').forEach(a=>{ const t=normalize(a.getAttribute('href')); if(t===p||t===p+'.htm'||t+'.htm'===p){ setActive(a);} }); });
	window.addEventListener('tocReload', async (ev)=>{ const c=document.getElementById('sidebarNav'); if(c&&ev.detail&&ev.detail.tocData){ const structure=Array.isArray(ev.detail.tocData)?ev.detail.tocData:ev.detail.tocData.structure; if(structure) build(c, structure); } else { await reloadNav(); } });
	document.addEventListener('DOMContentLoaded', ()=>{ const sel=document.getElementById('regionSelector'); if(sel){ sel.addEventListener('change', async ()=>{ await reloadNav(); }); } });
	const toc=await loadTOC(); const c=document.getElementById('sidebarNav'); if(toc&&c){ const structure=Array.isArray(toc)?toc:toc.structure; if(structure) build(c, structure); }
})();
