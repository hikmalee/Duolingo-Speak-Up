const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const state = { xp: 120, sessions: 4, games: 2, streak: 3, duration: 15, roomTimer: null, seconds: 900, mic: true, camera: false, challengeDone: false };
const topics = {
  "Daily Life": ["Let's talk about daily life!", "What is one thing that made you happy this week?"],
  "Campus Life": ["Let's talk about campus life!", "What is your favorite thing about being a student?"],
  "Food & Travel": ["Let's talk about food and travel!", "If you could visit one country, where would you go and why?"],
  "Movies & Music": ["Let's talk about movies and music!", "What movie or song would you recommend to a friend?"],
  "Future Dreams": ["Let's talk about future dreams!", "What is one goal you want to achieve in the next five years?"]
};
const names = ["Alex","Mia","Jordan","Sam","Taylor","Riley","Casey","Jamie"];
let toastTimer;
function toast(message){const el=$("#toast");el.textContent=message;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2600)}
function updateStats(){ $("#xpTop").textContent=state.xp+" XP";$("#homeXp").textContent=state.xp;$("#progressXp").textContent=state.xp;$("#homeSessions").textContent=state.sessions;$("#progressSessions").textContent=state.sessions;$("#progressGames").textContent=state.games;$("#streakTop").textContent=state.streak; }
function go(page){
  $$(".page").forEach(p=>p.classList.remove("active"));
  const target=$("#page-"+page); if(target) target.classList.add("active");
  $$(".nav-link").forEach(b=>b.classList.toggle("active",b.dataset.page===page));
  const labels={home:"Beranda",room:"Discussion Room",games:"SpeakUp Games",challenge:"Speaking Challenge",progress:"Progress & Rewards",profile:"Profil & Pengaturan"};
  $("#currentSection").textContent=labels[page]||"Beranda";
  $("#sidebar").classList.remove("open");
  window.scrollTo({top:0,behavior:"smooth"});
}
$$("[data-page]").forEach(b=>b.addEventListener("click",()=>go(b.dataset.page)));
$$("[data-go]").forEach(b=>b.addEventListener("click",()=>go(b.dataset.go)));
$("#mobileMenu").addEventListener("click",()=>$("#sidebar").classList.toggle("open"));
$("#todayDate").textContent=new Intl.DateTimeFormat("id-ID",{weekday:"long",day:"numeric",month:"long"}).format(new Date());
$$(".duration").forEach(b=>b.addEventListener("click",()=>{$$(".duration").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");state.duration=Number(b.dataset.min)}));

function startTimer(){
  clearInterval(state.roomTimer);state.seconds=state.duration*60;renderTimer();
  state.roomTimer=setInterval(()=>{state.seconds--;renderTimer();if(state.seconds<=0){clearInterval(state.roomTimer);finishRoom(true)}},1000);
}
function renderTimer(){const m=Math.floor(state.seconds/60).toString().padStart(2,"0"),s=(state.seconds%60).toString().padStart(2,"0");$("#roomTimer").textContent=`${m}:${s}`}
function matchRoom(){
  const topic=$("#topicSelect").value, prompt=topics[topic];
  $("#roomTopicTitle").textContent=prompt[0];$("#roomPrompt").textContent=prompt[1];
  $("#roomMeta").textContent=`${topic} · ${state.duration} minutes · 4 participants`;
  const others=[...names].sort(()=>Math.random()-.5).slice(0,3);
  const colors=["purple-avatar","orange-avatar","blue-avatar"];
  $("#participantGrid").innerHTML=`<div class="participant self"><div class="participant-avatar green-avatar">${($("#displayName")?.value||"H").charAt(0).toUpperCase()}</div><b>You</b><small>Ready to speak</small></div>`+others.map((n,i)=>`<div class="participant"><div class="participant-avatar ${colors[i]}">${n[0]}</div><b>${n}</b><small>English learner</small></div>`).join("");
  $("#roomSetup").classList.add("hidden");$("#matchedRoom").classList.remove("hidden");
  state.mic=true;state.camera=false;$("#micBtn").innerHTML="🎙️ <span>Mic on</span>";$("#cameraBtn").innerHTML="📷 <span>Camera off</span>";
  startTimer();toast("Room berhasil ditemukan! Let's speak English.");
}
$("#findRoomBtn").addEventListener("click",()=>{const btn=$("#findRoomBtn");btn.disabled=true;btn.textContent="Mencari peserta...";setTimeout(()=>{btn.disabled=false;btn.innerHTML='Cari teman ngobrol <span>→</span>';matchRoom()},1100)});
function finishRoom(auto=false){clearInterval(state.roomTimer);$("#matchedRoom").classList.add("hidden");$("#roomSetup").classList.remove("hidden");if(!auto){state.sessions++;state.xp+=25;updateStats();toast("Sesi selesai! Kamu mendapatkan +25 XP.");}else{state.sessions++;state.xp+=25;updateStats();toast("Waktu habis! +25 XP untuk sesi yang selesai.");}}
$("#finishRoomBtn").addEventListener("click",()=>finishRoom(false));
$("#leaveRoomBtn").addEventListener("click",()=>{clearInterval(state.roomTimer);$("#matchedRoom").classList.add("hidden");$("#roomSetup").classList.remove("hidden");toast("Kamu keluar dari room.")});
$("#micBtn").addEventListener("click",()=>{state.mic=!state.mic;$("#micBtn").innerHTML=state.mic?"🎙️ <span>Mic on</span>":"🔇 <span>Mic off</span>";toast(state.mic?"Microphone dinyalakan (simulasi).":"Microphone dimatikan (simulasi).")});
$("#cameraBtn").addEventListener("click",()=>{state.camera=!state.camera;$("#cameraBtn").innerHTML=state.camera?"📹 <span>Camera on</span>":"📷 <span>Camera off</span>";toast(state.camera?"Camera dinyalakan (simulasi).":"Camera dimatikan (simulasi).")});

const gameData={
 guess:{title:"Guess the Word",html:`<div class="game-question"><span class="eyebrow green">GUESS THE WORD</span><h3>“A place where you can borrow or read books.”</h3><p>Choose the correct word.</p></div><div class="answer-list"><button class="answer-option" data-answer="A">A. Restaurant</button><button class="answer-option" data-answer="B">B. Library</button><button class="answer-option" data-answer="C">C. Airport</button></div><div class="feedback" id="gameFeedback"></div>`},
 would:{title:"Would You Rather",html:`<div class="game-question"><span class="eyebrow green">CHOOSE ONE</span><h3>Would you rather travel to the beach or the mountains?</h3><p>Choose one option, then explain your reason in English.</p></div><div class="answer-list"><button class="answer-option" data-answer="Beach">🏖️ Travel to the beach</button><button class="answer-option" data-answer="Mountains">⛰️ Travel to the mountains</button></div><div class="feedback" id="gameFeedback"></div>`},
 trivia:{title:"English Trivia",html:`<div class="game-question"><span class="eyebrow green">ENGLISH TRIVIA</span><h3>Which sentence is grammatically correct?</h3><p>Select the best answer.</p></div><div class="answer-list"><button class="answer-option" data-answer="A">A. She go to school every day.</button><button class="answer-option" data-answer="B">B. She goes to school every day.</button><button class="answer-option" data-answer="C">C. She going to school every day.</button></div><div class="feedback" id="gameFeedback"></div>`},
 story:{title:"Continue the Story",html:`<div class="game-question"><span class="eyebrow green">CONTINUE THE STORY</span><h3>“Yesterday, I found a mysterious box in front of my house...”</h3><p>Continue the story with 1–3 sentences in English.</p></div><textarea id="storyAnswer" placeholder="Write your next sentences here..."></textarea><button class="btn btn-primary" id="submitStory">Submit story</button><div class="feedback" id="gameFeedback"></div>`}
};
$$(".game-launch").forEach(b=>b.addEventListener("click",()=>openGame(b.closest(".game-tile").dataset.game)));
function openGame(key){const game=gameData[key];$("#gameTitle").textContent=game.title;$("#gameContent").innerHTML=game.html;$("#gamePlay").classList.remove("hidden");$("#gamePlay").scrollIntoView({behavior:"smooth",block:"center"});
  if(key==="story"){$("#submitStory").addEventListener("click",()=>{const val=$("#storyAnswer").value.trim();if(val.length<8){$("#gameFeedback").textContent="Write a little more to continue your story.";return}completeGame("Nice story! You completed the activity.");});}
  else $$(".answer-option",$("#gameContent")).forEach(btn=>btn.addEventListener("click",()=>{if(key==="guess"||key==="trivia"){const correct=(key==="guess"&&btn.dataset.answer==="B")||(key==="trivia"&&btn.dataset.answer==="B");if(correct)completeGame("Correct answer! Well done.");else $("#gameFeedback").textContent="Not quite. Try another answer!";}else{$$("#gameContent .answer-option").forEach(x=>x.style.borderColor="");btn.style.borderColor="#76c943";$("#gameFeedback").textContent="Great choice! Now explain your reason in English.";if(!btn.dataset.completed){btn.dataset.completed="1";state.xp+=5;state.games++;updateStats();toast("+5 XP — explain your choice out loud!");}}}));
}
function completeGame(message){$("#gameFeedback").textContent=message;state.xp+=10;state.games++;updateStats();$$(".answer-option",$("#gameContent")).forEach(b=>b.disabled=true);toast("+10 XP — game completed!")}
$("#closeGame").addEventListener("click",()=>$("#gamePlay").classList.add("hidden"));

function openChallenge(title){$("#challengeTitle").textContent=title;$("#challengeInstruction").textContent=`Speak for 1–2 minutes about “${title}”. Don't worry about mistakes!`;$("#challengeWork").classList.remove("hidden");$("#challengeWork").scrollIntoView({behavior:"smooth",block:"center"})}
$("#startChallenge").addEventListener("click",()=>openChallenge("Introduce yourself!"));
$$("[data-prompt]").forEach(b=>b.addEventListener("click",()=>openChallenge(b.dataset.prompt)));
$("#closeChallenge").addEventListener("click",()=>$("#challengeWork").classList.add("hidden"));
$("#completeChallenge").addEventListener("click",()=>{if(state.challengeDone){toast("Daily challenge sudah diselesaikan.");return}state.challengeDone=true;state.xp+=20;updateStats();$("#challengeWork").classList.add("hidden");toast("Challenge completed! +20 XP. Great job!")});
$("#saveProfile").addEventListener("click",()=>{const name=$("#displayName").value.trim();if(!name){toast("Nama tampilan tidak boleh kosong.");return}$(".profile-header h2").textContent=name;$(".avatar").textContent=name[0].toUpperCase();toast("Pengaturan profil disimpan di tampilan demo.")});
updateStats();
