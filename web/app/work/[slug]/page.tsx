import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { exhibits } from '@/data/exhibits';
export function generateStaticParams(){return exhibits.map(p=>({slug:p.slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const p=exhibits.find(p=>p.slug===slug);return {title:p?.title??'Project not found'};}
export default async function Project({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const p=exhibits.find(p=>p.slug===slug);if(!p)notFound();const next=exhibits[(exhibits.indexOf(p)+1)%exhibits.length];
 return <main id="main" className="case wrap"><Link className="back" href="/#work"><ArrowLeft size={18}/> Selected work</Link><header className="case-header"><span className="section-label">{p.index} / {p.meta}</span><h1>{p.title}</h1><p>{p.line}</p><div className="case-meta"><span>{p.role}</span><span>{p.date}</span></div></header><div className="case-body"><aside className="case-aside">PROJECT NOTES<ul>{p.tags.map(t=><li key={t}>{t}</li>)}</ul><p>Based on my August 2026 résumé. Supporting artifacts will be added as they are prepared for publication.</p></aside><div className="case-text"><section><h2>The problem</h2><p>{p.problem}</p></section><section><h2>My contribution</h2><p>{p.contribution}</p></section><section><h2>The work, in practice</h2><p>{p.summary}</p><ul>{p.decisions.map(d=><li key={d}>{d}</li>)}</ul></section><section><h2>Where it stands</h2><p>{p.outcome}</p></section><section><h2>Next evidence to publish</h2><p>{p.next}</p></section></div></div><div className="case-end"><Link href="/#work">Back to all work</Link><Link href={`/work/${next.slug}/`}>{next.title} <ArrowRight size={18} style={{display:'inline'}}/></Link></div></main>;
}
