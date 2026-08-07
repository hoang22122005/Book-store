import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronLeft,
  CircleAlert,
  ImagePlus,
  LoaderCircle,
  MessageSquareText,
  Paperclip,
  Search,
  SendHorizontal,
  SlidersHorizontal,
  Smile,
  UserRound,
  WifiOff,
} from 'lucide-react';
import { chatService } from '../../features/chat/services/chatService';
import { tokenStorage } from '../../utils';
import type { ChatMessageResponse, ChatRoomResponse } from '../../types/api';

type RoomWithMessages = ChatRoomResponse & {
  messages: ChatMessageResponse[];
  page: number;
  hasMore: boolean;
};
type Filter = 'all' | 'unread';

const formatTime = (value: string) =>
  new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' }).format(new Date(value));

const formatDay = (value: string) => {
  const date = new Date(value);
  const today = new Date();
  const sameDay = date.toDateString() === today.toDateString();
  return sameDay ? 'HÔM NAY' : new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' }).format(date);
};

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

const Avatar = ({ name, className = '' }: { name: string; className?: string }) => (
  <div className={`grid shrink-0 place-items-center rounded-full bg-primary-fixed text-xs font-bold text-primary ${className}`}>
    {initials(name)}
  </div>
);

function TypingDots() {
  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-outline-variant/60 bg-white px-2.5 py-1.5 shadow-xs">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/70 [animation-delay:-0.32s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/70 [animation-delay:-0.16s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/70" />
    </div>
  );
}

export function ChatPage() {
  const [rooms, setRooms] = useState<RoomWithMessages[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const messageContainerRef = useRef<HTMLDivElement | null>(null);
  const lastMessageRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const scrollTimerRef = useRef<number | null>(null);
  const typingThrottledRef = useRef(false);
  const typingThrottleTimerRef = useRef<number | null>(null);

  const selectedRoomIdRef = useRef<number | null>(selectedRoomId);

  useEffect(() => {
    selectedRoomIdRef.current = selectedRoomId;
  }, [selectedRoomId]);

  const scheduleScrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth', force = false) => {
    const container = messageContainerRef.current;
    const isNearBottom = !container
      || container.scrollHeight - container.scrollTop - container.clientHeight < 120;
    if (!force && !isNearBottom) return;

    if (scrollTimerRef.current) window.clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = window.setTimeout(() => {
      lastMessageRef.current?.scrollIntoView({ behavior, block: 'end' });
      scrollTimerRef.current = null;
    }, 50);
  }, []);

  const fetchRoomsSilently = useCallback(async () => {
    try {
      const roomRes = await chatService.getRooms();
      const roomData = roomRes.data.data ?? [];
      const data = await Promise.all(
        roomData.map(async (room) => {
          const res = await chatService.getMessages(room.chatRoomId, 0, 20);
          const msgData = res.data.data;
          return {
            ...room,
            messages: (msgData?.content ?? []).slice().reverse(),
            page: 0,
            hasMore: !msgData?.last,
          };
        }),
      );
      data.sort((a, b) => {
        const aLast = a.messages.at(-1)?.createdAt ?? a.createdAt;
        const bLast = b.messages.at(-1)?.createdAt ?? b.createdAt;
        return new Date(bLast).getTime() - new Date(aLast).getTime();
      });

      setRooms((currentRooms) => {
        const readRoomMap = new Map<number, Set<number>>();
        currentRooms.forEach((r) => {
          const readIds = new Set(r.messages.filter((m) => m.read).map((m) => m.messageId));
          readRoomMap.set(r.chatRoomId, readIds);
        });

        return data.map((fetchedRoom) => {
          const isSelected = fetchedRoom.chatRoomId === selectedRoomIdRef.current;
          const readMessageIds = readRoomMap.get(fetchedRoom.chatRoomId);

          return {
            ...fetchedRoom,
            messages: fetchedRoom.messages.map((m) => {
              const wasRead = isSelected || readMessageIds?.has(m.messageId) || false;
              return wasRead ? { ...m, read: true } : m;
            }),
          };
        });
      });
    } catch {
      // Ignore silent error
    }
  }, []);

  const loadRooms = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const roomRes = await chatService.getRooms();
      const roomData = roomRes.data.data ?? [];
      const data = await Promise.all(
        roomData.map(async (room) => {
          const res = await chatService.getMessages(room.chatRoomId, 0, 20);
          const msgData = res.data.data;
          return {
            ...room,
            messages: (msgData?.content ?? []).slice().reverse(),
            page: 0,
            hasMore: !msgData?.last,
          };
        }),
      );
      data.sort((a, b) => {
        const aLast = a.messages.at(-1)?.createdAt ?? a.createdAt;
        const bLast = b.messages.at(-1)?.createdAt ?? b.createdAt;
        return new Date(bLast).getTime() - new Date(aLast).getTime();
      });

      const initialSelectedId = selectedRoomIdRef.current ?? data[0]?.chatRoomId ?? null;
      selectedRoomIdRef.current = initialSelectedId;
      setSelectedRoomId(initialSelectedId);
      setRooms(data.map((room) =>
        room.chatRoomId === initialSelectedId
          ? { ...room, messages: room.messages.map((message) => ({ ...message, read: true })) }
          : room,
      ));
      if (initialSelectedId) void chatService.markRoomRead(initialSelectedId).catch(() => undefined);
    } catch {
      setError('Không thể tải cuộc trò chuyện. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadRooms(), 0);
    return () => window.clearTimeout(timer);
  }, [loadRooms]);

  const selectRoom = (roomId: number | null) => {
    selectedRoomIdRef.current = roomId;
    setSelectedRoomId(roomId);
    setIsPartnerTyping(false);
    if (roomId) {
      setRooms((current) => current.map((room) =>
        room.chatRoomId === roomId
          ? { ...room, messages: room.messages.map((message) => ({ ...message, read: true })) }
          : room,
      ));
      void chatService.markRoomRead(roomId).catch(() => undefined);
    }
  };

  useEffect(() => {
    const token = tokenStorage.getAccessToken();
    if (!token) return;
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    const wsUrl = `${baseUrl.replace(/^http/, 'ws').replace(/\/$/, '')}/ws/chat?token=${encodeURIComponent(token)}`;
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;
    socket.onopen = () => setIsSocketConnected(true);
    socket.onclose = () => setIsSocketConnected(false);
    socket.onerror = () => setIsSocketConnected(false);
    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as ChatMessageResponse;
        const currentSelectedId = selectedRoomIdRef.current;
        if (message.type === 'TYPING') {
          const sentByCustomer = message.senderRole !== 'ADMIN' && message.senderRole !== 'STAFF';
          if (sentByCustomer && message.chatRoomId === currentSelectedId) {
            setIsPartnerTyping(true);
            if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = window.setTimeout(() => setIsPartnerTyping(false), 15000);
          }
          return;
        }

        if (message.type === 'STOP_TYPING') {
          const sentByCustomer = message.senderRole !== 'ADMIN' && message.senderRole !== 'STAFF';
          if (sentByCustomer && message.chatRoomId === currentSelectedId) {
            setIsPartnerTyping(false);
            if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current);
          }
          return;
        }

        if (message.chatRoomId === currentSelectedId) {
          setIsPartnerTyping(false);
          if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current);
          void chatService.markRoomRead(message.chatRoomId).catch(() => undefined);
        }

        setRooms((current) => {
          const roomExists = current.some((room) => room.chatRoomId === message.chatRoomId);
          if (!roomExists) {
            void fetchRoomsSilently();
            return current;
          }
          const updated = current.map((room) => {
            if (room.chatRoomId !== message.chatRoomId) return room;
            const exists = room.messages.some((item) => item.messageId === message.messageId);
            const isSelected = room.chatRoomId === currentSelectedId;
            const messageWithReadState = isSelected ? { ...message, read: true } : message;
            return {
              ...room,
              messages: exists ? room.messages : [...room.messages, messageWithReadState],
            };
          });
          return [...updated].sort((a, b) => {
            const aLast = a.messages.at(-1)?.createdAt ?? a.createdAt;
            const bLast = b.messages.at(-1)?.createdAt ?? b.createdAt;
            return new Date(bLast).getTime() - new Date(aLast).getTime();
          });
        });
        scheduleScrollToBottom();
      } catch {
        // Ignore malformed WebSocket payloads.
      }
    };
    return () => socket.close();
  }, [fetchRoomsSilently, scheduleScrollToBottom]);

  const selectedRoom = rooms.find((room) => room.chatRoomId === selectedRoomId) ?? null;
  const filteredRooms = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase('vi');
    return rooms.filter((room) => {
      const lastMessage = room.messages.at(-1);
      const hasUnread = room.messages.some((message) => !message.read && message.senderRole !== 'ADMIN' && message.senderRole !== 'STAFF');
      return (
        (filter === 'all' || hasUnread) &&
        (!normalizedSearch || room.buyerName.toLocaleLowerCase('vi').includes(normalizedSearch) || lastMessage?.content.toLocaleLowerCase('vi').includes(normalizedSearch))
      );
    });
  }, [filter, rooms, search]);

  useEffect(() => {
    scheduleScrollToBottom('auto', true);
  }, [scheduleScrollToBottom, selectedRoomId]);

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
    if (container.scrollTop <= 30 && selectedRoom && selectedRoom.hasMore && !isLoadingMore) {
      setIsLoadingMore(true);
      const prevScrollHeight = container.scrollHeight;
      const prevScrollTop = container.scrollTop;
      const nextPage = selectedRoom.page + 1;
      try {
        const res = await chatService.getMessages(selectedRoom.chatRoomId, nextPage, 20);
        const msgData = res.data.data;
        const olderMessages = (msgData?.content ?? []).slice().reverse();
        setRooms((current) =>
          current.map((room) => {
            if (room.chatRoomId !== selectedRoom.chatRoomId) return room;
            const existingIds = new Set(room.messages.map((m) => m.messageId));
            const newOlder = olderMessages.filter((m) => !existingIds.has(m.messageId));
            return {
              ...room,
              messages: [...newOlder, ...room.messages],
              page: nextPage,
              hasMore: !msgData?.last,
            };
          }),
        );
        requestAnimationFrame(() => {
          if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop =
              messageContainerRef.current.scrollHeight - prevScrollHeight + prevScrollTop;
          }
        });
      } catch {
        // Ignore load error on scroll
      } finally {
        setIsLoadingMore(false);
      }
    }
  };

  const handleDraftChange = (value: string) => {
    setDraft(value);
    if (!selectedRoom || socketRef.current?.readyState !== WebSocket.OPEN) return;
    if (value.trim().length > 0) {
      if (!typingThrottledRef.current) {
        typingThrottledRef.current = true;
        typingThrottleTimerRef.current = window.setTimeout(() => {
          typingThrottledRef.current = false;
          typingThrottleTimerRef.current = null;
        }, 1500);
        try {
          socketRef.current.send(
            JSON.stringify({ type: 'TYPING', chatRoomId: selectedRoom.chatRoomId }),
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
          JSON.stringify({ type: 'STOP_TYPING', chatRoomId: selectedRoom.chatRoomId }),
        );
      } catch {
        // Ignore
      }
    }
  };

  const sendMessage = () => {
    const content = draft.trim();
    if (!content || !selectedRoom || socketRef.current?.readyState !== WebSocket.OPEN) return;
    try {
      socketRef.current.send(JSON.stringify({ type: 'STOP_TYPING', chatRoomId: selectedRoom.chatRoomId }));
    } catch {
      // Ignore
    }
    typingThrottledRef.current = false;
    if (typingThrottleTimerRef.current) {
      window.clearTimeout(typingThrottleTimerRef.current);
      typingThrottleTimerRef.current = null;
    }
    socketRef.current.send(JSON.stringify({ type: 'MESSAGE', chatRoomId: selectedRoom.chatRoomId, content }));
    setDraft('');
    scheduleScrollToBottom('smooth', true);
  };

  return (
    <section className="h-[calc(100vh-8rem)] min-h-[500px] overflow-hidden rounded-xl border border-outline-variant/70 bg-surface-container-lowest text-on-surface shadow-sm">
      <div className="grid h-full max-h-full grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)_260px] overflow-hidden">
        <aside className={`${selectedRoom ? 'hidden lg:flex' : 'flex'} h-full min-h-0 flex-col overflow-hidden border-r border-outline-variant/70 bg-surface-container-lowest`}>
          <div className="shrink-0 border-b border-outline-variant/70 px-5 pb-4 pt-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-caption font-semibold uppercase tracking-[0.16em] text-on-surface-variant">Hỗ trợ khách hàng</p>
                <h1 className="mt-1 text-headline-md font-bold">Tin nhắn</h1>
              </div>
              <button className="rounded-lg p-2 text-primary transition-colors hover:bg-primary-fixed" aria-label="Lọc tin nhắn">
                <SlidersHorizontal size={20} />
              </button>
            </div>
            <label className="flex h-11 items-center gap-2 rounded-full bg-surface-container-low px-3 text-on-surface-variant focus-within:ring-2 focus-within:ring-primary/30">
              <Search size={18} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full bg-transparent text-sm outline-none placeholder:text-on-surface-variant" placeholder="Tìm khách hàng hoặc tin nhắn..." />
            </label>
            <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg bg-surface-container-low p-1">
              {([['all', 'Tất cả'], ['unread', 'Chưa đọc']] as const).map(([value, label]) => (
                <button key={value} onClick={() => setFilter(value)} className={`rounded-md px-3 py-2 text-sm font-semibold transition-colors ${filter === value ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:bg-white'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {isLoading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={loadRooms} /> : filteredRooms.length === 0 ? <EmptyList /> : filteredRooms.map((room) => {
              const validMessages = room.messages.filter((m) => m.content !== '__TYPING__' && m.content !== '__STOP_TYPING__');
              const lastMessage = validMessages.at(-1);
              const active = room.chatRoomId === selectedRoomId;
              const hasUnread = validMessages.some((message) => !message.read && message.senderRole !== 'ADMIN' && message.senderRole !== 'STAFF');
              return (
                <button
                  key={room.chatRoomId}
                  onClick={() => selectRoom(room.chatRoomId)}
                  className={`flex w-full gap-3 border-b border-outline-variant/40 px-5 py-4 text-left transition-colors ${
                    active
                      ? 'bg-slate-200/90 border-l-4 border-l-primary'
                      : hasUnread
                      ? 'bg-amber-100/70 border-l-4 border-l-amber-600 shadow-xs'
                      : 'bg-white hover:bg-slate-100'
                  }`}
                >
                  <div className="relative">
                    <Avatar name={room.buyerName} className="h-11 w-11" />
                    {hasUnread && <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-amber-500 animate-pulse" />}
                  </div>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <strong className={`truncate text-sm ${hasUnread ? 'font-black text-slate-950' : active ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                        {room.buyerName}
                      </strong>
                      <small className={`shrink-0 text-caption ${hasUnread ? 'font-bold text-amber-700' : 'text-slate-400'}`}>
                        {lastMessage ? formatTime(lastMessage.createdAt) : ''}
                      </small>
                    </span>
                    <span className={`mt-1 block truncate text-sm ${hasUnread ? 'font-bold text-slate-900' : 'font-normal text-slate-500'}`}>
                      {lastMessage?.content || 'Chưa có tin nhắn'}
                    </span>
                    {hasUnread && (
                      <span className="mt-2 inline-flex rounded-full bg-amber-600 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-white shadow-xs">
                        • Cần phản hồi
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <main className={`${selectedRoom ? 'flex' : 'hidden lg:flex'} h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-surface-container-low`}>
          {selectedRoom ? <>
            <header className="flex h-[68px] shrink-0 items-center gap-3 border-b border-outline-variant/70 bg-white px-4 sm:px-6">
              <button onClick={() => selectRoom(null)} className="rounded-lg p-2 text-primary hover:bg-primary-fixed lg:hidden" aria-label="Quay lại danh sách"><ChevronLeft size={21} /></button>
              <Avatar name={selectedRoom.buyerName} className="h-11 w-11" />
              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold text-primary">{selectedRoom.buyerName}</h2>
                <p className="mt-0.5 flex items-center gap-2 text-sm text-emerald-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>Đang hoạt động</span>
                  {isPartnerTyping && <TypingDots />}
                </p>
              </div>
              <div className="ml-auto flex items-center gap-2 text-sm">
                <span className={`h-2 w-2 rounded-full ${isSocketConnected ? 'bg-emerald-500' : 'bg-outline'}`} />
                <span className="hidden text-on-surface-variant sm:inline">{isSocketConnected ? 'Đã kết nối' : 'Đang kết nối...'}</span>
              </div>
            </header>
            <div ref={messageContainerRef} onScroll={handleScroll} className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
              <div className="mx-auto max-w-3xl space-y-4">
                {isLoadingMore && (
                  <div className="flex items-center justify-center gap-2 py-2 text-caption font-medium text-on-surface-variant">
                    <LoaderCircle className="animate-spin" size={16} />
                    <span>Đang tải tin nhắn cũ hơn...</span>
                  </div>
                )}
                {selectedRoom.messages
                  .filter((m) => m.content !== '__TYPING__' && m.content !== '__STOP_TYPING__')
                  .map((message, index, cleanMessages) => {
                    const isStaff = message.senderRole === 'ADMIN' || message.senderRole === 'STAFF';
                    const previous = cleanMessages[index - 1];
                    const showDay = !previous || formatDay(previous.createdAt) !== formatDay(message.createdAt);
                    return (
                      <div key={message.messageId}>
                        {showDay && (
                          <div className="my-6 flex items-center gap-3">
                            <span className="h-px flex-1 bg-outline-variant/60" />
                            <span className="rounded-full bg-surface-container-high px-3 py-1 text-caption font-bold tracking-wide text-on-surface-variant">
                              {formatDay(message.createdAt)}
                            </span>
                            <span className="h-px flex-1 bg-outline-variant/60" />
                          </div>
                        )}
                        <div className={`flex items-end gap-2 ${isStaff ? 'justify-end' : 'justify-start'}`}>
                          {!isStaff && <Avatar name={message.senderName} className="h-8 w-8 text-[10px]" />}
                          <div
                            className={`max-w-[85%] rounded-xl px-4 py-3 text-[15px] leading-6 shadow-sm ${
                              isStaff
                                ? 'rounded-br-sm bg-primary text-white'
                                : 'rounded-bl-sm border border-outline-variant bg-white text-on-surface'
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words">{message.content}</p>
                            <p className={`mt-1 text-right text-caption ${isStaff ? 'text-white/70' : 'text-on-surface-variant'}`}>
                              {formatTime(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                {isPartnerTyping && (
                  <div className="flex items-end gap-2 justify-start my-2 animate-fade-in">
                    <Avatar name={selectedRoom.buyerName} className="h-8 w-8 text-[10px]" />
                    <div className="rounded-xl rounded-bl-sm border border-outline-variant bg-white px-3.5 py-2.5 shadow-sm">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-primary/70 animate-bounce [animation-delay:-0.32s]" />
                        <span className="h-2 w-2 rounded-full bg-primary/70 animate-bounce [animation-delay:-0.16s]" />
                        <span className="h-2 w-2 rounded-full bg-primary/70 animate-bounce" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={lastMessageRef} />
              </div>
            </div>
            <div className="shrink-0 border-t border-outline-variant/70 bg-white p-3 sm:p-4">
              {!isSocketConnected && <p className="mb-2 flex items-center gap-1.5 text-caption text-error"><WifiOff size={14} />Không có kết nối thời gian thực; vui lòng chờ kết nối lại.</p>}
              <div className="flex items-end gap-1 rounded-xl border border-outline-variant bg-surface-container-low p-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                <button className="hidden rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-high sm:block" aria-label="Đính kèm ảnh"><ImagePlus size={21} /></button><button className="hidden rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-high sm:block" aria-label="Đính kèm tệp"><Paperclip size={21} /></button><button className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-high" aria-label="Biểu tượng cảm xúc"><Smile size={21} /></button>
                <textarea value={draft} onChange={(event) => handleDraftChange(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendMessage(); } }} rows={1} placeholder="Nhập tin nhắn..." className="max-h-28 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-on-surface-variant" />
                <button onClick={sendMessage} disabled={!draft.trim() || !isSocketConnected} className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-white transition-colors hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-40" aria-label="Gửi tin nhắn"><SendHorizontal size={20} /></button>
              </div>
            </div>
          </> : <EmptyConversation />}
        </main>

        <aside className="hidden h-full min-h-0 flex-col overflow-hidden border-l border-outline-variant/70 bg-white lg:flex">
          {selectedRoom ? <><div className="shrink-0 border-b border-outline-variant/70 px-6 py-6 text-center"><Avatar name={selectedRoom.buyerName} className="mx-auto h-16 w-16 text-base" /><h3 className="mt-3 font-bold text-primary">{selectedRoom.buyerName}</h3><p className="mt-1 text-sm text-on-surface-variant">Khách hàng</p></div><div className="space-y-5 p-6 overflow-y-auto min-h-0 flex-1"><Info label="Mã phòng" value={`#CHAT-${selectedRoom.chatRoomId}`} /><Info label="Trạng thái" value={selectedRoom.status === 'OPEN' ? 'Đang mở' : selectedRoom.status} green /><Info label="Tham gia từ" value={new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(selectedRoom.createdAt))} /></div><div className="mt-auto shrink-0 border-t border-outline-variant/70 p-5"><button className="flex w-full items-center justify-center gap-2 rounded-lg border border-outline-variant px-3 py-2.5 text-sm font-semibold text-primary hover:bg-primary-fixed"><UserRound size={17} />Xem hồ sơ khách hàng</button></div></> : null}
        </aside>
      </div>
    </section>
  );
}

function Info({ label, value, green = false }: { label: string; value: string; green?: boolean }) { return <div><p className="text-caption font-semibold uppercase tracking-wide text-on-surface-variant">{label}</p><p className={`mt-1 text-sm font-semibold ${green ? 'text-emerald-600' : 'text-on-surface'}`}>{value}</p></div>; }
function LoadingState() { return <div className="grid h-40 place-items-center text-on-surface-variant"><LoaderCircle className="animate-spin" size={24} /></div>; }
function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) { return <div className="p-6 text-center"><CircleAlert className="mx-auto text-error" size={26} /><p className="mt-3 text-sm text-on-surface-variant">{message}</p><button onClick={() => void onRetry()} className="mt-3 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white">Thử lại</button></div>; }
function EmptyList() { return <div className="p-8 text-center"><MessageSquareText className="mx-auto text-outline" size={30} /><p className="mt-3 text-sm text-on-surface-variant">Không tìm thấy cuộc trò chuyện.</p></div>; }
function EmptyConversation() { return <div className="grid h-full place-items-center p-8 text-center"><div><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary-fixed text-primary"><MessageSquareText size={30} /></div><h2 className="mt-4 text-lg font-bold text-primary">Chọn một cuộc trò chuyện</h2><p className="mt-2 text-sm text-on-surface-variant">Tin nhắn khách hàng sẽ hiển thị tại đây.</p></div></div>; }
