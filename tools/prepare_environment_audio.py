#!/usr/bin/env python3
"""Deterministic authored sound layers, no recordings or third-party samples.

python3 tools/prepare_environment_audio.py [--verify]
NumPy only. Synthetic studies are not location recordings or approved voices.
"""
from pathlib import Path
import hashlib,json,math,sys,wave
import numpy as np
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'assets/library/environment-audio'
SR=22050
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def noise(seconds,seed,low,high):
    n=round(seconds*SR);rng=np.random.default_rng(seed);f=np.fft.rfftfreq(n,1/SR)
    z=rng.normal(size=len(f))+1j*rng.normal(size=len(f));z*=np.minimum(f/max(low,1),1)**2/(1+(f/high)**4);z[0]=0
    y=np.fft.irfft(z,n);return y/max(np.max(np.abs(y)),1e-9)
def generate():
    OUT.mkdir(parents=True,exist_ok=True);records=[]
    t=np.arange(12*SR)/SR
    wind=noise(12,401,40,650)*(.5+.2*np.sin(math.tau*t/12)+.12*np.sin(math.tau*3*t/12))
    water=noise(12,509,150,2600)*(.5+.15*np.sin(math.tau*5*t/12))
    for f in [29,37,47]:water+=.03*np.sin(math.tau*f*t+1.6*np.sin(math.tau*7*t/12))
    t2=np.arange(4*SR)/SR;wheel=np.zeros(len(t2))
    for i in range(16):
        dt=(t2-i/4)%4;wheel+=np.sin(math.tau*183*dt)*np.exp(-dt*45)*.25
    t3=np.arange(3*SR)/SR;bell=np.zeros(len(t3))
    for f,w in [(392,1),(783.1,.4),(1062,.2),(1568.7,.12)]:bell+=w*np.sin(math.tau*f*t3)*np.exp(-t3*(1+f/1800))
    bell*=np.minimum(t3/.008,1);bell[-int(.1*SR):]*=np.linspace(1,0,int(.1*SR))
    ts=np.arange(round(.3*SR))/SR;step=noise(.3,911,90,1700)*np.minimum(ts/.004,1)*np.exp(-ts*23)
    layers=[('wind',wind,True,'城门/屋顶/园林低层；合成柔风'),('water',water,True,'近岸小波层；合成水感，不冒充曲江实录'),('wood-wheel',wheel,True,'骑行木结构细响，随速度改变音高/增益；不表示真实机械录音'),('distant-bell',bell,False,'寺院远钟音色研究；非考证编钟/寺钟采样'),('earth-step',step,False,'土路落脚音色研究；鞋底/步频仍需实景调音')]
    for name,y,loop,use in layers:
        y=y/max(np.max(np.abs(y)),1e-9)*.32
        data=(y*32767).round().astype('<i2');p=OUT/(name+'.wav')
        import io
        b=io.BytesIO()
        with wave.open(b,'wb') as w:w.setparams((1,2,SR,0,'NONE','not compressed'));w.writeframes(data.tobytes())
        raw=b.getvalue()
        if p.exists() and p.read_bytes()!=raw:raise RuntimeError('Preserving different sound: '+str(p))
        p.write_bytes(raw)
        records.append({'id':name,'file':p.name,'sha256':sha(p),'bytes':len(raw),'seconds':len(y)/SR,'loop':loop,'source':'deterministic original synthesis; no third-party recordings','usage':use,'peak':float(np.max(np.abs(y))),'seam_delta':int(abs(int(data[0])-int(data[-1]))) if loop else None})
    (OUT/'manifest.json').write_text(json.dumps({'status':'authored_study_layers_not_final_mix','source':'tools/prepare_environment_audio.py','source_sha256':sha(Path(__file__)),'sample_rate':SR,'channels':1,'third_party_samples':False,'runtime_integrated':False,'semantic_audition_accepted':False,'voices_included':False,'files':records},ensure_ascii=False,indent=2)+'\n')
def verify():
    x=json.loads((OUT/'manifest.json').read_text())
    for f in x['files']:
        p=OUT/f['file'];assert sha(p)==f['sha256']
        with wave.open(str(p)) as w:
            assert w.getnchannels()==1 and w.getframerate()==SR
            a=np.frombuffer(w.readframes(w.getnframes()),dtype='<i2');assert np.max(np.abs(a))<32767 and np.std(a)>50
            if f['loop']:assert abs(int(a[0])-int(a[-1]))<2000
    print('PASS',len(x['files']),'authored audio layers; hash, PCM, levels and loop boundaries')
if '--verify' not in sys.argv:generate()
verify()
