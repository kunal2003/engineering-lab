/** Signal: replayable baggage projections with idempotency and evidence-based gap recovery. */
export const stations=['Check-in','Sorting','Security','Loaded','Arrival'] as const;
export type Scan={id:string;bag:string;station:number;timestamp:number};
export type Projection={last:number;seen:number[];missing:number[];duplicates:number;status:'Awaiting first scan'|'In transit'|'Gap detected'|'Arrived';events:Scan[]};
export function project(events:Scan[],bag='KM-042'):Projection{
 const ids=new Set<string>();const seen=new Set<number>();const accepted:Scan[]=[];let duplicates=0;
 for(const event of events){if(!event.id||!Number.isInteger(event.station)||event.station<0||event.station>=stations.length||!Number.isFinite(event.timestamp))throw new Error('Invalid scan');if(event.bag!==bag)continue;if(ids.has(event.id)){duplicates++;continue;}ids.add(event.id);seen.add(event.station);accepted.push({...event});}
 const last=seen.size?Math.max(...seen):-1;const missing=Array.from({length:last+1},(_,i)=>i).filter(i=>!seen.has(i));
 return {last,seen:[...seen].sort((a,b)=>a-b),missing,duplicates,status:missing.length?'Gap detected':last===4?'Arrived':last<0?'Awaiting first scan':'In transit',events:accepted.sort((a,b)=>a.timestamp-b.timestamp||a.id.localeCompare(b.id))};
}
export function nextScan(events:Scan[],station:number,id?:string):Scan{return {id:id??`scan-${events.length+1}-${station}`,bag:'KM-042',station,timestamp:events.length*60000};}
