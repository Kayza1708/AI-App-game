import { BALANCE } from '../config/balance.js';
import { BLUEPRINTS, COMPONENTS } from '../data/componentCatalog.js';
import { GAME_VERSION, HARDWARE_CATALOG, SAVE_VERSION } from '../data/defaultState.js';
import { ITEM_CATALOG } from '../data/itemCatalog.js';
import { RESEARCH_PROJECTS } from '../systems/ResearchSystem.js';

export const BALANCE_EXPORT_SCHEMA_VERSION = 1;
export const BALANCE_EXPORT_LIMITS = Object.freeze({ events: 10_000, snapshots: 2_000, snapshotSeconds: 30 });

const IMPORTANT = new Set(['run-started','run-ended','hardware-purchased','hardware-milestone-reached','research-project-started','research-project-completed','component-found','blueprint-crafted','development-cycle-performed','save-completed','save-failed','load-completed','load-failed']);

export function buildBalanceExport(report,{exportedAt=Date.now()}={}) {
  const events = [...(report.events??[])].sort((a,b)=>a.timestamp-b.timestamp||a.sessionSeconds-b.sessionSeconds).slice(-BALANCE_EXPORT_LIMITS.events).map(sanitize);
  const samples = compactSnapshots(report.samples??[],events);
  const componentFinds=events.filter(e=>e.type==='component-found');
  const crafts=events.filter(e=>e.type==='blueprint-crafted');
  const research=events.filter(e=>e.type.startsWith('research-project-'));
  const duration=Number(report.summary?.session?.totalDuration??report.durationSeconds??0);
  const files={
    'manifest.json': json({schemaVersion:BALANCE_EXPORT_SCHEMA_VERSION,appVersion:GAME_VERSION,economyVersion:`save-${SAVE_VERSION}`,exportedAt:new Date(exportedAt).toISOString(),runDurationSeconds:duration,parameters:usedParameters()}),
    'summary.json': json({activeSeconds:report.summary?.session?.activePlaytime??duration,offlineSeconds:report.summary?.offline?.totalDuration??0,prestige:events.filter(e=>['development-cycle-performed','run-ended'].includes(e.type)),hardwareMilestones:events.filter(e=>e.type==='hardware-milestone-reached'),research,itemCrafting:crafts,componentFinds:aggregateComponents(componentFinds),productionRates:rateTransitions(samples),bottlenecks:report.bottleneckPeriods??[],dropped:{events:Math.max(0,(report.events?.length??0)-BALANCE_EXPORT_LIMITS.events),snapshots:Math.max(0,(report.samples?.length??0)-samples.length)}}),
    'events.csv': eventsCsv(events),
    'snapshots.csv': snapshotsCsv(samples),
    'economy.json': json(economyDescription()),
    'diagnostics.json': json({exportSchemaVersion:BALANCE_EXPORT_SCHEMA_VERSION,telemetryHealth:report.validation?.status??null,longTicks:events.filter(e=>e.type==='long-tick'),saveLoad:events.filter(e=>/^(save|load)-/.test(e.type)),researchCompletionPhases:events.filter(e=>e.type==='research-completion-diagnostic'),runtimeFailures:report.runtimeFailures??[],recordCounts:{events:events.length,snapshots:samples.length},estimatedUncompressedBytes:eventsCsv(events).length+snapshotsCsv(samples).length,limits:BALANCE_EXPORT_LIMITS,unavailable:['save/load duration is only present when emitted by the persistence boundary']}),
  };
  return Object.freeze(files);
}

export async function createBalanceZip(report,{signal,onProgress=()=>{},yieldEvery=2}={}) {
  const files=buildBalanceExport(report),entries=[];let index=0;
  for(const [name,text] of Object.entries(files)){if(signal?.aborted)throw abortError();entries.push(zipEntry(name,new globalThis.TextEncoder().encode(text)));onProgress(++index/Object.keys(files).length);if(index%yieldEvery===0)await new Promise(resolve=>setTimeout(resolve,0));}
  if(signal?.aborted)throw abortError();return assembleZip(entries);
}

export function downloadBalanceZip(blob,name=`ai-singularity-balance-${new Date().toISOString().replaceAll(':','-')}.zip`){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),0)}

function compactSnapshots(samples,events){const selected=[];let last=-Infinity;for(const sample of samples){if((sample.sessionSeconds??0)-last>=BALANCE_EXPORT_LIMITS.snapshotSeconds){selected.push(sanitize(sample));last=sample.sessionSeconds??0}}
  for(const event of events.filter(e=>IMPORTANT.has(e.type))){const nearest=samples.reduce((best,s)=>Math.abs((s.sessionSeconds??0)-event.sessionSeconds)<Math.abs((best?.sessionSeconds??Infinity)-event.sessionSeconds)?s:best,null);if(nearest&&!selected.some(s=>s.timestamp===nearest.timestamp))selected.push(sanitize(nearest));}
  return selected.sort((a,b)=>(a.sessionSeconds??0)-(b.sessionSeconds??0)).slice(-BALANCE_EXPORT_LIMITS.snapshots);
}
function usedParameters(){return{hardware:HARDWARE_CATALOG.map(({id,baseCost,computePerSecond,costGrowth,milestones})=>({id,baseCost,computePerSecond,costGrowth,milestones})),research:RESEARCH_PROJECTS.map(({id,baseDataCost,researchCost,baseSeconds,baseDurationSeconds,effect,repeatable,maxLevel})=>({id,baseDataCost:baseDataCost??researchCost,baseSeconds:baseSeconds??baseDurationSeconds,effect,repeatable,maxLevel})),components:COMPONENTS.map(({id,rarity,sources})=>({id,rarity,sources})),recipes:BLUEPRINTS.map(({id,resultItemId,recipe})=>({id,resultItemId,recipe})),offline:BALANCE.offline}}
function economyDescription(){return{parameters:usedParameters(),formulas:{hardwareCost:'ceil(baseCost × costGrowth^owned), modified by canonical effectiveHardwareCost',researchDataCost:'ceil(baseDataCost × 1.28^(level-1))',researchDurationSeconds:'min(baseSeconds × 1.22^(level-1), 259200)',craftingRequirement:'max(1, ceil(baseRequired × (1 - min(0.5, craftingEfficiency))))'},items:ITEM_CATALOG.filter(i=>BLUEPRINTS.some(b=>b.resultItemId===i.id)).map(({id,name,effects})=>({id,name,effects})),sourceStatus:{implemented:['research completion rewards','authored hardware/component milestones where emitted'],open:['mission-authored component rewards','later Prestige component sources','passive random component drops','analysis actions beyond Research completion']}}}
function aggregateComponents(events){const result={};for(const event of events){const source=event.metadata?.componentSource??event.source,id=event.metadata?.componentId??event.label,amount=event.amount??event.metadata?.amount??0;result[source]??={};result[source][id]=(result[source][id]??0)+amount}return result}
function rateTransitions(samples){return samples.map(s=>({sessionSeconds:s.sessionSeconds,creditsPerSecond:s.creditsPerSecond,computePerSecond:s.computePerSecond,researchRate:s.researchRate,bottleneck:s.bottleneck}))}
function sanitize(value){if(Array.isArray(value))return value.map(sanitize);if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).filter(([key])=>!['playerId','email','username','profile','startingState','endingState'].includes(key)).map(([k,v])=>[k,sanitize(v)]));return value}
function json(value){return JSON.stringify(value,null,2)}
function csv(value){const text=typeof value==='object'&&value!==null?JSON.stringify(value):String(value??'');return /[",\n]/.test(text)?`"${text.replaceAll('"','""')}"`:text}
function eventsCsv(events){const keys=['timestamp','sessionSeconds','runSeconds','category','type','source','label','amount','cost','before','after','metadata'];return[keys.join(','),...events.map(e=>keys.map(k=>csv(e[k])).join(','))].join('\n')}
function snapshotsCsv(samples){const keys=['timestamp','sessionSeconds','runSeconds','credits','creditsPerSecond','compute','computePerSecond','research','researchRate','currentHardwareTier','bottleneck','hardwareOwnership'];return[keys.join(','),...samples.map(s=>keys.map(k=>csv(s[k])).join(','))].join('\n')}
function abortError(){return new globalThis.DOMException('Balance export cancelled','AbortError')}
function zipEntry(name,data){const nameBytes=new globalThis.TextEncoder().encode(name),crc=crc32(data),local=new Uint8Array(30+nameBytes.length+data.length),v=new DataView(local.buffer);v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint16(8,0,true);v.setUint32(14,crc,true);v.setUint32(18,data.length,true);v.setUint32(22,data.length,true);v.setUint16(26,nameBytes.length,true);local.set(nameBytes,30);local.set(data,30+nameBytes.length);return{nameBytes,data,crc,local}}
function assembleZip(entries){let offset=0;const central=[];for(const e of entries){const c=new Uint8Array(46+e.nameBytes.length),v=new DataView(c.buffer);v.setUint32(0,0x02014b50,true);v.setUint16(4,20,true);v.setUint16(6,20,true);v.setUint32(16,e.crc,true);v.setUint32(20,e.data.length,true);v.setUint32(24,e.data.length,true);v.setUint16(28,e.nameBytes.length,true);v.setUint32(42,offset,true);c.set(e.nameBytes,46);central.push(c);offset+=e.local.length}const centralSize=central.reduce((n,c)=>n+c.length,0),end=new Uint8Array(22),v=new DataView(end.buffer);v.setUint32(0,0x06054b50,true);v.setUint16(8,entries.length,true);v.setUint16(10,entries.length,true);v.setUint32(12,centralSize,true);v.setUint32(16,offset,true);return new Blob([...entries.map(e=>e.local),...central,end],{type:'application/zip'})}
function crc32(bytes){let crc=0xffffffff;for(const byte of bytes){crc^=byte;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0)}return(crc^0xffffffff)>>>0}
