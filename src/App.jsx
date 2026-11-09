import {useState,useEffect,useRef} from 'react'
import JSZip from 'jszip'
import Leitor from './Leitor.jsx'
import {paginaDemo} from './demo.js'

const CORES=['#1d3557','#6a040f','#2d6a4f','#3c096c','#7f4f24','#0b525b']
// Dados de exemplo (Etapa 1). Na Etapa 3 virão do escaneamento do aparelho.
const HQS=[
  {id:1,t:'Sombra Urbana',n:12,k:'HQs',p:44},{id:2,t:'Kōdo Blade',n:3,k:'Mangás',p:18},
  {id:3,t:'Neon Ronin',n:8,k:'Mangás',p:70},{id:4,t:'Estrela Caída',n:1,k:'HQs',p:100},
  {id:5,t:'Vale dos Ecos',n:5,k:'HQs',p:0},{id:6,t:'Lâmina Zero',n:21,k:'Mangás',p:0},
  {id:7,t:'Sombra Urbana',n:11,k:'HQs',p:100},{id:8,t:'Neon Ronin',n:7,k:'Mangás',p:100},
  {id:9,t:'Kōdo Blade',n:2,k:'Mangás',p:100},{id:10,t:'Vale dos Ecos',n:4,k:'HQs',p:60}
]
const TOTAL=12 // páginas da HQ de exemplo
const MIME={jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp',gif:'image/gif'}
const lerPg=id=>{const v=localStorage.getItem('pg:'+id);return v===null?null:+v}
const FILTROS=['Todos','Lendo','HQs','Mangás']

function Capa({h,i,abrir}){
  return (
    <div className="capa-wrap">
      <button className="capa" onClick={()=>abrir(h)} style={{background:CORES[i%CORES.length]}} aria-label={`${h.t}, número ${h.n}`}>
        <span className="tit">{h.t}</span><span className="num">Nº {h.n}</span>
      </button>
      {h.p>0&&<div className="barra" role="progressbar" aria-valuenow={h.p} aria-valuemin="0" aria-valuemax="100" aria-label="Progresso de leitura"><i style={{width:h.p+'%'}}/></div>}
    </div>
  )
}

export default function App(){
  const [tema,setTema]=useState(()=>localStorage.getItem('tema')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'))
  const [filtro,setFiltro]=useState('Todos')
  const [leitor,setLeitor]=useState(null)
  const [aviso,setAviso]=useState('')
  const inp=useRef()
  useEffect(()=>{document.documentElement.dataset.theme=tema;localStorage.setItem('tema',tema)},[tema])
  useEffect(()=>{const f=()=>setLeitor(null);addEventListener('popstate',f);return()=>removeEventListener('popstate',f)},[])
  useEffect(()=>()=>{leitor?.urls?.forEach(u=>URL.revokeObjectURL(u))},[leitor])

  const pct=h=>{const g=lerPg(h.id);return g===null?h.p:Math.round(g/(TOTAL-1)*100)}
  const itens=HQS.map(h=>({...h,p:pct(h)}))
  const lista=itens.filter(h=>filtro==='Todos'||(filtro==='Lendo'?h.p>0&&h.p<100:h.k===filtro))
  const lendo=itens.filter(h=>h.p>0&&h.p<100)

  function abrirDemo(h){
    history.pushState({l:1},'')
    setLeitor({id:h.id,titulo:`${h.t} Nº ${h.n}`,paginas:Array.from({length:TOTAL},(_,i)=>paginaDemo(h.t,i+1)),inicio:lerPg(h.id)??Math.round(h.p/100*(TOTAL-1))})
  }
  async function abrirArquivo(e){
    const f=e.target.files[0];e.target.value=''
    if(!f)return
    setAviso('Abrindo '+f.name+'…')
    try{
      const z=await JSZip.loadAsync(f)
      const nomes=Object.keys(z.files).filter(n=>!z.files[n].dir&&/\.(jpe?g|png|webp|gif)$/i.test(n)&&!n.startsWith('__MACOSX')).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}))
      if(!nomes.length){setAviso('Nenhuma imagem encontrada neste arquivo.');return}
      const urls=[]
      for(const n of nomes)urls.push(URL.createObjectURL(new Blob([await z.files[n].async('arraybuffer')],{type:MIME[n.split('.').pop().toLowerCase()]})))
      const id='arq:'+f.name+f.size
      history.pushState({l:1},'')
      setLeitor({id,titulo:f.name.replace(/\.[^.]+$/,''),paginas:urls,urls,inicio:lerPg(id)??0})
      setAviso('')
    }catch{setAviso('Não consegui abrir este arquivo. Use um .cbz válido.')}
  }

  return (
    <>
      <header>
        <div className="marca"><img src="logo.png" alt="" width="40" height="40"/><span className="tit logo">GIBITECA</span></div>
        <div className="acoes">
          <button className="tema" onClick={()=>inp.current.click()}>Abrir .cbz</button>
          <input ref={inp} type="file" accept=".cbz,.zip,application/zip" hidden onChange={abrirArquivo}/>
          <button className="tema" onClick={()=>setTema(tema==='dark'?'light':'dark')} aria-label={tema==='dark'?'Ativar modo claro':'Ativar modo escuro'}>{tema==='dark'?'Claro':'Escuro'}</button>
        </div>
      </header>
      <main>
        {aviso&&<p className="aviso" role="status">{aviso}</p>}
        <nav className="chips" aria-label="Filtros">
          {FILTROS.map(f=><button key={f} className={f===filtro?'on':''} onClick={()=>setFiltro(f)}>{f}</button>)}
        </nav>
        {filtro==='Todos'&&lendo.length>0&&<>
          <h2 className="tit">Continuar lendo</h2>
          <div className="faixa">{lendo.map(h=><Capa key={h.id} h={h} i={h.id-1} abrir={abrirDemo}/>)}</div>
        </>}
        <h2 className="tit">Biblioteca</h2>
        <div className="grade">{lista.map(h=><Capa key={h.id} h={h} i={h.id-1} abrir={abrirDemo}/>)}</div>
      </main>
      {leitor&&<Leitor key={leitor.id} titulo={leitor.titulo} paginas={leitor.paginas} inicio={leitor.inicio}
        onPagina={pg=>localStorage.setItem('pg:'+leitor.id,pg)} onFechar={()=>history.back()}/>}
    </>
  )
}
