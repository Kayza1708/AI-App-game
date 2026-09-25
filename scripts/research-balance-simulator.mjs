import { createDefaultState } from '../src/data/defaultState.js';
import { economySnapshot, researchPerSecond } from '../src/systems/GameSystem.js';
import { researchDataCost, researchDurationSeconds } from '../src/systems/ResearchEconomySystem.js';
import { RESEARCH_PROJECTS } from '../src/systems/ResearchSystem.js';
const project=RESEARCH_PROJECTS.find(item=>item.id==='research-science-1');
const profile=(name,hardware)=>{const state=createDefaultState();Object.assign(state.hardware,hardware);const economy=economySnapshot(state);return{name,dataPerSecond:researchPerSecond(state),computePerSecond:economy.computePerSecond,rows:[1,5,10,20,50].map(level=>{const dataCost=researchDataCost(project.baseDataCost,level),durationSeconds=researchDurationSeconds(project.baseSeconds,level);return{level,durationSeconds,dataCost,saveSeconds:dataCost/researchPerSecond(state)}})}};
const report={generatedAt:new Date().toISOString(),formula:{duration:`min(baseSeconds * 1.22^(level - 1), 259200)`,dataCost:`ceil(baseDataCost * 1.28^(level - 1))`},project:{id:project.id,baseSeconds:project.baseSeconds,baseDataCost:project.baseDataCost},profiles:[profile('early-active',{calculator:25,homeComputer:8,gamingPc:2}),profile('established-passive',{calculator:25,homeComputer:15,gamingPc:8,workstation:4,miniDatacenter:1})]};
process.stdout.write(`${JSON.stringify(report,null,2)}\n`);
