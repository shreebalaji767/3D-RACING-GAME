/* Neon Highway Complete: local gameplay recording and replay. */
const difficultySelect=document.getElementById("difficultySelect");
const paintSelect=document.getElementById("paintSelect");
const savedPaint=localStorage.getItem("neonHighwayPaint")||"#087cff";
paintSelect.value=savedPaint;
paintSelect.addEventListener("change",()=>{
 localStorage.setItem("neonHighwayPaint",paintSelect.value);
 document.dispatchEvent(new CustomEvent("neon:paint-change",{detail:{color:paintSelect.value}}));
});
const recordButton=document.getElementById("recordGameplay");
const stopRecordButton=document.getElementById("stopRecording");
const previewVideo=document.getElementById("gameplayPreview");
const downloadReplay=document.getElementById("downloadReplay");
const recordStatus=document.getElementById("recordStatus");
let recorder=null, recordingChunks=[], recordingStartedAt=0, replayUrl=null;
const savedDifficulty=localStorage.getItem("neonHighwayDifficulty")||"normal";
difficultySelect.value=["easy","normal","hard","expert","legend"].includes(savedDifficulty)?savedDifficulty:"normal";
difficultySelect.addEventListener("change",()=>{
 localStorage.setItem("neonHighwayDifficulty",difficultySelect.value);
 recordStatus.textContent="Difficulty saved: "+difficultySelect.options[difficultySelect.selectedIndex].text+".";
});
function supportedMime(){if(!window.MediaRecorder)return "";return ["video/webm;codecs=vp9","video/webm;codecs=vp8","video/webm"].find(t=>MediaRecorder.isTypeSupported(t))||"";}
function startRecording(){
 const canvas=document.querySelector("#canvasContainer canvas");
 if(!canvas||!canvas.captureStream||!window.MediaRecorder){recordStatus.textContent="Recording is not supported here. Try a recent desktop Chrome or Edge.";return;}
 const mimeType=supportedMime();if(!mimeType){recordStatus.textContent="This browser does not support WebM recording.";return;}
 try{
  const stream=canvas.captureStream(30);recorder=new MediaRecorder(stream,{mimeType});recordingChunks=[];
  recorder.addEventListener("dataavailable",e=>{if(e.data&&e.data.size)recordingChunks.push(e.data);});
  recorder.addEventListener("stop",()=>{
   stream.getTracks().forEach(t=>t.stop());
   if(!recordingChunks.length){recordStatus.textContent="No frames captured. Try again.";return;}
   const blob=new Blob(recordingChunks,{type:mimeType});if(replayUrl)URL.revokeObjectURL(replayUrl);
   replayUrl=URL.createObjectURL(blob);previewVideo.src=replayUrl;previewVideo.classList.remove("hidden");downloadReplay.href=replayUrl;downloadReplay.classList.remove("hidden");previewVideo.load();
   recordButton.textContent="● RECORD ANOTHER RUN";
   recordStatus.textContent="Replay ready · "+Math.max(1,Math.round((Date.now()-recordingStartedAt)/1000))+" seconds · local WebM clip";
   stopRecordButton.classList.add("hidden");stopRecordButton.classList.remove("recording");
  });
  recordingStartedAt=Date.now();recorder.start(250);stopRecordButton.classList.remove("hidden");stopRecordButton.classList.add("recording");
  recordButton.textContent="● RECORDING…";recordStatus.textContent="Recording the live game canvas. Save the clip to replay it here.";
 }catch(e){recordStatus.textContent="Could not start recording on this device.";stopRecordButton.classList.add("hidden");}
}
function stopRecording(){if(recorder&&recorder.state!=="inactive")recorder.stop();}
recordButton.addEventListener("click",()=>{if(recorder&&recorder.state!=="inactive"){stopRecording();return;}document.getElementById("start").click();startRecording();});
stopRecordButton.addEventListener("click",stopRecording);
document.addEventListener("neon:run-ended",stopRecording);
document.addEventListener("neon:menu-opened",stopRecording);
window.addEventListener("beforeunload",()=>{if(replayUrl)URL.revokeObjectURL(replayUrl);});
