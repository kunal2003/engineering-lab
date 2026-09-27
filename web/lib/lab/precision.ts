/** Precision Lab: real MLP inference. Quantized weights are dequantized for JS arithmetic. */
export type Layer={input:number;output:number;weights:number[];bias:number[]};
export type Model={layers:Layer[]};
export type Bits=32|8|4;
export function quantize(values:number[],bits:Bits){if(bits===32)return {values:[...values],scale:1,integers:[] as number[]};const bound=2**(bits-1)-1;const scale=Math.max(...values.map(Math.abs))/bound||1;const integers=values.map(v=>Math.max(-bound,Math.min(bound,Math.round(v/scale))));return {values:integers.map(v=>v*scale),scale,integers};}
export function prepare(model:Model,bits:Bits):Model{return {layers:model.layers.map(l=>({...l,weights:quantize(l.weights,bits).values,bias:[...l.bias]}))};}
export function infer(model:Model,point:number[]):number[]{
 let a=point;
 model.layers.forEach((layer,index)=>{const out=new Array<number>(layer.output).fill(0);for(let j=0;j<layer.output;j++){let sum=layer.bias[j];for(let i=0;i<layer.input;i++)sum+=a[i]*layer.weights[i*layer.output+j];out[j]=index<model.layers.length-1?Math.max(0,sum):sum;}a=out;});
 const max=Math.max(...a);const exp=a.map(v=>Math.exp(v-max));const sum=exp.reduce((s,v)=>s+v,0);return exp.map(v=>v/sum);
}
export function packedBytes(model:Model,bits:Bits):number{return 8+model.layers.reduce((sum,l)=>sum+12+Math.ceil(l.weights.length*bits/8)+l.bias.length*4,0);}
export function pack(model:Model,bits:Bits):Uint8Array{
 const buffer=new ArrayBuffer(packedBytes(model,bits));const view=new DataView(buffer);const bytes=new Uint8Array(buffer);bytes.set([75,77,76,49,bits,model.layers.length,0,0]);let offset=8;
 for(const l of model.layers){const q=quantize(l.weights,bits);view.setUint32(offset,l.input,true);view.setUint32(offset+4,l.output,true);view.setFloat32(offset+8,q.scale,true);offset+=12;
 if(bits===32){for(const v of l.weights){view.setFloat32(offset,v,true);offset+=4;}}
 else if(bits===8){for(const v of q.integers)bytes[offset++]=v&255;}
 else {for(let i=0;i<q.integers.length;i+=2)bytes[offset++]=(q.integers[i]&15)|(((q.integers[i+1]??0)&15)<<4);}
 for(const v of l.bias){view.setFloat32(offset,v,true);offset+=4;}}
 return bytes;
}
export function unpack(bytes:Uint8Array):Model{
 if(bytes.length<8||bytes[0]!==75||bytes[1]!==77||bytes[2]!==76||bytes[3]!==49||![32,8,4].includes(bytes[4]))throw new Error('Invalid model header');
 const bits=bytes[4] as Bits;const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);let offset=8;const layers:Layer[]=[];
 for(let l=0;l<bytes[5];l++){if(offset+12>bytes.length)throw new Error('Truncated model');const input=view.getUint32(offset,true),output=view.getUint32(offset+4,true),scale=view.getFloat32(offset+8,true);offset+=12;if(!input||!output||input*output>1000000||!Number.isFinite(scale)||scale<=0)throw new Error('Invalid layer');const count=input*output;const needed=Math.ceil(count*bits/8)+output*4;if(offset+needed>bytes.length)throw new Error('Truncated weights');const weights:number[]=[];
 if(bits===32){for(let i=0;i<count;i++){weights.push(view.getFloat32(offset,true));offset+=4;}}
 else if(bits===8){for(let i=0;i<count;i++){const v=bytes[offset++];weights.push((v>127?v-256:v)*scale);}}
 else{for(let i=0;i<count;i++){const v=(bytes[offset+Math.floor(i/2)]>>(i%2*4))&15;weights.push((v>7?v-16:v)*scale);}offset+=Math.ceil(count/2);}
 const bias:number[]=[];for(let i=0;i<output;i++){bias.push(view.getFloat32(offset,true));offset+=4;}layers.push({input,output,weights,bias});}
 if(offset!==bytes.length)throw new Error('Trailing model data');return {layers};
}
export function evaluate(model:Model,points:{x:number;y:number;label:number}[]){let correct=0;for(const p of points){const a=infer(model,[p.x,p.y]);if((a[1]>a[0]?1:0)===p.label)correct++;}return points.length?correct/points.length:0;}
