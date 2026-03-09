const KEY = 'a6178823f5e2f865dfd88e8cade51391';
const ARCHITECT = "110103";
const cats = ["estrenos nuevos", "series", "animes", "acción", "terror", "amor", "infantil"];

let saldo = parseFloat(localStorage.getItem('dabo_cash')) || 1240.50;

window.onload = render;

async function render() {
    const container = document.getElementById('catalog');
    container.innerHTML = '';
    for(let c of cats) {
        const rowId = `row-${c.replace(/\s/g, '')}`;
        container.innerHTML += `<h3 class="px-6 text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-2">${c}</h3><div class="v-row" id="${rowId}"></div>`;
        
        let q = c === "estrenos nuevos" ? "trending/all/day" : `search/multi?query=${c}`;
        fetch(`https://api.themoviedb.org/3/${q}${q.includes('?')?'&':'?'}api_key=${KEY}&language=es-ES`)
        .then(r => r.json()).then(data => {
            document.getElementById(rowId).innerHTML = data.results.filter(m => m.poster_path).map(m => `
                <div class="card-vip" style="background-image:url('https://image.tmdb.org/t/p/w400${m.poster_path}')" onclick="verificar(${m.id}, '${m.media_type || (m.name?'tv':'movie')}')"></div>
            `).join('');
        });
    }
}

async function verificar(id, tipo) {
    saldo += 0.35; localStorage.setItem('dabo_cash', saldo);
    if(tipo === 'tv') {
        const res = await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${KEY}&language=es-ES`);
        const data = await res.json();
        document.getElementById('series-menu').style.display = 'block';
        document.getElementById('s-title').innerText = data.name;
        document.getElementById('seasons-list').innerHTML = data.seasons.filter(s => s.season_number > 0).map(s => `
            <div class="btn-premium" onclick="getEpisodes(${id}, ${s.season_number})">
                <span>${s.name.toUpperCase()}</span><i class="fas fa-play"></i>
            </div>`).join('');
    } else { play(id, 'movie'); }
}

async function getEpisodes(id, sNum) {
    const res = await fetch(`https://api.themoviedb.org/3/tv/${id}/season/${sNum}?api_key=${KEY}&language=es-ES`);
    const data = await res.json();
    document.getElementById('episodes-menu').style.display = 'block';
    document.getElementById('episodes-list').innerHTML = data.episodes.map(e => `
        <div class="btn-premium" onclick="play(${id}, 'tv', ${sNum}, ${e.episode_number})">
            <span>${e.episode_number}. ${e.name}</span>
        </div>`).join('');
}

function play(id, tipo, s=1, e=1) {
    document.getElementById('player-view').style.display = 'block';
    const videoFrame = document.getElementById('video-frame');
    videoFrame.innerHTML = ""; // Limpiar anterior
    
    // Generar URL
    const src = tipo === 'movie' 
        ? `https://vidsrc.icu/embed/movie/${id}` 
        : `https://vidsrc.icu/embed/tv/${id}/${s}/${e}`;

    // Crear Iframe dinámicamente para saltar bloqueos
    const ifrm = document.createElement("iframe");
    ifrm.setAttribute("src", src);
    ifrm.style.width = "100%";
    ifrm.style.height = "100%";
    ifrm.setAttribute("frameborder", "0");
    ifrm.setAttribute("allowfullscreen", "true");
    ifrm.setAttribute("referrerpolicy", "no-referrer"); 
    
    videoFrame.appendChild(ifrm);
}

function cerrar(id) { document.getElementById(id).style.display = 'none'; }
function cerrarPlayer() { cerrar('player-view'); document.getElementById('video-frame').innerHTML = ''; }

document.getElementById('admin-vault').onclick = () => {
    if(prompt("PIN ARQUITECTO:") === ARCHITECT) {
        alert(`ECOBANK DASHBOARD\n-----------------\nSaldo: $${saldo.toFixed(2)}\nCuenta: 4950...2719\nEstado: Monetizando`);
    }
};

function activarVoz() {
    const rec = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    rec.lang = 'es-ES';
    rec.start();
    rec.onresult = (e) => {
        const t = e.results[0][0].transcript.toLowerCase();
        if(t.includes("dieyna")) alert("Bienvenida, futura esposa Dieyna ❤️");
        document.getElementById('search').value = t; buscar(t);
    };
}

function buscar(q) {
    if(q.length < 3) return;
    fetch(`https://api.themoviedb.org/3/search/multi?api_key=${KEY}&query=${q}&language=es-ES`)
    .then(r => r.json()).then(d => {
        document.getElementById('catalog').innerHTML = `<div class="v-row">${d.results.filter(m=>m.poster_path).map(m => `
            <div class="card-vip" style="background-image:url('https://image.tmdb.org/t/p/w400${m.poster_path}')" onclick="verificar(${m.id}, '${m.media_type || (m.name?'tv':'movie')}')"></div>
        `).join('')}</div><button onclick="render()" class="m-6 text-cyan-400">VOLVER</button>`;
    });
}
