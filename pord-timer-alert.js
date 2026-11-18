/* PORD-01 global timer: uses the existing pord01-focus-timer localStorage record. */
(function(){
'use strict';
var KEY='pord01-focus-timer', audio=null, alarmInterval=null, active=false;
var style=document.createElement('style');
style.textContent='#pord-global-timeup{position:fixed!important;inset:0!important;z-index:2147483647!important;display:none!important;flex-direction:column;align-items:center;justify-content:center;gap:24px;text-align:center;background:#760008;color:white;font-family:Arial,Helvetica,sans-serif;cursor:pointer;touch-action:manipulation;animation:pordPulse 1.1s ease-in-out infinite}#pord-global-timeup.pord-visible{display:flex!important}#pord-global-timeup strong{font-size:clamp(70px,13vw,180px);line-height:1;font-weight:900;letter-spacing:-.04em;text-shadow:0 6px 24px #33000088}#pord-global-timeup span{font-size:clamp(20px,3vw,38px);font-weight:700}@keyframes pordPulse{0%,100%{background:#650008}50%{background:#ff2029}}';
document.head.appendChild(style);
var overlay=document.createElement('div');overlay.id='pord-global-timeup';overlay.tabIndex=0;overlay.setAttribute('role','alertdialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','Timer finished');overlay.innerHTML='<strong>Time’s Up!</strong><span>Tap anywhere to dismiss</span>';
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){return null}}
function write(s){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}}
function unlock(){try{var C=window.AudioContext||window.webkitAudioContext;if(!audio&&C)audio=new C();if(audio&&audio.state==='suspended')audio.resume().catch(function(){})}catch(e){}}
function chime(){if(!active||!audio||audio.state!=='running')return;try{var t=audio.currentTime;[0,.18,.4].forEach(function(delay,i){var osc=audio.createOscillator(),gain=audio.createGain();osc.type='square';osc.frequency.setValueAtTime(i===1?660:880,t+delay);gain.gain.setValueAtTime(.0001,t+delay);gain.gain.linearRampToValueAtTime(.10,t+delay+.02);gain.gain.exponentialRampToValueAtTime(.0001,t+delay+.15);osc.connect(gain);gain.connect(audio.destination);osc.start(t+delay);osc.stop(t+delay+.16)})}catch(e){}}
function show(){if(active)return;active=true;overlay.classList.add('pord-visible');unlock();chime();alarmInterval=setInterval(chime,1600)}
function hide(){if(!active)return;active=false;overlay.classList.remove('pord-visible');if(alarmInterval){clearInterval(alarmInterval);alarmInterval=null}}
function dismiss(){var s=read();if(s){s.running=false;s.completed=false;s.remaining=Number(s.selected)||1500;s.endAt=0;write(s)}hide();document.dispatchEvent(new Event('pord-timer-dismissed'))}
overlay.addEventListener('click',dismiss);overlay.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();dismiss()}});
function check(){var s=read();if(!s){hide();return}if(s.running&&Number(s.endAt)>0&&Date.now()>=Number(s.endAt)){s.running=false;s.completed=true;s.remaining=0;write(s)}if(s.completed)show();else hide()}
function init(){document.body.appendChild(overlay);check();setInterval(check,300);document.addEventListener('visibilitychange',check);window.addEventListener('pageshow',check);window.addEventListener('storage',function(e){if(e.key===KEY)check()});document.addEventListener('pointerdown',unlock,{capture:true});document.addEventListener('keydown',unlock,{capture:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
