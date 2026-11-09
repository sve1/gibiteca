import {useState,useEffect,useRef} from 'react'
const MODOS=[['vertical','Vertical'],['horizontal','Horizontal'],['duas','2 páginas']]

export default function Leitor({titulo,paginas,inicio,onPagina,onFechar}){
  const n=paginas.length
  const [modo,setModo]=useState(()=>localStorage.getItem('modo')||'horizontal')
  const [pag,setPag]=useState(Math.max(0,Math.min(inicio,n-1)))
  const [ui,setUi]=useState(true)
  const roda=useRef(null),x0=useRef(0)
  const passo=modo==='duas'?2:1
  const rolarPara=p=>{const el=roda.current;if(el)el.scrollTop=el.children[p]?.offsetTop||0}

  useEffect(()=>{
    localStorage.setItem('modo',modo)
    if(modo==='duas'&&pag%2)setPag(pag-1)
    if(modo==='vertical')rolarPara(pag)
  },[modo])
  useEffect(()=>{onPagina(pag,n)},[pag])

  const ir=p=>{
    p=Math.max(0,Math.min(n-1,p))
    if(modo==='duas')p-=p%2
    setPag(p)
    if(modo==='vertical')rolarPara(p)
  }
  const toque=e=>{
    if(modo==='vertical'){setUi(!ui);return}
    const f=e.clientX/innerWidth
    if(f<.3)ir(pag-passo);else if(f>.7)ir(pag+passo);else setUi(!ui)
  }
  const fimToque=e=>{
    const d=e.changedTouches[0].clientX-x0.current
    if(modo!=='vertical'&&Math.abs(d)>60)ir(d>0?pag-passo:pag+passo)
  }
  const rolou=e=>{
    const el=e.currentTarget
    let p=0
    for(let i=0;i<el.children.length;i++){if(el.children[i].offsetTop<=el.scrollTop+el.clientHeight*.4)p=i;else break}
    if(el.scrollTop+el.clientHeight>=el.scrollHeight-2)p=n-1
    if(p!==pag)setPag(p)
  }
  const rotulo=modo==='duas'&&pag+1<n?`${pag+1}–${pag+2}`:pag+1

  return (
    <div className="leitor">
      <div className="palco" onClick={toque} onTouchStart={e=>{x0.current=e.touches[0].clientX}} onTouchEnd={fimToque}>
        {modo==='vertical'
          ?<div className="vert" ref={roda} onScroll={rolou}>{paginas.map((s,i)=><img key={i} src={s} alt={`Página ${i+1}`} loading="lazy" decoding="async"/>)}</div>
          :<div className={'folha '+modo}>{(modo==='duas'?[pag,pag+1]:[pag]).filter(i=>i<n).map(i=><img key={i} src={paginas[i]} alt={`Página ${i+1}`}/>)}</div>}
      </div>
      {ui&&<>
        <div className="topo">
          <button className="ic" onClick={onFechar} aria-label="Voltar à biblioteca">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>
          </button>
          <strong className="nome">{titulo}</strong>
        </div>
        <div className="base">
          <div className="linha"><span>Pág. {rotulo} / {n}</span><span>{Math.round(pag/Math.max(1,n-1)*100)}%</span></div>
          <input type="range" min="0" max={n-1} value={pag} onChange={e=>ir(+e.target.value)} aria-label="Ir para a página"/>
          <div className="modos" role="group" aria-label="Modo de leitura">
            {MODOS.map(([k,t])=><button key={k} aria-pressed={k===modo} className={k===modo?'on':''} onClick={()=>setModo(k)}>{t}</button>)}
          </div>
        </div>
      </>}
    </div>
  )
}
