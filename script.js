const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const state = { xp: 120, sessions: 4, games: 2, streak: 3, duration: 15, roomTimer: null, seconds: 900, mic: false, camera: false, mediaStream: null, challengeDone: false };
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
  if(page!=="room" && document.body.classList.contains("room-mode")){closeRoom(false,false);}
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
  const displayName=($("#displayName")?.value||"H").trim()||"You";
  $("#participantGrid").innerHTML=`<div class="participant self">
    <div class="video-stage"><video id="localVideo" autoplay playsinline muted></video><div class="video-placeholder" id="localVideoPlaceholder"><div class="participant-avatar green-avatar">${displayName.charAt(0).toUpperCase()}</div><span>Kamera belum aktif</span></div><span class="media-live hidden" id="cameraLive">CAMERA ON</span></div>
    <b>You</b><small id="selfMediaStatus">Mic off · Camera off</small></div>`+
    others.map((n,i)=>`<div class="participant simulated"><div class="participant-avatar ${colors[i]}">${n[0]}</div><b>${n}</b><small>Demo participant</small><span class="demo-tag">SIMULASI</span></div>`).join("");
  $("#roomSetup").classList.add("hidden");$("#matchedRoom").classList.remove("hidden");document.body.classList.add("room-mode");renderRoomGame("guess");
  state.mic=false;state.camera=false;state.mediaStream=new MediaStream();
  updateMediaUI();
  startTimer();toast("Room demo siap. Aktifkan kamera atau mikrofon jika diperlukan.");
}
$("#findRoomBtn").addEventListener("click",()=>{const btn=$("#findRoomBtn");btn.disabled=true;btn.textContent="Mencari peserta...";setTimeout(()=>{btn.disabled=false;btn.innerHTML='Cari teman ngobrol <span>→</span>';matchRoom()},1100)});
function updateMediaUI(){
  const micTrack=state.mediaStream?.getAudioTracks().find(t=>t.readyState==="live");
  const cameraTrack=state.mediaStream?.getVideoTracks().find(t=>t.readyState==="live");
  state.mic=!!micTrack && micTrack.enabled;
  state.camera=!!cameraTrack && cameraTrack.enabled;
  const micBtn=$("#micBtn"), cameraBtn=$("#cameraBtn");
  if(micBtn) micBtn.innerHTML=state.mic?"🎙️ <span>Mic on</span>":"🔇 <span>Mic off</span>";
  if(cameraBtn) cameraBtn.innerHTML=state.camera?"📹 <span>Camera on</span>":"📷 <span>Camera off</span>";
  if($("#selfMediaStatus")) $("#selfMediaStatus").textContent=`Mic ${state.mic?"on":"off"} · Camera ${state.camera?"on":"off"}`;
  if($("#localVideoPlaceholder")) $("#localVideoPlaceholder").classList.toggle("hidden",state.camera);
  if($("#cameraLive")) $("#cameraLive").classList.toggle("hidden",!state.camera);
}
async function enableMedia(kind){
  if(!navigator.mediaDevices?.getUserMedia){
    toast("Browser tidak mendukung akses media. Gunakan HTTPS atau localhost.");
    return;
  }
  try{
    const constraints=kind==="video"?{video:{facingMode:"user",width:{ideal:1280},height:{ideal:720}}}:{audio:{echoCancellation:true,noiseSuppression:true}};
    const fresh=await navigator.mediaDevices.getUserMedia(constraints);
    fresh.getTracks().forEach(track=>state.mediaStream.addTrack(track));
    if(kind==="video"){
      const video=$("#localVideo");
      video.srcObject=state.mediaStream;
      await video.play().catch(()=>{});
    }
    updateMediaUI();
    toast(kind==="video"?"Kamera berhasil diaktifkan.":"Mikrofon berhasil diaktifkan.");
  }catch(error){
    let message="Tidak dapat mengakses perangkat.";
    if(error.name==="NotAllowedError"||error.name==="PermissionDeniedError") message="Izin ditolak. Izinkan kamera/mikrofon melalui pengaturan browser.";
    else if(error.name==="NotFoundError"||error.name==="DevicesNotFoundError") message=kind==="video"?"Kamera tidak ditemukan.":"Mikrofon tidak ditemukan.";
    else if(error.name==="NotReadableError") message="Perangkat sedang digunakan aplikasi lain.";
    else if(error.name==="OverconstrainedError") message="Perangkat tidak mendukung pengaturan media yang diminta.";
    toast(message);
  }
}
function toggleTrack(kind){
  const track=(kind==="video"?state.mediaStream?.getVideoTracks():state.mediaStream?.getAudioTracks())?.find(t=>t.readyState==="live");
  if(track){
    track.stop();
    state.mediaStream.removeTrack(track);
    if(kind==="video" && $("#localVideo")) $("#localVideo").srcObject=null;
    updateMediaUI();
    toast(kind==="video"?"Kamera dimatikan.":"Mikrofon dimatikan.");
  }else enableMedia(kind);
}
function stopAllMedia(){
  if(state.mediaStream) state.mediaStream.getTracks().forEach(track=>track.stop());
  state.mediaStream=new MediaStream();
  state.mic=false;state.camera=false;
}
function closeRoom(auto=false, award=true){
  clearInterval(state.roomTimer);stopAllMedia();document.body.classList.remove("room-mode");
  $("#matchedRoom").classList.add("hidden");$("#roomSetup").classList.remove("hidden");
  if(award){state.sessions++;state.xp+=25;updateStats();toast(auto?"Waktu habis! +25 XP untuk sesi yang selesai.":"Sesi selesai! Kamu mendapatkan +25 XP.");}
}
function finishRoom(auto=false){closeRoom(auto,true)}
$("#finishRoomBtn").addEventListener("click",()=>finishRoom(false));
$("#leaveRoomBtn").addEventListener("click",()=>closeRoom(false,false));
$("#micBtn").addEventListener("click",()=>toggleTrack("audio"));
$("#cameraBtn").addEventListener("click",()=>toggleTrack("video"));
window.addEventListener("beforeunload",stopAllMedia);

const roomGameData={
 guess:{label:"ROUND 01 · VOCABULARY",question:"“A place where you can borrow or read books.”",desc:"Discuss with your room members and choose the correct word.",options:["Restaurant","Library","Airport"],correct:"Library",feedback:"Correct! Now make a sentence using the word library."},
 would:{label:"ROUND 02 · CONVERSATION",question:"Would you rather travel to the beach or the mountains?",desc:"Choose one, then explain your reason to the group in English.",options:["🏖️ Beach","⛰️ Mountains"],correct:null,feedback:"Good choice! Tell your group why you chose it."},
 trivia:{label:"ROUND 03 · GRAMMAR",question:"Which sentence is grammatically correct?",desc:"Discuss your answer before selecting one.",options:["She go to school every day.","She goes to school every day.","She going to school every day."],correct:"She goes to school every day.",feedback:"That's right! Remember the -s for he, she, and it in simple present."},
 story:{label:"ROUND 04 · CREATIVITY",question:"“Yesterday, I found a mysterious box in front of my house...”",desc:"Continue the story with one or two sentences. Read your idea to the group.",options:[],correct:null,feedback:"Great imagination! Let another room member continue the story."}
};
function renderRoomGame(key){
 const g=roomGameData[key];
 $$(".room-game-tab").forEach(b=>b.classList.toggle("active",b.dataset.roomGame===key));
 const options=g.options.length?`<div class="room-game-options">${g.options.map(o=>`<button class="room-game-answer">${o}</button>`).join("")}</div>`:"";
 const story=key==="story"?`<textarea class="room-game-input" id="roomStoryInput" placeholder="Continue the story in English..."></textarea><button class="btn btn-primary room-game-submit" id="roomStorySubmit">Share with group →</button>`:"";
 $("#roomGameContent").innerHTML=`<div class="room-game-question"><span class="eyebrow green">${g.label}</span><h4>${g.question}</h4><p>${g.desc}</p></div>${options}${story}<div class="room-game-feedback" id="roomGameFeedback">Take turns and speak in English!</div>`;
 $$(".room-game-answer").forEach(btn=>btn.addEventListener("click",()=>{
  $$(".room-game-answer").forEach(x=>x.classList.remove("chosen"));btn.classList.add("chosen");
  const fb=$("#roomGameFeedback");
  if(g.correct){fb.textContent=btn.textContent===g.correct?"✓ "+g.feedback:"Not quite. Discuss with your group and try again.";}
  else fb.textContent="Nice choice! "+g.feedback;
 }));
 if(key==="story")$("#roomStorySubmit").addEventListener("click",()=>{if($("#roomStoryInput").value.trim().length<5){$("#roomGameFeedback").textContent="Write at least a short sentence before sharing.";return}$("#roomGameFeedback").textContent="✓ Your story contribution has been added to this demo round!";});
}
$$(".room-game-tab").forEach(b=>b.addEventListener("click",()=>renderRoomGame(b.dataset.roomGame)));


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
