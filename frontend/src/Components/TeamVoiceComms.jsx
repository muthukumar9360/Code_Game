import React, { useState, useEffect, useRef } from "react";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaComments,
  FaPaperPlane,
  FaVolumeUp,
  FaShieldAlt,
  FaUsers
} from "react-icons/fa";

const TeamVoiceComms = ({ socket, roomId, team = "A", username = "Teammate" }) => {
  const [micActive, setMicActive] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState("");
  const [peers, setPeers] = useState([]);
  const [voiceNotice, setVoiceNotice] = useState("");

  const localStreamRef = useRef(null);
  const peerConnectionsRef = useRef({});
  const audioElementsRef = useRef([]);

  // Team channel identifier
  const teamLabel = team === "solo" ? "Squad Comms" : `Team ${team} Comms`;

  useEffect(() => {
    if (!socket || !roomId) return;

    // Join team voice & chat room
    socket.emit("join-team-voice", { roomId, team, username });

    // Initial peers list for newly joined peer
    socket.on("team-voice-peers", ({ peers: existingList }) => {
      if (Array.isArray(existingList)) {
        setPeers(existingList.map(p => ({ id: p.socketId, name: p.username })));
      }
    });

    // Incoming team chat message
    socket.on("team-chat-received", (msg) => {
      setMessages((prev) => [...prev.slice(-30), msg]);
    });

    // Teammate connected to voice
    socket.on("peer-voice-joined", async ({ peerSocketId, username: peerName }) => {
      setPeers((prev) => {
        const filtered = prev.filter(p => p.id !== peerSocketId);
        return [...filtered, { id: peerSocketId, name: peerName }];
      });
      setVoiceNotice(`📡 ${peerName} joined ${teamLabel}`);
      setTimeout(() => setVoiceNotice(""), 3500);

      if (micActive && localStreamRef.current) {
        initiatePeerConnection(peerSocketId, true);
      }
    });

    // Teammate left
    socket.on("peer-voice-left", ({ peerSocketId }) => {
      setPeers((prev) => prev.filter((p) => p.id !== peerSocketId));
      if (peerConnectionsRef.current[peerSocketId]) {
        peerConnectionsRef.current[peerSocketId].close();
        delete peerConnectionsRef.current[peerSocketId];
      }
    });

    // WebRTC signaling
    socket.on("peer-voice-signal", async ({ senderSocketId, signal }) => {
      let pc = peerConnectionsRef.current[senderSocketId];
      if (!pc) {
        pc = createPeerConnection(senderSocketId);
      }

      if (signal.sdp) {
        await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
        if (signal.sdp.type === "offer") {
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit("voice-signal", {
            targetSocketId: senderSocketId,
            signal: { sdp: pc.localDescription },
            senderName: username,
          });
        }
      } else if (signal.candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
        } catch (e) {
          console.error("Ice candidate error", e);
        }
      }
    });

    return () => {
      socket.emit("leave-team-voice", { roomId, team });
      socket.off("team-chat-received");
      socket.off("peer-voice-joined");
      socket.off("peer-voice-left");
      socket.off("peer-voice-signal");
      stopLocalStream();
    };
  }, [socket, roomId, team, username, micActive]);

  const createPeerConnection = (targetSocketId) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    peerConnectionsRef.current[targetSocketId] = pc;

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("voice-signal", {
          targetSocketId,
          signal: { candidate: e.candidate },
          senderName: username,
        });
      }
    };

    pc.ontrack = (e) => {
      const audio = new Audio();
      audio.srcObject = e.streams[0];
      audio.autoplay = true;
      audio.play().catch(() => {});
      audioElementsRef.current.push(audio);
    };

    return pc;
  };

  const initiatePeerConnection = async (targetSocketId, isOfferer = true) => {
    const pc = createPeerConnection(targetSocketId);
    if (isOfferer) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("voice-signal", {
        targetSocketId,
        signal: { sdp: pc.localDescription },
        senderName: username,
      });
    }
  };

  // Toggle microphone
  const toggleMic = async () => {
    if (micActive) {
      stopLocalStream();
      setMicActive(false);
      setVoiceNotice("🔇 Squad microphone muted.");
      setTimeout(() => setVoiceNotice(""), 2500);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStreamRef.current = stream;
        setMicActive(true);
        setVoiceNotice("🎙️ Squad voice live (Microphone connected).");
        setTimeout(() => setVoiceNotice(""), 2500);

        // Connect audio tracks to all peers in the squad
        peers.forEach((peer) => {
          let pc = peerConnectionsRef.current[peer.id];
          if (!pc) {
            initiatePeerConnection(peer.id, true);
          } else {
            stream.getTracks().forEach((track) => pc.addTrack(track, stream));
            pc.createOffer().then((offer) => {
              pc.setLocalDescription(offer);
              socket.emit("voice-signal", {
                targetSocketId: peer.id,
                signal: { sdp: pc.localDescription },
                senderName: username,
              });
            });
          }
        });
      } catch (err) {
        console.error("Mic access failed", err);
        setVoiceNotice("⚠️ Mic access denied or unavailable.");
        setTimeout(() => setVoiceNotice(""), 3000);
      }
    }
  };

  const stopLocalStream = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    audioElementsRef.current.forEach((a) => {
      try {
        a.pause();
        a.srcObject = null;
      } catch (e) {}
    });
    audioElementsRef.current = [];
  };

  // Send team tactical message
  const sendChat = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    socket.emit("team-chat-message", {
      roomId,
      team,
      sender: username,
      text: inputMsg.trim(),
    });

    setInputMsg("");
  };

  return (
    <div className="flex items-center gap-2 relative">
      {/* VOICE NOTICE ALERT */}
      {voiceNotice && (
        <div className="absolute -top-9 right-0 bg-[#0a1118] border border-orange-500/40 text-orange-300 text-[10px] font-mono px-3 py-1 rounded-lg shadow-xl z-50 whitespace-nowrap animate-bounce">
          {voiceNotice}
        </div>
      )}

      {/* SQUAD MIC TOGGLE */}
      <button
        type="button"
        onClick={toggleMic}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold font-mono transition-all shadow-md ${
          micActive
            ? "bg-green-500/20 text-green-400 border-green-500/50 shadow-[0_0_12px_rgba(34,197,94,0.3)] animate-pulse"
            : "bg-white/5 hover:bg-white/10 text-gray-300 border-white/10"
        }`}
        title={micActive ? "Mute Squad Mic" : "Enable Squad Voice Comms"}
      >
        {micActive ? <FaMicrophone /> : <FaMicrophoneSlash className="text-gray-500" />}
        <span>{micActive ? "LIVE COMMS" : "MIC OFF"}</span>
      </button>

      {/* TACTICAL TEAM CHAT TOGGLE */}
      <button
        type="button"
        onClick={() => setChatOpen(!chatOpen)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold font-mono transition-all ${
          chatOpen
            ? "bg-blue-500/20 text-blue-400 border-blue-500/50 shadow-[0_0_12px_rgba(59,130,246,0.3)]"
            : "bg-white/5 hover:bg-white/10 text-gray-300 border-white/10"
        }`}
        title="Squad Tactical Chat (Private to Teammates)"
      >
        <FaComments />
        <span>SQUAD CHAT</span>
        {messages.length > 0 && (
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
        )}
      </button>

      {/* TACTICAL CHAT POPUP DRAWER */}
      {chatOpen && (
        <div className="absolute right-0 top-12 w-80 sm:w-96 bg-[#0a1118]/98 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in duration-150">
          <div className="px-4 py-3 border-b border-white/10 bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaShieldAlt className="text-blue-400 text-xs" />
              <span className="font-bold text-xs uppercase tracking-wider text-white">
                {teamLabel} // Tactical Uplink
              </span>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              className="text-gray-400 hover:text-white text-xs font-bold"
            >
              ✕
            </button>
          </div>

          {/* CHAT MESSAGES */}
          <div className="p-3 h-52 overflow-y-auto space-y-2.5 text-xs font-sans">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 text-[11px] pt-12">
                🔒 Private squad channel. Messages sent here are invisible to rival combatants.
              </div>
            ) : (
              messages.map((m, idx) => {
                const isMe = m.sender === username;
                return (
                  <div
                    key={idx}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[10px] text-gray-400 font-mono font-bold">
                        {isMe ? "You" : m.sender}
                      </span>
                      <span className="text-[9px] text-gray-600 font-mono">{m.timestamp}</span>
                    </div>
                    <div
                      className={`px-3 py-1.5 rounded-xl max-w-[85%] text-xs leading-relaxed ${
                        isMe
                          ? "bg-blue-600/30 text-blue-200 border border-blue-500/30"
                          : "bg-white/10 text-gray-200 border border-white/10"
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* CHAT INPUT */}
          <form onSubmit={sendChat} className="p-2 border-t border-white/10 bg-black/40 flex gap-2">
            <input
              type="text"
              placeholder="Transmit tactical hint..."
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              className="grow bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500 font-sans"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-black font-bold text-xs transition"
            >
              <FaPaperPlane />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default TeamVoiceComms;
