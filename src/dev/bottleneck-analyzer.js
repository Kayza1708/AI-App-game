export const BOTTLENECKS = ['No Compute','Demand Limited','Capacity Limited','Training Limited','Research Limited','Credits Limited','Patent Limited','Model Quality Limited','Marketing Limited','Reputation Limited','Adoption Limited','No Clear Bottleneck'];
export function classifyBottleneck(snapshot) {
  const computeRate=snapshot.computePerSecond??snapshot.effectiveComputePerSecond;if(Number.isFinite(computeRate)&&computeRate<=0)return 'No Compute';
  if (snapshot.trainingActive && snapshot.trainingRate <= 0.01) return 'Training Limited';
  if ((snapshot.researchAllocation??0)>0 && snapshot.patentEta > 14_400 && snapshot.researchRate <= .05) return 'Research Limited';
  if (snapshot.usefulPurchases === 0 && snapshot.cheapestUsefulEta > 30) return 'Credits Limited';
  if (snapshot.capacity > snapshot.demand * 1.15) return snapshot.marketing < 1 ? 'Marketing Limited' : snapshot.reputation < 1.2 ? 'Reputation Limited' : 'Demand Limited';
  if (snapshot.demand > snapshot.capacity * 1.15) return 'Capacity Limited';
  if (snapshot.modelQuality < 2 && snapshot.users > 10) return 'Model Quality Limited';
  if (snapshot.patentEta > 43_200) return 'Patent Limited';
  if (snapshot.adoption < 5 && snapshot.users > 100) return 'Adoption Limited';
  return 'No Clear Bottleneck';
}
export class BottleneckAnalyzer {
  periods=[]; current=null;
  update(snapshot, seconds) { const name=classifyBottleneck(snapshot); if(this.current?.name===name)return null; const previous=this.current;if(previous){previous.end=seconds;previous.duration=seconds-previous.start;this.periods.push(previous)} this.current={name,start:seconds,end:null,duration:0,values:{demand:snapshot.demand,capacity:snapshot.capacity},suggestion:suggestion(name)};return previous?{previous:previous.name,next:name,duration:previous.duration}:null }
  finalize(seconds){if(this.current){this.current.end=seconds;this.current.duration=seconds-this.current.start;this.periods.push(this.current);this.current=null}}
  summary(total){const durations={};for(const p of this.periods)(durations[p.name]??=0,durations[p.name]+=p.duration);return{percentages:Object.fromEntries(Object.entries(durations).map(([k,v])=>[k,total?v/total*100:0])),longest:[...this.periods].sort((a,b)=>b.duration-a.duration)[0]??null,transitions:Math.max(0,this.periods.length-1)}}
}
function suggestion(name){return {'No Compute':'Buy Hardware to begin producing Compute.','Capacity Limited':'Increase Inference allocation or serving efficiency.','Demand Limited':'Invest in Marketing, Quality, or Reputation.','Credits Limited':'Improve revenue per user or claim available rewards.','Research Limited':'Increase Research allocation or deploy Research models.','Training Limited':'Increase Training allocation and effective Compute.'}[name]??'Review allocation and the next useful purchase.'}
