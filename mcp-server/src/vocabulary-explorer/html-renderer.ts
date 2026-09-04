/**
 * [IMPL-VOCABULARY_HTML_RENDERER] [ARCH-VOCABULARY_OFFLINE_VIEW] [REQ-VOCABULARY_EXPLORER]
 * Single-file offline HTML renderer with injection-safe embed.
 */

import type { VocabularyExplorerV1Envelope, VocabularyTerm } from "./view-model.js";

/** [IMPL-VOCABULARY_HTML_RENDERER] [ARCH-VOCABULARY_OFFLINE_VIEW] [REQ-VOCABULARY_EXPLORER] */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Script-safe JSON: Unicode-escape < and > and line separators. */
export function scriptSafeJson(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

function ownershipBadge(ownership: string): string {
  if (ownership === "methodology_only") return "Methodology-only";
  if (ownership === "merged_override") return "Override";
  if (ownership === "project") return "Project";
  return "";
}

/**
 * [IMPL-VOCABULARY_HTML_RENDERER] [ARCH-VOCABULARY_OFFLINE_VIEW] [REQ-VOCABULARY_EXPLORER]
 * How: render self-contained HTML with proof boundary, filters, and fragment state.
 */
export function renderVocabularyExplorerHtml(envelope: VocabularyExplorerV1Envelope): string {
  if (envelope.schema !== "vocabulary-explorer.v1") {
    throw new Error("InvalidEnvelope: expected vocabulary-explorer.v1");
  }

  const title = escapeHtml(`Vocabulary Explorer — ${envelope.project_root_label}`);
  const jsonPayload = scriptSafeJson(envelope);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${title}</title>
<style>
:root { font-family: system-ui, sans-serif; color: #1a1a1a; }
body { margin: 0; display: grid; grid-template-columns: minmax(220px, 1fr) minmax(260px, 340px) minmax(300px, 1.2fr); grid-template-rows: auto auto 1fr; height: 100vh; overflow: hidden; }
.banner { grid-column: 1 / -1; background: #fff3cd; border-bottom: 1px solid #ffc107; padding: 8px 16px; font-size: 14px; }
header { grid-column: 1 / -1; padding: 12px 16px; border-bottom: 1px solid #ddd; }
main { padding: 12px 16px; overflow: auto; min-height: 0; border-right: 1px solid #eee; }
aside { background: #fafafa; display: flex; flex-direction: column; min-height: 0; overflow: hidden; border-left: 1px solid #ddd; }
aside.detail-column { border-right: 1px solid #eee; }
#detail-panel, #occurrences-panel { display: flex; flex-direction: column; flex: 1; min-height: 0; padding: 12px 16px; overflow: auto; }
#occurrences-panel { background: #fff; }
#occurrences-panel h2 { margin: 0 0 8px; font-size: 14px; position: sticky; top: 0; background: #fff; padding: 4px 0 8px; border-bottom: 1px solid #eee; z-index: 1; }
.detail-header { flex-shrink: 0; }
.occ-panel-body { flex: 1; min-height: 0; overflow: auto; }
.filters label { display: block; margin: 6px 0; font-size: 13px; }
.filters input, .filters select { width: 100%; box-sizing: border-box; padding: 4px 6px; }
.term { padding: 6px 8px; border-radius: 4px; cursor: pointer; border: 1px solid transparent; }
.term:hover { background: #eef; }
.term.selected { border-color: #06c; background: #e8f0ff; }
.term:focus { outline: 2px solid #06c; outline-offset: 1px; }
.badge { font-size: 11px; padding: 1px 6px; border-radius: 3px; background: #eee; margin-left: 6px; }
.meta { color: #666; font-size: 12px; }
.preview { display: none; position: absolute; background: #fff; border: 1px solid #ccc; padding: 8px; max-width: 320px; font-size: 12px; z-index: 10; box-shadow: 0 2px 8px rgba(0,0,0,.12); }
.rel-link { color: #06c; cursor: pointer; text-decoration: underline; background: none; border: none; padding: 0; font: inherit; }
.rel-link:focus { outline: 2px solid #06c; }
.breadcrumbs { font-size: 12px; color: #555; margin-bottom: 8px; }
#detail-panel h2 { margin: 0 0 8px; font-size: 16px; }
#detail-panel h3.section { margin: 12px 0 6px; font-size: 13px; }
.occ-list { list-style: none; margin: 0; padding: 0; }
.occ-item { margin-bottom: 10px; border: 1px solid #ddd; border-radius: 4px; background: #fff; overflow: hidden; }
.occ-loc { font-size: 12px; font-weight: 600; padding: 6px 8px; background: #f0f0f0; border-bottom: 1px solid #eee; word-break: break-all; }
.occ-excerpt { margin: 0; padding: 8px; white-space: pre-wrap; font-size: 12px; font-family: ui-monospace, monospace; line-height: 1.4; }
.occ-more { margin-top: 8px; font-size: 12px; }
.occ-more button { background: #fff; border: 1px solid #ccc; border-radius: 4px; padding: 4px 10px; cursor: pointer; }
.occ-more button:focus { outline: 2px solid #06c; }
</style>
</head>
<body>
<div class="banner" role="status"><strong>Generated view — navigation aid only.</strong> This offline HTML is not canonical TIED intent. Proof boundary: ${escapeHtml(envelope.proof_boundary)}.</div>
<header>
<h1>${title}</h1>
<p class="meta">Generated ${escapeHtml(envelope.generated_at)} · ${envelope.walk_summary.files_scanned} files · ${envelope.terms.length} terms</p>
</header>
<main>
<div class="filters" id="filters"></div>
<div class="breadcrumbs" id="breadcrumbs"></div>
<div id="term-list" tabindex="0"></div>
<div class="preview" id="hover-preview"></div>
</main>
<aside class="detail-column" id="detail-panel"><p>Select a term.</p></aside>
<aside class="occurrences-column" id="occurrences-panel"><p class="meta">Occurrences appear here when you select a term.</p></aside>
<script type="application/json" id="vocabulary-data">${jsonPayload}</script>
<script>
(function(){
  var DATA = JSON.parse(document.getElementById('vocabulary-data').textContent);
  var state = { q:'', sel:'', kind:'', dir:'', fk:'', lang:'', prod:'', minf:'', view:'frequency' };
  var history = [Object.assign({}, state)];
  var histIdx = 0;

  function parseHash(){
    var h = location.hash.replace(/^#/, '');
    if(!h) return;
    var p = new URLSearchParams(h);
    state.q = p.get('q')||'';
    state.sel = p.get('sel')||'';
    state.kind = p.get('kind')||'';
    state.dir = p.get('dir')||'';
    state.fk = p.get('fk')||'';
    state.lang = p.get('lang')||'';
    state.prod = p.get('prod')||'';
    state.minf = p.get('minf')||'';
    state.view = p.get('view')||'frequency';
  }
  function writeHash(pushHistory){
    var p = new URLSearchParams();
    if(state.q) p.set('q', state.q);
    if(state.sel) p.set('sel', state.sel);
    if(state.kind) p.set('kind', state.kind);
    if(state.dir) p.set('dir', state.dir);
    if(state.fk) p.set('fk', state.fk);
    if(state.lang) p.set('lang', state.lang);
    if(state.prod) p.set('prod', state.prod);
    if(state.minf) p.set('minf', state.minf);
    if(state.view && state.view !== 'frequency') p.set('view', state.view);
    var s = p.toString();
    var next = s ? '#'+s : '';
    if(pushHistory){
      history = history.slice(0, histIdx+1);
      history.push(Object.assign({}, state));
      histIdx = history.length-1;
    }
    if(location.hash !== next) location.hash = next;
  }
  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function badge(o){ if(o==='methodology_only') return '<span class="badge">Methodology-only</span>'; if(o==='merged_override') return '<span class="badge">Override</span>'; if(o==='project') return '<span class="badge">Project</span>'; return ''; }
  function filtered(){
    var q = state.q.trim().toLowerCase();
    var minf = state.minf ? Number(state.minf) : DATA.policy.min_frequency;
    return DATA.terms.filter(function(t){
      if(q && t.display.toLowerCase().indexOf(q)<0 && t.id.indexOf(q)<0) return false;
      if(state.kind && t.kind !== state.kind) return false;
      if(state.dir && !t.occurrences.some(function(o){ return o.path.indexOf(state.dir)===0; })) return false;
      if(state.fk && !t.occurrences.some(function(o){ return o.file_kind===state.fk; })) return false;
      if(state.prod==='production' && !t.occurrences.some(function(o){ return o.file_kind==='production'; })) return false;
      if(state.prod==='test' && !t.occurrences.some(function(o){ return o.file_kind==='test'; })) return false;
      if(t.kind==='source_identifier' && t.frequency < minf) return false;
      return true;
    });
  }
  function renderFilters(){
    var el = document.getElementById('filters');
    el.innerHTML = '<label>Search <input type="search" id="f-q" value="'+esc(state.q)+'"/></label>'+
      '<label>Kind <select id="f-kind"><option value="">All</option><option value="tied_token">TIED token</option><option value="source_identifier">Source identifier</option></select></label>'+
      '<label>Directory <select id="f-dir"><option value="">All</option>'+DATA.filters_catalog.directories.map(function(d){ return '<option value="'+esc(d)+'">'+esc(d)+'</option>'; }).join('')+'</select></label>'+
      '<label>File kind <select id="f-fk"><option value="">All</option>'+DATA.filters_catalog.file_kinds.map(function(f){ return '<option value="'+esc(f)+'">'+esc(f)+'</option>'; }).join('')+'</select></label>'+
      '<label>Production/Test <select id="f-prod"><option value="">All</option><option value="production">Production</option><option value="test">Test</option></select></label>'+
      '<label>Min frequency <input type="number" id="f-minf" min="1" value="'+esc(state.minf||DATA.policy.min_frequency)+'"/></label>';
    document.getElementById('f-kind').value = state.kind;
    document.getElementById('f-dir').value = state.dir;
    document.getElementById('f-fk').value = state.fk;
    document.getElementById('f-prod').value = state.prod;
    ['f-q','f-kind','f-dir','f-fk','f-prod','f-minf'].forEach(function(id){
      document.getElementById(id).addEventListener('change', function(){
        state.q = document.getElementById('f-q').value;
        state.kind = document.getElementById('f-kind').value;
        state.dir = document.getElementById('f-dir').value;
        state.fk = document.getElementById('f-fk').value;
        state.prod = document.getElementById('f-prod').value;
        state.minf = document.getElementById('f-minf').value;
        writeHash(true);
        renderAll();
      });
    });
  }
  function renderList(){
    var list = document.getElementById('term-list');
    var terms = filtered();
    if(state.view==='frequency') terms = terms.slice().sort(function(a,b){ return b.frequency-a.frequency || a.id.localeCompare(b.id); });
    else terms = terms.slice().sort(function(a,b){ return a.id.localeCompare(b.id); });
    list.innerHTML = terms.map(function(t){
      var sel = t.id===state.sel ? ' selected' : '';
      return '<div class="term'+sel+'" tabindex="0" data-id="'+esc(t.id)+'">'+esc(t.display)+badge(t.ownership)+' <span class="meta">('+t.frequency+')</span></div>';
    }).join('');
    list.querySelectorAll('.term').forEach(function(node){
      node.addEventListener('click', function(){ state.sel = node.getAttribute('data-id'); writeHash(true); renderAll(); });
      node.addEventListener('mouseenter', function(e){
        var id = node.getAttribute('data-id');
        var t = DATA.terms.find(function(x){ return x.id===id; });
        var pv = document.getElementById('hover-preview');
        if(!t){ pv.style.display='none'; return; }
        pv.style.display='block';
        pv.style.left = (e.clientX+12)+'px';
        pv.style.top = (e.clientY+12)+'px';
        pv.innerHTML = '<strong>'+esc(t.display)+'</strong><br/>'+esc((t.description||'').slice(0,200));
      });
      node.addEventListener('mouseleave', function(){ document.getElementById('hover-preview').style.display='none'; });
    });
  }
  function renderDetail(){
    var panel = document.getElementById('detail-panel');
    var occPanel = document.getElementById('occurrences-panel');
    var t = DATA.terms.find(function(x){ return x.id===state.sel; });
    if(!t){
      panel.innerHTML = '<p>Select a term.</p>';
      occPanel.innerHTML = '<p class="meta">Occurrences appear here when you select a term.</p>';
      document.getElementById('breadcrumbs').textContent = '';
      return;
    }
    var crumbs = t.occurrences.length ? t.occurrences[0].path.split('/').slice(0,-1).join(' / ') : '';
    document.getElementById('breadcrumbs').textContent = crumbs ? 'Scope: '+crumbs : '';
    var rels = t.relationships.length
      ? t.relationships.map(function(r){
          return '<button type="button" class="rel-link" data-target="'+esc(r.target_id)+'">'+esc(r.kind)+' → '+esc(r.target_id)+'</button>';
        }).join('<br/>')
      : '<span class="meta">None</span>';
    panel.innerHTML =
      '<div class="detail-header">'+
        '<h2>'+esc(t.display)+badge(t.ownership)+'</h2>'+
        '<p class="meta">'+esc(t.kind)+' · layer '+esc(t.tied_layer||'n/a')+' · frequency '+t.frequency+'</p>'+
        (t.description ? '<p>'+esc(t.description)+'</p>' : '')+
        '<h3 class="section">Relationships</h3>'+
        '<div>'+rels+'</div>'+
      '</div>';
    panel.querySelectorAll('.rel-link').forEach(function(btn){
      btn.addEventListener('click', function(){ state.sel = btn.getAttribute('data-target'); writeHash(true); renderAll(); });
    });
    renderOccurrences(t);
  }
  function renderOccurrences(t){
    var occPanel = document.getElementById('occurrences-panel');
    var occLimit = t._occExpanded ? t.occurrences.length : Math.min(25, t.occurrences.length);
    var occItems = t.occurrences.slice(0, occLimit).map(function(o){
      return '<li class="occ-item"><div class="occ-loc">'+esc(o.path)+':'+o.line+' <span class="badge">'+esc(o.file_kind)+'</span></div><pre class="occ-excerpt">'+esc(o.excerpt)+'</pre></li>';
    }).join('');
    var occMore = '';
    if(!t._occExpanded && t.occurrences.length > 25){
      occMore = '<div class="occ-more"><button type="button" id="occ-show-all">Show all '+t.occurrences.length+' occurrences</button></div>';
    }
    occPanel.innerHTML =
      '<h2>Occurrences ('+t.occurrences.length+')</h2>'+
      '<div class="occ-panel-body">'+
        '<ul class="occ-list">'+occItems+'</ul>'+
        occMore+
      '</div>';
    var showAll = occPanel.querySelector('#occ-show-all');
    if(showAll){
      showAll.addEventListener('click', function(){
        t._occExpanded = true;
        renderOccurrences(t);
      });
    }
  }
  function renderAll(){ renderFilters(); renderList(); renderDetail(); }
  window.addEventListener('popstate', function(){
    parseHash();
    renderAll();
  });
  window.addEventListener('hashchange', function(){
    parseHash();
    renderAll();
  });
  parseHash();
  renderAll();
})();
</script>
</body>
</html>`;
}

export function renderTermSummaryHtml(term: VocabularyTerm): string {
  return escapeHtml(`${term.display} (${term.frequency})`);
}
