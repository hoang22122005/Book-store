export const chatQueryKeys = {
  all: ['chat'] as const,
  myRoom: () => [...chatQueryKeys.all, 'myRoom'] as const,
  rooms: () => [...chatQueryKeys.all, 'rooms'] as const,
  messages: (chatRoomId?: number, page?: number, size?: number) =>
    [...chatQueryKeys.all, 'messages', chatRoomId, { page, size }] as const,
};
