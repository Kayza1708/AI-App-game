import test from 'node:test';
import assert from 'node:assert/strict';
import { buildBalanceExport, createBalanceZip, BALANCE_EXPORT_LIMITS } from '../src/dev/balance-exporter.js';
import { createDefaultState } from '../src/data/defaultState.js';
import { craftBlueprint, grantComponents } from '../src/systems/CraftingSystem.js';
import { startResearchProject, tickResearchLabs } from '../src/systems/ResearchSystem.js';
import { TelemetryService } from '../src/dev/telemetry-service.js';

const summary={session:{totalDuration:91,activePlaytime:61},offline:{totalDuration:30}};
test('balance package contains required privacy-safe bounded files and 30 second snapshots',()=>{
  const samples=Array.from({length:100},(_,i)=>({timestamp:i*1000,sessionSeconds:i,credits:i,creditsPerSecond:1,compute:i,computePerSecond:2,research:i,researchRate:3,playerId:'private'}));
  const report={summary,samples,events:[{timestamp:1,sessionSeconds:1,type:'run-started',category:'run',playerId:'private',metadata:{email:'secret@example.test'}}],bottleneckPeriods:[]};
  const files=buildBalanceExport(report,{exportedAt:0});
  assert.deepEqual(Object.keys(files),['manifest.json','summary.json','events.csv','snapshots.csv','economy.json','diagnostics.json']);
  assert(!Object.values(files).join('').includes('private'));
  assert(!Object.values(files).join('').includes('secret@example.test'));
  assert.equal(files['snapshots.csv'].trim().split('\n').length,6); // header + 0/30/60/90
});

test('ZIP generation is asynchronous, valid, cancellable, and does not mutate the report',async()=>{
  const report={summary,samples:[],events:[],bottleneckPeriods:[]},copy=structuredClone(report);
  const blob=await createBalanceZip(report);assert.equal(blob.type,'application/zip');
  const bytes=new Uint8Array(await blob.arrayBuffer());assert.equal(new DataView(bytes.buffer).getUint32(0,true),0x04034b50);assert.deepEqual(report,copy);
  const controller=new globalThis.AbortController();controller.abort();await assert.rejects(createBalanceZip(report,{signal:controller.signal}),error=>error.name==='AbortError');
});

test('component sources, exact recipe debit, crafting result, and research completion are recorded once',()=>{
  let now=1000,state=createDefaultState();state={...state,resources:{...state.resources,research:1e9}};
  const telemetry=new TelemetryService({clock:()=>now,storage:null});telemetry.start(state);
  const observe=(next,source)=>{now+=1000;telemetry.observe(state,next,source);state=next};
  observe(grantComponents(state,{circuits:4,lasers:2,'titanium-screws':6},'analysis:test'),'analysis');
  const before={...state.inventory.components};observe(craftBlueprint(state,'prototype-gpu-blueprint',now+1),'crafting');
  assert.equal(before.circuits-state.inventory.components.circuits,4);assert.equal(before.lasers-state.inventory.components.lasers,2);assert.equal(before['titanium-screws']-state.inventory.components['titanium-screws'],6);assert(state.inventory.instances.some(i=>i.catalogId==='prototype-gpu'));
  observe(startResearchProject(state,'research-compute-1',1,now),'research');const seconds=state.researchLabs.labs[0].totalSeconds;observe(tickResearchLabs(state,seconds*1000,now+seconds*1000),'game-loop');
  const events=telemetry.events;assert(events.some(e=>e.type==='component-found'&&e.metadata.componentSource==='analysis:test'));assert(events.some(e=>e.type==='blueprint-crafted'&&e.metadata.ingredients.circuits===4));assert.equal(events.filter(e=>e.type==='research-project-completed').length,1);assert.equal(events.filter(e=>e.type==='research-completion-diagnostic').length,1);
});

test('export limits large histories',()=>{const events=Array.from({length:BALANCE_EXPORT_LIMITS.events+50},(_,i)=>({timestamp:i,sessionSeconds:i,type:'tick',category:'economy'}));const files=buildBalanceExport({summary,events,samples:[]});const diagnostics=JSON.parse(files['diagnostics.json']);assert.equal(diagnostics.recordCounts.events,BALANCE_EXPORT_LIMITS.events);assert.equal(JSON.parse(files['summary.json']).dropped.events,50)});
