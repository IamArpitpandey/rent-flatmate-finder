import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Send } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Loader from '../components/ui/Loader';

export default function ChatPage() {
  const { interestId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [otherTyping, setOtherTyping] = useState(false);
  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/chat/${interestId}`);
        setMessages(data.messages);
      } catch (err) {
        toast.error(err.message);
        navigate('/interests');
      } finally {
        setLoading(false);
      }
    })();
  }, [interestId, navigate]);

  useEffect(() => {
    if (!socket) return;
    socket.emit('chat:join', interestId);

    const onMessage = (msg) => {
      if (msg.interest === interestId || msg.interest?._id === interestId) {
        setMessages((prev) => [...prev, msg]);
      }
    };
    const onTyping = ({ isTyping }) => setOtherTyping(isTyping);

    socket.on('chat:message', onMessage);
    socket.on('chat:typing', onTyping);
    return () => {
      socket.off('chat:message', onMessage);
      socket.off('chat:typing', onTyping);
    };
  }, [socket, interestId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!text.trim() || !socket) return;
    socket.emit('chat:message', { interestId, text: text.trim() });
    setText('');
    socket.emit('chat:typing', { interestId, isTyping: false });
  };

  const handleTyping = (val) => {
    setText(val);
    if (!socket) return;
    socket.emit('chat:typing', { interestId, isTyping: true });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit('chat:typing', { interestId, isTyping: false });
    }, 1200);
  };

  if (loading) return <Loader label="Opening chat" />;

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[72vh] animate-fadeUp">
      <button
        onClick={() => navigate('/interests')}
        className="inline-flex items-center gap-1.5 text-sm text-slate hover:text-ink hover:-translate-x-1 transition-all mb-4 self-start"
      >
        <ArrowLeft size={14} /> Back to requests
      </button>

      <div className="card flex-1 flex flex-col overflow-hidden glass-hover">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 fm-chat-scroll">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center py-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-jade-light to-violet-light flex items-center justify-center ring-1 ring-jade/20 mb-3">
                <Send size={22} className="text-jade-dark" />
              </div>
              <p className="text-sm text-slate max-w-xs">
                Say hello — this conversation was unlocked because both of you were interested.
              </p>
            </div>
          )}
          {messages.map((m) => {
            const mine = (m.sender?._id || m.sender) === user._id;
            return (
              <div key={m._id} className={`flex ${mine ? 'justify-end' : 'justify-start'} animate-fadeUp`}>
                <div
                  className={`max-w-[75%] px-4 py-2.5 text-sm leading-relaxed ${
                    mine
                      ? 'fm-bubble-mine'
                      : 'fm-bubble-theirs'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            );
          })}
          {otherTyping && (
            <div className="flex justify-start">
              <div className="fm-bubble-typing">
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <form onSubmit={sendMessage} className="flex items-center gap-2 p-3 border-t border-ink/8 bg-paper/40 backdrop-blur-sm">
          <input
            className="input-field"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => handleTyping(e.target.value)}
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br from-jade to-jade-dark text-paper flex items-center justify-center shadow-glowJade hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:pointer-events-none"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
