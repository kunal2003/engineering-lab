"""Reproduce a small concentric-ring classifier; no downloaded model or dataset."""
import json, platform, hashlib
from pathlib import Path
import numpy as np
rng=np.random.default_rng(42)
def dataset(n,seed):
 r=np.random.default_rng(seed);y=r.integers(0,2,n);theta=r.uniform(-np.pi,np.pi,n)
 radii=np.where(y==0,r.uniform(0,.98,n),r.uniform(1.45,2.65,n))+r.normal(0,.06,n)
 x=np.column_stack([radii*np.cos(theta),radii*np.sin(theta)])
 return x,y
x,y=dataset(1536,101);test,labels=dataset(512,202);sizes=[2,16,16,2]
w=[rng.normal(0,np.sqrt(2/a),(a,b)) for a,b in zip(sizes[:-1],sizes[1:])];bias=[np.zeros(b) for b in sizes[1:]]
m=[np.zeros_like(v) for v in w+bias];v=[np.zeros_like(a) for a in w+bias]
losses=[]
for epoch in range(1,901):
 a=[x];pre=[]
 for i in range(3):
  z=a[-1]@w[i]+bias[i];pre.append(z);a.append(np.maximum(0,z) if i<2 else z)
 logits=a[-1]-a[-1].max(1,keepdims=True);p=np.exp(logits);p/=p.sum(1,keepdims=True)
 loss=-np.log(p[np.arange(len(y)),y]+1e-12).mean()
 if epoch%100==0:losses.append({'epoch':epoch,'loss':float(loss)})
 d=p.copy();d[np.arange(len(y)),y]-=1;d/=len(y);gw=[None]*3;gb=[None]*3
 for i in reversed(range(3)):
  gw[i]=a[i].T@d;gb[i]=d.sum(0)
  if i:d=(d@w[i].T)*(pre[i-1]>0)
 for j,(param,grad) in enumerate(zip(w+bias,gw+gb)):
  m[j]=.9*m[j]+.1*grad;v[j]=.999*v[j]+.001*grad*grad
  param-=.012*(m[j]/(1-.9**epoch))/(np.sqrt(v[j]/(1-.999**epoch))+1e-8)
model={'layers':[{'input':a,'output':b,'weights':wi.astype(np.float32).ravel().tolist(),'bias':bi.astype(np.float32).tolist()} for a,b,wi,bi in zip(sizes[:-1],sizes[1:],w,bias)]}
root=Path(__file__).resolve().parents[1];out=root/'data';out.mkdir(exist_ok=True)
(out/'model.json').write_text(json.dumps(model,separators=(',',':'))+'\n')
(out/'test-points.json').write_text(json.dumps([{'x':float(x),'y':float(y),'label':int(l)} for (x,y),l in zip(test,labels)],separators=(',',':'))+'\n')
(out/'training.json').write_text(json.dumps({'seed':42,'trainSeed':101,'testSeed':202,'trainCount':len(x),'testCount':len(test),'epochs':900,'architecture':sizes,'numpy':np.__version__,'python':platform.python_version(),'lossTrace':losses,'modelSHA256':hashlib.sha256((out/'model.json').read_bytes()).hexdigest()},indent=2)+'\n')
print(json.dumps({'finalLoss':float(loss),'parameters':sum(a.size for a in w+bias),'modelSHA256':hashlib.sha256((out/'model.json').read_bytes()).hexdigest()}))
