// Project: Apology Card
// Author: saklin_01

// Apply optional custom text from #s= (compressed) or legacy #sorry= links.
(async function applyCustomText() {
  try {
    let data;
    const shortMatch = location.hash.match(/(?:^#|&)s=([A-Za-z0-9_-]+)/);
    const oldMatch = location.hash.match(/(?:^#|&)sorry=([A-Za-z0-9_-]+)/);
    if (shortMatch) {
      const token = shortMatch[1];
      const binary = atob(token.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4-token.length%4)%4));
      const bytes = Uint8Array.from(binary, ch => ch.charCodeAt(0));
      if (token.startsWith('z')) {
        if (!('DecompressionStream' in window)) throw new Error('This browser cannot decompress this link. Try Chrome.');
        const stream = new Blob([bytes.slice(1)]).stream().pipeThrough(new DecompressionStream('gzip'));
        data = JSON.parse(new TextDecoder().decode(await new Response(stream).arrayBuffer()));
      } else if (token.startsWith('j')) {
        data = JSON.parse(new TextDecoder().decode(bytes.slice(1)));
      } else {
        data = JSON.parse(new TextDecoder().decode(bytes));
      }
    } else if (oldMatch) {
      const token = oldMatch[1].replace(/-/g, '+').replace(/_/g, '/');
      const binary = atob(token + '='.repeat((4-token.length%4)%4));
      data = JSON.parse(new TextDecoder().decode(Uint8Array.from(binary, ch => ch.charCodeAt(0))));
    } else return;
    const setText = (selector, value) => { const el=document.querySelector(selector); if(el && typeof value==='string') el.textContent=value; };
    const map = {
      '.title-screen-1':'title1','.sub-screen-1':'body1','#btn-no':'btn1a','#btn-yes':'btn1b',
      '.title-screen-2':'title2','.sub-screen-2':'body2','#btn-forgive-final':'btn2a','#btn-idk':'btn2b',
      '.title-screen-sad':'sadTitle','.sub-screen-sad':'sadBody','#btn-sad-forgive':'sadA','#btn-sad-mad':'sadB',
      '.title-screen-super-sad':'superTitle','.sub-screen-super-sad':'superBody','#btn-super-forgive':'superA','#btn-super-mad':'superB',
      '.title-screen-3':'finalTitle','.sub-screen-3':'finalBody','#btn-infinite-love':'finalBtn'
    };
    Object.entries(map).forEach(([selector,key])=>{if(typeof data[key]==='string')setText(selector,data[key].slice(0,800));});
  } catch(error) { console.warn('Custom sorry link could not be read.',error); }
})();

// Screen Elements
const screen1 = document.getElementById('screen-1');
const screen2 = document.getElementById('screen-2');
const screen3 = document.getElementById('screen-3');
const screenSad = document.getElementById('screen-sad');
const screenSuperSad = document.getElementById('screen-super-sad');

const decor1 = document.getElementById('decor-screen-1');
const decor2 = document.getElementById('decor-screen-2');
const decor3 = document.getElementById('decor-screen-3');
const decorSad = document.getElementById('decor-screen-sad');
const decorSuperSad = document.getElementById('decor-screen-super-sad');

const btnYes = document.getElementById('btn-yes');
const btnNo = document.getElementById('btn-no');
const btnIdk = document.getElementById('btn-idk');
const btnForgiveFinal = document.getElementById('btn-forgive-final');
const btnSadForgive = document.getElementById('btn-sad-forgive');
const btnSadMad = document.getElementById('btn-sad-mad');
const btnSuperForgive = document.getElementById('btn-super-forgive');
const btnSuperMad = document.getElementById('btn-super-mad');
const btnInfiniteLove = document.getElementById('btn-infinite-love');
const loveRainContainer = document.getElementById('love-rain');

btnNo.addEventListener('click', () => {
  decor1.classList.add('hidden'); decor2.classList.remove('hidden');
  document.body.classList.remove('screen-3-mode', 'screen-sad-mode', 'screen-super-sad-mode');
  document.body.classList.add('screen-2-mode');
  screen1.classList.remove('active'); screen1.classList.add('hidden');
  screen2.classList.remove('hidden'); screen2.classList.add('active');
});
btnYes.addEventListener('click', () => {
  decor1.classList.add('hidden'); decorSad.classList.remove('hidden');
  document.body.classList.remove('screen-2-mode', 'screen-3-mode', 'screen-super-sad-mode');
  document.body.classList.add('screen-sad-mode');
  screen1.classList.remove('active'); screen1.classList.add('hidden');
  screenSad.classList.remove('hidden'); screenSad.classList.add('active');
});
btnIdk.addEventListener('click', () => {
  decor2.classList.add('hidden'); decor1.classList.remove('hidden');
  document.body.classList.remove('screen-2-mode');
  screen2.classList.remove('active'); screen2.classList.add('hidden');
  screen1.classList.remove('hidden'); screen1.classList.add('active');
});
btnForgiveFinal.addEventListener('click', () => {
  decor2.classList.add('hidden'); decor3.classList.remove('hidden');
  document.body.classList.remove('screen-2-mode'); document.body.classList.add('screen-3-mode');
  screen2.classList.remove('active'); screen2.classList.add('hidden');
  screen3.classList.remove('hidden'); screen3.classList.add('active');
});
btnSadForgive.addEventListener('click', () => {
  decorSad.classList.add('hidden'); decor3.classList.remove('hidden');
  document.body.classList.remove('screen-sad-mode'); document.body.classList.add('screen-3-mode');
  screenSad.classList.remove('active'); screenSad.classList.add('hidden');
  screen3.classList.remove('hidden'); screen3.classList.add('active');
});
btnSadMad.addEventListener('click', () => {
  decorSad.classList.add('hidden'); decorSuperSad.classList.remove('hidden');
  document.body.classList.remove('screen-sad-mode'); document.body.classList.add('screen-super-sad-mode');
  screenSad.classList.remove('active'); screenSad.classList.add('hidden');
  screenSuperSad.classList.remove('hidden'); screenSuperSad.classList.add('active');
});

const phrasesSuper = [
  "Look at my tears! 🌊😭", "I'll do all your chores! 🧹🥺",
  "Free snacks & ice cream! 🍦💖", "I'm on my knees! 🙇‍♂️💔",
  "Have mercy please! 🥺", "Say yes please! 😭❤️"
];
let countSuper = 0;
function dodgeSuperMad() {
  countSuper++;
  btnSuperMad.textContent = phrasesSuper[countSuper % phrasesSuper.length];
  const x = (Math.random() - 0.5) * 170, y = (Math.random() - 0.5) * 130;
  btnSuperMad.style.transform = `translate(${x}px, ${y}px)`;
  btnSuperForgive.style.transform = `scale(${Math.min(1.4, 1 + countSuper * 0.08)})`;
}
btnSuperMad.addEventListener('mouseenter', dodgeSuperMad);
btnSuperMad.addEventListener('click', dodgeSuperMad);
btnSuperMad.addEventListener('touchstart', e => { e.preventDefault(); dodgeSuperMad(); });
const loveWords = ["i love you ❤️","love you ∞","forever yours 💖","ilysm 💕","i love you so much 🥰","my whole world 🌎✨","always & forever 💖","love you unconditionally 🥺❤️","never letting you go 💕","you & me forever ∞","i love you 💖","cutie pie 🥰","my heart is yours ❤️"];
const loveColors = ["#e63963","#c9184a","#ff758f","#f4a261","#d62828","#ff4d6d"];
function triggerLoveRain() {
  if (!loveRainContainer) return;
  for (let i = 0; i < 42; i++) setTimeout(() => {
    const drop = document.createElement('span');
    drop.className = 'love-drop';
    drop.textContent = loveWords[Math.floor(Math.random() * loveWords.length)];
    const x = Math.random() * 92 + 4, dur = (2.2 + Math.random() * 2.2).toFixed(2);
    const delay = (Math.random() * 0.8).toFixed(2), rot = (Math.random() * 30 - 15).toFixed(1);
    drop.style.setProperty('--x', `${x}%`); drop.style.setProperty('--dur', `${dur}s`);
    drop.style.setProperty('--delay', `${delay}s`); drop.style.setProperty('--rot', `${rot}deg`);
    drop.style.setProperty('--sz', (0.78 + Math.random() * 0.32).toFixed(2) + 'rem');
    drop.style.setProperty('--col', loveColors[Math.floor(Math.random() * loveColors.length)]);
    loveRainContainer.appendChild(drop);
    setTimeout(() => drop.remove(), (parseFloat(dur) + parseFloat(delay) + 0.4) * 1000);
  }, i * 40);
}
if (btnInfiniteLove) {
  btnInfiniteLove.addEventListener('click', triggerLoveRain);
  btnInfiniteLove.addEventListener('touchstart', e => { e.preventDefault(); triggerLoveRain(); });
}
