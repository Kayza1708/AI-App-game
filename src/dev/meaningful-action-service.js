const MEANINGFUL_TYPES = new Set(['hardware-purchased','run-upgrade-purchased','model-improvement-purchased','model-unlocked-permanently','model-training-target-changed','technology-purchased','gem-shop-purchase','model-training-started','model-training-completed','model-deployed','model-undeployed','objective-claimed','achievement-unlocked','mission-claimed','patent-discovered','world-event-choice-selected','rewarded-boost-activated','development-cycle-performed']);
export class MeaningfulActionService {
  intervals = []; lastActionSeconds = 0; lastAction = null;
  isMeaningful(event) { return event.meaningful || MEANINGFUL_TYPES.has(event.type); }
  record(event) { if (!this.isMeaningful(event)) return null; const interval = Math.max(0, event.sessionSeconds - this.lastActionSeconds); if (this.lastAction) this.intervals.push({ seconds: interval, phase: phaseFor(event.runSeconds), before: this.lastAction.type, after: event.type }); this.lastActionSeconds = event.sessionSeconds; this.lastAction = event; return interval; }
  secondsSince(now) { return Math.max(0, now - this.lastActionSeconds); }
  summary() { const values = this.intervals.map(({seconds}) => seconds).sort((a,b)=>a-b); return { average: average(values), median: percentile(values,.5), p90: percentile(values,.9), longest: values.at(-1) ?? 0, byPhase: Object.groupBy ? Object.groupBy(this.intervals, ({phase})=>phase) : group(this.intervals) }; }
}
function phaseFor(seconds){return seconds<600?'early':seconds<3600?'mid':'late'}
function average(values){return values.length?values.reduce((a,b)=>a+b,0)/values.length:0}
function percentile(values,p){return values.length?values[Math.min(values.length-1,Math.floor((values.length-1)*p))]:0}
function group(values){return values.reduce((result,item)=>{(result[item.phase]??=[]).push(item);return result},{})}
