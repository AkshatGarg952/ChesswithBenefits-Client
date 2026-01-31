//src/hooks/useWebRTC.js
import{useState,useEffect,useRef,useCallback}from'react';
import{toast}from'react-toastify';

//ICEserverconfigurationforSTUN
constICE_SERVERS={
iceServers:[
{urls:'stun:stun.l.google.com:19302'},
{urls:'stun:stun1.l.google.com:19302'},
{urls:'stun:stun2.l.google.com:19302'},
],
};

//Mediaconstraintsforvideoandaudio
constMEDIA_CONSTRAINTS={
video:{
width:{ideal:640,max:1280},
height:{ideal:480,max:720},
frameRate:{ideal:30,max:30}
},
audio:{
echoCancellation:true,
noiseSuppression:true,
autoGainControl:true
},
};

exportconstuseWebRTC=({socket,opponentSocketId,isCurrentUser})=>{
//Statemanagement
const[connectionState,setConnectionState]=useState('idle');
const[mediaError,setMediaError]=useState(null);
const[isMicEnabled,setMicEnabled]=useState(true);
const[isVideoEnabled,setVideoEnabled]=useState(true);
const[shouldInitiateCall,setShouldInitiateCall]=useState(false);

//RefsforWebRTCcomponents
constpeerConnectionRef=useRef(null);
constlocalStreamRef=useRef(null);
constremoteStreamRef=useRef(null);
constpendingCandidatesRef=useRef([]);
constpendingAnswersRef=useRef([]);//Forqueuinganswersifneeded
consthasInitializedRef=useRef(false);
constisInitializingRef=useRef(false);
constcallStateRef=useRef('idle');
constmyRoleRef=useRef(null);//'caller'or'receiver'
constisProcessingOfferRef=useRef(false);
constisProcessingAnswerRef=useRef(false);

//Debugfunctiontologpeerconnectiondetails
constdebugPeerConnection=useCallback(()=>{
constpc=peerConnectionRef.current;
if(pc){
console.log(`PCDebugInfo:`,{
signalingState:pc.signalingState,
connectionState:pc.connectionState,
iceConnectionState:pc.iceConnectionState,
iceGatheringState:pc.iceGatheringState,
localDescription:pc.localDescription?.type,
remoteDescription:pc.remoteDescription?.type,
callState:callStateRef.current,
role:myRoleRef.current,
createdAt:pc._createdAt,
currentTime:Date.now(),
isCurrentUser
});
}else{
console.log(`Nopeerconnectionexists(${isCurrentUser?'CurrentUser':'Opponent'})`);
}
},[isCurrentUser]);

//Cleanupfunctiontoreseteverything
constcleanup=useCallback(()=>{
console.log(`CleaningupWebRTCresources...(${isCurrentUser?'CurrentUser':'Opponent'})`);

if(peerConnectionRef.current){
peerConnectionRef.current.onicecandidate=null;
peerConnectionRef.current.ontrack=null;
peerConnectionRef.current.onconnectionstatechange=null;
peerConnectionRef.current.onnegotiationneeded=null;
peerConnectionRef.current.onsignalingstatechange=null;
peerConnectionRef.current.close();
peerConnectionRef.current=null;
}

if(localStreamRef.current){
localStreamRef.current.getTracks().forEach(track=>track.stop());
localStreamRef.current=null;
}

remoteStreamRef.current=null;
pendingCandidatesRef.current=[];
pendingAnswersRef.current=[];
hasInitializedRef.current=false;
isInitializingRef.current=false;
callStateRef.current='idle';
myRoleRef.current=null;
isProcessingOfferRef.current=false;
isProcessingAnswerRef.current=false;
setShouldInitiateCall(false);

setConnectionState('idle');
setMediaError(null);
},[isCurrentUser]);

//Getusermedia(cameraandmic)
constinitializeMedia=useCallback(async()=>{
if(localStreamRef.current)returntrue;

try{
console.log(`Requestingusermedia...(${isCurrentUser?'CurrentUser':'Opponent'})`);
setConnectionState('requesting-media');

conststream=awaitnavigator.mediaDevices.getUserMedia(MEDIA_CONSTRAINTS);
localStreamRef.current=stream;

stream.getVideoTracks().forEach(track=>{
track.enabled=isVideoEnabled;
});
stream.getAudioTracks().forEach(track=>{
track.enabled=isMicEnabled;
});

setMediaError(null);
console.log(`Usermediaobtainedsuccessfully(${isCurrentUser?'CurrentUser':'Opponent'})`);
returntrue;
}catch(err){
console.error(`Failedtogetusermedia(${isCurrentUser?'CurrentUser':'Opponent'}):`,err);
leterrorMessage='Couldnotaccesscamera/microphone';

switch(err.name){
case'NotAllowedError':
errorMessage='Camera/microphoneaccessdenied';
break;
case'NotFoundError':
errorMessage='Nocamera/microphonefound';
break;
case'NotReadableError':
errorMessage='Camera/microphoneisbeingusedbyanotherapplication';
break;
}

setMediaError(errorMessage);
toast.error(errorMessage);
returnfalse;
}
},[isVideoEnabled,isMicEnabled,isCurrentUser]);

//Createpeerconnectionwithsafeguards
constcreatePeerConnection=useCallback((role)=>{
if(peerConnectionRef.current&&peerConnectionRef.current.signalingState!=='closed'){
console.log(`Peerconnectionalreadyexistsandnotclosed,reusingexistingone(${isCurrentUser?'CurrentUser':'Opponent'})`);
returnpeerConnectionRef.current;
}

console.log(`Creatingnewpeerconnectionas${role}...(${isCurrentUser?'CurrentUser':'Opponent'})`);
constpc=newRTCPeerConnection(ICE_SERVERS);
peerConnectionRef.current=pc;
myRoleRef.current=role;

pc._createdAt=Date.now();
pc._role=role;

if(localStreamRef.current){
localStreamRef.current.getTracks().forEach(track=>{
console.log(`Addinglocaltrack:${track.kind}(${isCurrentUser?'CurrentUser':'Opponent'})`);
pc.addTrack(track,localStreamRef.current);
});
}

pc.onicecandidate=(event)=>{
if(event.candidate&&opponentSocketId){
console.log(`SendingICEcandidate(${role})(${isCurrentUser?'CurrentUser':'Opponent'})`);
socket.emit('ice-candidate',{
targetSocketId:opponentSocketId,
candidate:event.candidate,
});
}
};

pc.ontrack=(event)=>{
console.log(`Receivedremotetrack:${event.track.kind}(${role})(${isCurrentUser?'CurrentUser':'Opponent'})`);
const[remoteStream]=event.streams;

if(remoteStream&&remoteStream.getTracks().length>0){
remoteStreamRef.current=remoteStream;
setConnectionState('connected');
console.log(`Remotestreamsetwith${remoteStream.getTracks().length}tracks(${role})(${isCurrentUser?'CurrentUser':'Opponent'})`);
}
};

pc.onconnectionstatechange=()=>{
conststate=pc.connectionState;
console.log(`Connectionstatechanged:${state}(${role})(${isCurrentUser?'CurrentUser':'Opponent'})`);
setConnectionState(state);

switch(state){
case'connected':
toast.success('Videocallconnected!');
callStateRef.current='connected';
break;
case'disconnected':
toast.warn('Connectionlost');
break;
case'failed':
toast.error('Connectionfailed');
callStateRef.current='failed';
break;
}
};

pc.onsignalingstatechange=()=>{
console.log(`Signalingstatechanged:${pc.signalingState}(${role})(${isCurrentUser?'CurrentUser':'Opponent'})`);
};

returnpc;
},[socket,opponentSocketId,isCurrentUser]);

//Initiatecallasthecaller
constinitiateCall=useCallback(async()=>{
if(!shouldInitiateCall||callStateRef.current!=='ready'){
console.log(`Notsupposedtoinitiatecallornotready.State:${callStateRef.current}(${isCurrentUser?'CurrentUser':'Opponent'})`);
return;
}

if(isProcessingOfferRef.current){
console.log(`Alreadyprocessingoffer,skipping...(${isCurrentUser?'CurrentUser':'Opponent'})`);
return;
}

isProcessingOfferRef.current=true;

constpc=createPeerConnection('caller');
if(!pc||!opponentSocketId){
console.log(`Missingrequirementsforcallinitiation(${isCurrentUser?'CurrentUser':'Opponent'})`);
isProcessingOfferRef.current=false;
return;
}

try{
console.log(`Creatingoffer...(caller)(${isCurrentUser?'CurrentUser':'Opponent'})`);
setConnectionState('connecting');
callStateRef.current='calling';

constoffer=awaitpc.createOffer();
awaitpc.setLocalDescription(offer);

console.log(`Sendingoffer.Signalingstate:${pc.signalingState}(caller)(${isCurrentUser?'CurrentUser':'Opponent'})`);

socket.emit('call-user',{
targetSocketId:opponentSocketId,
offer:pc.localDescription,
});

console.log(`Offersent(caller)(${isCurrentUser?'CurrentUser':'Opponent'})`);
}catch(error){
console.error(`Failedtocreateoffer(caller)(${isCurrentUser?'CurrentUser':'Opponent'}):`,error);
toast.error('Failedtoinitiatecall');
callStateRef.current='failed';
}finally{
isProcessingOfferRef.current=false;
}
},[socket,opponentSocketId,shouldInitiateCall,isCurrentUser,createPeerConnection]);

//ListenforopponentJoinedevent
useEffect(()=>{
consthandleOpponentJoined=(data)=>{
console.log(`Opponentjoinedeventreceived(${isCurrentUser?'CurrentUser':'Opponent'}):`,data);

if(isCurrentUser){
setShouldInitiateCall(data.shouldInitiateCall||false);
}
};

socket.on('opponentJoined',handleOpponentJoined);

return()=>{
socket.off('opponentJoined',handleOpponentJoined);
};
},[socket,isCurrentUser]);

//InitializeWebRTCwhenopponentisavailable
useEffect(()=>{
if(!opponentSocketId||hasInitializedRef.current||isInitializingRef.current)return;

constinitializeConnection=async()=>{
console.log(`InitializingWebRTCconnection...(${isCurrentUser?'CurrentUser':'Opponent'})`);
isInitializingRef.current=true;
hasInitializedRef.current=true;

constmediaSuccess=awaitinitializeMedia();
if(!mediaSuccess){
isInitializingRef.current=false;
return;
}

callStateRef.current='ready';
setConnectionState('ready');

if(shouldInitiateCall&&isCurrentUser){
myRoleRef.current='caller';
console.log(`Willinitiatecallin2secondsascaller...(CurrentUser)`);
setTimeout(()=>{
initiateCall();
isInitializingRef.current=false;
},2000);
}else{
console.log(`Waitingforincomingcall...(${isCurrentUser?'CurrentUser':'Opponent'})`);
callStateRef.current='waiting';
isInitializingRef.current=false;
}
};

initializeConnection();
},[opponentSocketId,shouldInitiateCall,initializeMedia,initiateCall,isCurrentUser]);

//Handleopponentdisconnection
useEffect(()=>{
if(!opponentSocketId&&hasInitializedRef.current){
console.log(`Opponentdisconnected,cleaningup...(${isCurrentUser?'CurrentUser':'Opponent'})`);
cleanup();
}
},[opponentSocketId,cleanup,isCurrentUser]);

//Socketeventhandlers
useEffect(()=>{
consthandleIncomingCall=async({from,offer})=>{
if(from!==opponentSocketId)return;

console.log(`INCOMINGCALLfrom:${from}.Myrole:${myRoleRef.current}.Callstate:${callStateRef.current}(${isCurrentUser?'CurrentUser':'Opponent'})`);

if(callStateRef.current!=='waiting'&&callStateRef.current!=='ready'){
console.log(`Notincorrectstatetoreceivecall:${callStateRef.current}(${isCurrentUser?'CurrentUser':'Opponent'})`);
return;
}

if(peerConnectionRef.current){
console.log(`Alreadyhavepeerconnection,ignoringincomingcall(${isCurrentUser?'CurrentUser':'Opponent'})`);
return;
}

try{
constpc=createPeerConnection('receiver');
if(!pc){
console.error(`Failedtocreatepeerconnectionforincomingcall(${isCurrentUser?'CurrentUser':'Opponent'})`);
return;
}

console.log(`Createdpeerconnectionforincomingcall.Signalingstate:${pc.signalingState}(receiver)(${isCurrentUser?'CurrentUser':'Opponent'})`);

callStateRef.current='answering';

awaitpc.setRemoteDescription(newRTCSessionDescription(offer));
console.log(`Remotedescriptionset.Newsignalingstate:${pc.signalingState}(receiver)(${isCurrentUser?'CurrentUser':'Opponent'})`);

while(pendingCandidatesRef.current.length>0){
constcandidate=pendingCandidatesRef.current.shift();
try{
awaitpc.addIceCandidate(newRTCIceCandidate(candidate));
console.log(`AddedqueuedICEcandidate(receiver)(${isCurrentUser?'CurrentUser':'Opponent'})`);
}catch(err){
console.warn(`FailedtoaddqueuedICEcandidate(receiver)(${isCurrentUser?'CurrentUser':'Opponent'}):`,err);
}
}

constanswer=awaitpc.createAnswer();
awaitpc.setLocalDescription(answer);

console.log(`Sendinganswer.Signalingstate:${pc.signalingState}(receiver)(${isCurrentUser?'CurrentUser':'Opponent'})`);

socket.emit('answer-call',{
targetSocketId:from,
answer:pc.localDescription,
});

console.log(`Answersent(receiver)(${isCurrentUser?'CurrentUser':'Opponent'})`);
setConnectionState('connecting');
}catch(err){
console.error(`Failedtohandleincomingcall(receiver)(${isCurrentUser?'CurrentUser':'Opponent'}):`,err);
toast.error('Failedtoanswercall');
callStateRef.current='failed';
}
};

consthandleCallAnswered=async({from,answer})=>{
if(from!==opponentSocketId)return;

console.log(`CALLANSWEREDby:${from}.Myrole:${myRoleRef.current}.Callstate:${callStateRef.current}(${isCurrentUser?'CurrentUser':'Opponent'})`);

debugPeerConnection();

if(myRoleRef.current!=='caller'){
console.log(`ReceivedanswerbutI'mnotthecaller(I'm${myRoleRef.current}).Ignoring.(${isCurrentUser?'CurrentUser':'Opponent'})`);
return;
}

if(isProcessingAnswerRef.current){
console.log(`Alreadyprocessinganswer,ignoring...(${isCurrentUser?'CurrentUser':'Opponent'})`);
return;
}

isProcessingAnswerRef.current=true;

constpc=peerConnectionRef.current;
if(!pc){
console.log(`Nopeerconnectionforanswer(caller)(${isCurrentUser?'CurrentUser':'Opponent'})`);
isProcessingAnswerRef.current=false;
return;
}

constsignalingState=pc.signalingState;
console.log(`DETAILEDSTATECHECK:`,{
signalingState,
callState:callStateRef.current,
pcCreatedAt:pc._createdAt,
pcRole:pc._role,
currentTime:Date.now(),
isCurrentUser
});

if(signalingState!=='have-local-offer'){
console.warn(`Signalingstateis'${signalingState}'-expected'have-local-offer'.Queuinganswer...(${isCurrentUser?'CurrentUser':'Opponent'})`);
pendingAnswersRef.current.push(answer);
isProcessingAnswerRef.current=false;
return;
}

try{
awaitpc.setRemoteDescription(newRTCSessionDescription(answer));
console.log(`Remotedescriptionsetfromanswer.Newsignalingstate:${pc.signalingState}(caller)(${isCurrentUser?'CurrentUser':'Opponent'})`);

callStateRef.current='connected';

while(pendingCandidatesRef.current.length>0){
constcandidate=pendingCandidatesRef.current.shift();
try{
awaitpc.addIceCandidate(newRTCIceCandidate(candidate));
console.log(`AddedqueuedICEcandidate(caller)(${isCurrentUser?'CurrentUser':'Opponent'})`);
}catch(err){
console.warn(`FailedtoaddqueuedICEcandidate(caller)(${isCurrentUser?'CurrentUser':'Opponent'}):`,err);
}
}

if(pendingAnswersRef.current.length>0){
constqueuedAnswer=pendingAnswersRef.current.shift();
awaitpc.setRemoteDescription(newRTCSessionDescription(queuedAnswer));
console.log(`Processedqueuedanswer.Newsignalingstate:${pc.signalingState}(caller)(${isCurrentUser?'CurrentUser':'Opponent'})`);
}
}catch(err){
console.error(`Failedtohandlecallanswer(caller)(${isCurrentUser?'CurrentUser':'Opponent'}):`,err);
callStateRef.current='failed';
}finally{
isProcessingAnswerRef.current=false;
}
};

consthandleIceCandidate=async({from,candidate})=>{
if(from!==opponentSocketId)return;

try{
constpc=peerConnectionRef.current;
if(pc&&pc.remoteDescription&&pc.remoteDescription.type){
awaitpc.addIceCandidate(newRTCIceCandidate(candidate));
console.log(`ICEcandidateadded(${myRoleRef.current})(${isCurrentUser?'CurrentUser':'Opponent'})`);
}else{
console.log(`QueuingICEcandidate(noremotedescriptionyet)(${myRoleRef.current})(${isCurrentUser?'CurrentUser':'Opponent'})`);
pendingCandidatesRef.current.push(candidate);
}
}catch(err){
console.error(`FailedtoaddICEcandidate(${myRoleRef.current})(${isCurrentUser?'CurrentUser':'Opponent'}):`,err);
}
};

consthandleCallEnded=({from})=>{
if(from!==opponentSocketId)return;
console.log(`Callendedby:${from}(${myRoleRef.current})(${isCurrentUser?'CurrentUser':'Opponent'})`);
cleanup();
toast.info('Callendedbyopponent');
};

socket.on('incoming-call',handleIncomingCall);
socket.on('call-answered',handleCallAnswered);
socket.on('ice-candidate',handleIceCandidate);
socket.on('call-ended',handleCallEnded);

return()=>{
socket.off('incoming-call',handleIncomingCall);
socket.off('call-answered',handleCallAnswered);
socket.off('ice-candidate',handleIceCandidate);
socket.off('call-ended',handleCallEnded);
};
},[socket,opponentSocketId,createPeerConnection,cleanup,isCurrentUser,debugPeerConnection]);

//Mediacontrolfunctions
consttoggleMic=useCallback(()=>{
if(!localStreamRef.current)return;

constaudioTracks=localStreamRef.current.getAudioTracks();
constnewState=!isMicEnabled;

audioTracks.forEach(track=>{
track.enabled=newState;
});

setMicEnabled(newState);
console.log(`Microphone${newState?'enabled':'disabled'}(${isCurrentUser?'CurrentUser':'Opponent'})`);
},[isMicEnabled,isCurrentUser]);

consttoggleVideo=useCallback(()=>{
if(!localStreamRef.current)return;

constvideoTracks=localStreamRef.current.getVideoTracks();
constnewState=!isVideoEnabled;

videoTracks.forEach(track=>{
track.enabled=newState;
});

setVideoEnabled(newState);
console.log(`Video${newState?'enabled':'disabled'}(${isCurrentUser?'CurrentUser':'Opponent'})`);
},[isVideoEnabled,isCurrentUser]);

//Cleanuponunmount
useEffect(()=>{
return()=>{
cleanup();
};
},[cleanup]);

return{
localStream:localStreamRef.current,
remoteStream:remoteStreamRef.current,
connectionState,
mediaError,
isMicEnabled,
isVideoEnabled,
toggleMic,
toggleVideo,
shouldInitiateCall,
};
};
