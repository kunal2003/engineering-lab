import {readFileSync,writeFileSync} from 'node:fs';
import {cpus,platform,arch} from 'node:os';
import {pack,unpack,evaluate,infer} from '../core/precision.ts';
const root=new URL('../data/',import.meta.url);
const model=JSON.parse(readFileSync(new URL('model.json',root)));
const points=JSON.parse(readFileSync(new URL('test-points.json',root)));
const results=[];
for(const bits of [32,8,4]){const bytes=pack(model,bits);writeFileSync(new URL(`model-${bits}.bin`,root),bytes);const restored=unpack(bytes);for(let i=0;i<1000;i++)infer(restored,[points[i%512].x,points[i%512].y]);const trials=[];for(let t=0;t<15;t++){const start=performance.now();for(const p of points)infer(restored,[p.x,p.y]);trials.push(performance.now()-start);}const sorted=[...trials].sort((a,b)=>a-b);results.push({bits,bytes:bytes.length,accuracy:evaluate(restored,points),medianBatchMs:sorted[7],trialsMs:trials});}
const result={date:new Date().toISOString(),runtime:process.version,platform:platform(),arch:arch(),cpu:cpus()[0].model,task:'512 synthetic ring-classification points; warm JS inference after dequantization',results};writeFileSync(new URL('benchmark.json',root),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
