import { useCallback, useEffect, useRef, useState } from 'react';
import { LoaderCircle, MessageCircle, SendHorizontal, X } from 'lucide-react';
import { chatService } from '../../features/chat/services/chatService';
import { tokenStorage } from '../../utils';
import type { ChatMessageResponse, ChatRoomResponse } from '../../types/api';

const formatTime = (value: string) =>
  new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' }).format(new Date(value));

function TypingDots() {
  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-white/20 bg-white/10 px-2 py-1 shadow-xs">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/90 [animation-delay:-0.32s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/90 [animation-delay:-0.16s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/90" />
    </div>
  );
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [room, setRoom] = useState<ChatRoomResponse | null>(null);
  const [messages, setMessages] = useState<ChatMessageResponse[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [draft, setDraft] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const isInitialLoadRef = useRef(true);
  const typingTimeoutRef = useRef<number | null>(null);
  const scrollTimerRef = useRef<number | null>(null);
  //Hai ref chống spam event TYPING.
  ///Ví dụ khách gõ 30 ký tự: không gửi 30 WebSocket message; chỉ gửi tối đa một TYPING mỗi 1,5 giây.
  const typingThrottledRef = useRef(false);
  const typingThrottleTimerRef = useRef<number | null>(null);
  const isOpenRef = useRef(isOpen);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  const scheduleScrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth', force = false) => {
    const container = scrollContainerRef.current;
    const isNearBottom = !container
      || container.scrollHeight - container.scrollTop - container.clientHeight < 120;
    if (!force && !isNearBottom) return;

    if (scrollTimerRef.current) window.clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = window.setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior, block: 'end' });
      scrollTimerRef.current = null;
    }, 50);
  }, []);

  const openConversation = useCallback(async () => {
    if (!tokenStorage.getAccessToken()) {
      setError('Vui lòng đăng nhập để trò chuyện với BookStore.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const roomRes = await chatService.getOrCreateMyRoom();
      const currentRoom = roomRes.data.data;
      if (!currentRoom) throw new Error('Không thể tạo cuộc trò chuyện');
      const res = await chatService.getMessages(currentRoom.chatRoomId, 0, 20);
      const msgData = res.data.data;
      setRoom(currentRoom);
      //tạo bản copy reverse dữ liệu từ mới đến cũ để hiển thị lên UI
      const chronologized = (msgData?.content ?? []).slice().reverse();
      setMessages(chronologized);
      setPage(0);
      setHasMore(!msgData?.last);
      isInitialLoadRef.current = true;
      void chatService.markRoomRead(currentRoom.chatRoomId).catch(() => undefined);
    } catch {
      setError('Không thể mở cuộc trò chuyện. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen || room || isLoading) return;
    const timer = window.setTimeout(() => void openConversation(), 0);
    return () => window.clearTimeout(timer);
  }, [isLoading, isOpen, openConversation, room]);

  useEffect(() => {
    const token = tokenStorage.getAccessToken();
    if (!token) return;
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    //new WebSocket(url)
    //1. TCP SYN → SYN-ACK → ACK
    //2. Gửi HTTP Upgrade request
    //3. Tạo session WebSocket để giao tiếp realtime-tạo 101 switching protocols từ server
    const socket = new WebSocket(
      `${baseUrl.replace(/^http/, 'ws').replace(/\/$/, '')}/ws/chat?token=${encodeURIComponent(token)}`,
    );
    socketRef.current = socket;
    socket.onopen = () => setIsConnected(true);
    socket.onclose = () => setIsConnected(false);
    socket.onerror = () => setIsConnected(false);
    //nhận message từ server
    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as ChatMessageResponse;
        if (message.type === 'TYPING') {
          const sentByStaff = message.senderRole === 'ADMIN' || message.senderRole === 'STAFF';
          if (sentByStaff && message.chatRoomId === room?.chatRoomId) {
            setIsPartnerTyping(true);
            if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = window.setTimeout(() => setIsPartnerTyping(false), 15000);
          }
          return;
        }

        if (message.type === 'STOP_TYPING') {
          const sentByStaff = message.senderRole === 'ADMIN' || message.senderRole === 'STAFF';
          if (sentByStaff && message.chatRoomId === room?.chatRoomId) {
            setIsPartnerTyping(false);
            if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current);
          }
          return;
        }

        setIsPartnerTyping(false);
        if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current);

        setMessages((current) => {
          if (message.chatRoomId !== room?.chatRoomId || current.some((item) => item.messageId === message.messageId)) {
            return current;
          }
          return [...current, message];
        });
        if (isOpenRef.current) void chatService.markRoomRead(message.chatRoomId).catch(() => undefined);
        scheduleScrollToBottom();
      } catch {
        // Ignore invalid server payloads.
      }
    };
    return () => socket.close();
  }, [room?.chatRoomId, scheduleScrollToBottom]);

  useEffect(() => {
    if (isOpen && isInitialLoadRef.current && messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
      isInitialLoadRef.current = false;
    }
  }, [messages.length, isOpen]);

  useEffect(() => {
    if (isPartnerTyping) {
      scheduleScrollToBottom();
    }
  }, [isPartnerTyping, scheduleScrollToBottom]);

  useEffect(() => () => {
    if (scrollTimerRef.current) window.clearTimeout(scrollTimerRef.current);
    if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current);
    if (typingThrottleTimerRef.current) window.clearTimeout(typingThrottleTimerRef.current);
  }, []);

  const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    if (container.scrollTop <= 30 && hasMore && !isLoadingMore && !isLoading && room) {
      setIsLoadingMore(true);
      const prevScrollHeight = container.scrollHeight;
      const prevScrollTop = container.scrollTop;
      const nextPage = page + 1;
      try {
        const res = await chatService.getMessages(room.chatRoomId, nextPage, 20);
        const msgData = res.data.data;
        const olderMessages = (msgData?.content ?? []).slice().reverse();
        setMessages((current) => {
          const existingIds = new Set(current.map((item) => item.messageId));
          const newOlder = olderMessages.filter((item) => !existingIds.has(item.messageId));
          return [...newOlder, ...current];
        });
        setPage(nextPage);
        setHasMore(!msgData?.last);

        requestAnimationFrame(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop =
              scrollContainerRef.current.scrollHeight - prevScrollHeight + prevScrollTop;
          }
        });
      } catch {
        // Ignore load error during scroll
      } finally {
        setIsLoadingMore(false);
      }
    }
  };

  const handleDraftChange = (value: string) => {
    setDraft(value);
    if (!room || socketRef.current?.readyState !== WebSocket.OPEN) return;
    if (value.trim().length > 0) {
      if (!typingThrottledRef.current) {
        typingThrottledRef.current = true;
        typingThrottleTimerRef.current = window.setTimeout(() => {
          typingThrottledRef.current = false;
          typingThrottleTimerRef.current = null;
        }, 1500);
        try {
          socketRef.current.send(
            JSON.stringify({ type: 'TYPING', chatRoomId: room.chatRoomId }),
          );
        } catch {
          // Ignore
        }
      }
    } else {
      typingThrottledRef.current = false;
      if (typingThrottleTimerRef.current) {
        window.clearTimeout(typingThrottleTimerRef.current);
        typingThrottleTimerRef.current = null;
      }
      try {
        socketRef.current.send(
          JSON.stringify({ type: 'STOP_TYPING', chatRoomId: room.chatRoomId }),
        );
      } catch {
        // Ignore
      }
    }
  };

  const sendMessage = () => {
    const content = draft.trim();
    if (!content || !room || socketRef.current?.readyState !== WebSocket.OPEN) return;
    try {
      socketRef.current.send(JSON.stringify({ type: 'STOP_TYPING', chatRoomId: room.chatRoomId }));
    } catch {
      // Ignore
    }
    typingThrottledRef.current = false;
    if (typingThrottleTimerRef.current) {
      window.clearTimeout(typingThrottleTimerRef.current);
      typingThrottleTimerRef.current = null;
    }
    socketRef.current.send(JSON.stringify({ type: 'MESSAGE', chatRoomId: room.chatRoomId, content }));
    setDraft('');
    scheduleScrollToBottom('smooth', true);
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <section className="flex h-[480px] max-h-[calc(100dvh-5rem)] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-2xl">
          <header className="flex items-center gap-3 bg-primary px-4 py-4 text-white">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-secondary-container text-on-secondary-container">
              <MessageCircle size={21} />
            </div>
            <div>
              <h2 className="text-sm font-bold">Hỗ trợ trực tuyến</h2>
              <p className="mt-0.5 flex items-center gap-1.5 text-caption text-white/80">
                <span className={`h-1.5 w-1.5 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-white/50'}`} />
                <span>{isConnected ? 'Đang hoạt động' : 'Đang kết nối...'}</span>
                {(isConnected || isPartnerTyping) && <TypingDots />}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="ml-auto rounded-lg p-1.5 hover:bg-white/10"
              aria-label="Đóng chat"
            >
              <X size={22} />
            </button>
          </header>

          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="min-h-0 flex-1 overflow-y-auto bg-surface-container-low p-4"
          >
            {isLoading ? (
              <div className="grid h-full place-items-center text-on-surface-variant">
                <LoaderCircle className="animate-spin" size={25} />
              </div>
            ) : error ? (
              <div className="grid h-full place-items-center text-center">
                <p className="text-sm text-on-surface-variant">{error}</p>
                <button
                  onClick={() => void openConversation()}
                  className="mt-3 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white"
                >
                  Thử lại
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {isLoadingMore && (
                  <div className="flex items-center justify-center gap-2 py-2 text-caption font-medium text-on-surface-variant">
                    <LoaderCircle className="animate-spin" size={16} />
                    <span>Đang tải tin nhắn cũ hơn...</span>
                  </div>
                )}
                {messages.length === 0 && (
                  <p className="rounded-lg border border-outline-variant bg-white p-3 text-sm text-on-surface-variant">
                    Xin chào! Hãy để lại câu hỏi, BookStore sẽ phản hồi sớm nhất.
                  </p>
                )}
                {messages
                  .filter((m) => m.content !== '__TYPING__' && m.content !== '__STOP_TYPING__')
                  .map((message) => {
                    const mine = room?.buyerId === message.senderId;
                    return (
                      <div key={message.messageId} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[85%] rounded-xl px-3 py-2.5 text-sm leading-5 shadow-sm ${mine
                              ? 'rounded-br-sm bg-primary text-white'
                              : 'rounded-bl-sm border border-outline-variant bg-white text-on-surface'
                            }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{message.content}</p>
                          <p
                            className={`mt-1 text-right text-caption ${mine ? 'text-white/70' : 'text-on-surface-variant'}`}
                          >
                            {formatTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                {isPartnerTyping && (
                  <div className="flex justify-start my-1 animate-fade-in">
                    <div className="rounded-xl rounded-bl-sm border border-outline-variant bg-white px-3 py-2 shadow-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-primary/70 animate-bounce [animation-delay:-0.32s]" />
                        <span className="h-2 w-2 rounded-full bg-primary/70 animate-bounce [animation-delay:-0.16s]" />
                        <span className="h-2 w-2 rounded-full bg-primary/70 animate-bounce" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
            className="flex gap-2 border-t border-outline-variant bg-white p-3"
          >
            <input
              value={draft}
              onChange={(event) => handleDraftChange(event.target.value)}
              placeholder="Nhập tin nhắn..."
              className="min-w-0 flex-1 rounded-full bg-surface-container-low px-4 py-2.5 text-sm outline-none ring-primary focus:ring-2"
              disabled={!room || !isConnected}
            />
            <button
              type="submit"
              disabled={!draft.trim() || !room || !isConnected}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-white disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Gửi tin nhắn"
            >
              <SendHorizontal size={18} />
            </button>
          </form>
        </section>
      )}
      <button
        onClick={() => setIsOpen((current) => !current)}
        className="grid h-14 w-14 place-items-center rounded-full bg-primary text-white shadow-xl transition-transform hover:scale-105"
        aria-label={isOpen ? 'Đóng chat' : 'Mở chat hỗ trợ'}
      >
        {isOpen ? <X size={26} /> : <MessageCircle size={26} />}
      </button>
    </div>
  );
}
