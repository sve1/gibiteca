const FUNDOS=['#cfd8e3','#f1d4d0','#d7e5d3','#f3e3b8','#e6dcef']
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;')
// Página de exemplo (só para testar o leitor até os arquivos reais entrarem na Etapa 3)
export function paginaDemo(titulo,n){
  const w=[[.6,.4],[.4,.6],[.5,.5]][n%3],v=[w[1],w[0]]
  let k=n,r=''
  for(const [y,h,cols] of [[30,380,w],[430,300,[1]],[750,420,v]]){
    let x=30
    for(const c of cols){
      const pw=cols.length>1?Math.round(720*c):740
      r+=`<rect x="${x}" y="${y}" width="${pw}" height="${h}" fill="${FUNDOS[k++%5]}" stroke="#111" stroke-width="5"/><rect x="${x}" y="${y}" width="${pw}" height="${h}" fill="url(#h)"/>`
      x+=pw+20
    }
  }
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1200"><defs><pattern id="h" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="4" cy="4" r="1.4" fill="#000" opacity=".14"/></pattern></defs><rect width="800" height="1200" fill="#FFFDF7"/>${r}<ellipse cx="150" cy="95" rx="95" ry="48" fill="#fff" stroke="#111" stroke-width="4"/><text x="150" y="106" font-family="sans-serif" font-weight="700" font-size="30" text-anchor="middle">${n}</text><text x="400" y="590" font-family="sans-serif" font-weight="700" font-size="34" text-anchor="middle" fill="#111">${esc(titulo)}</text></svg>`
  return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg)
}
