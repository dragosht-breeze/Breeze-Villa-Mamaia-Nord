export type CommunicationChannel = "website" | "messenger" | "whatsapp" | "email" | "booking" | "manual";
export type ConversationMode = "ai" | "operator";
export type ConversationStatus = "open" | "closed";
export type MessageDirection = "inbound" | "outbound";
export type MessageAuthor = "guest" | "ai" | "operator" | "system";

export type UnifiedMessage = {
  id: string;
  conversationId: string;
  channel: CommunicationChannel;
  direction: MessageDirection;
  author: MessageAuthor;
  text: string;
  createdAt: string;
  externalId?: string;
};

export type UnifiedConversation = {
  id: string;
  displayName: string;
  channel: CommunicationChannel;
  channelIdentity: string;
  mode: ConversationMode;
  status: ConversationStatus;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  lastMessage?: string;
  messages: UnifiedMessage[];
  metadata?: Record<string, string | number | boolean | null>;
};

export type ConversationStore = {
  version: 1;
  conversations: UnifiedConversation[];
};

export type AddMessageInput = {
  conversationId?: string;
  channel: CommunicationChannel;
  channelIdentity: string;
  displayName?: string;
  direction: MessageDirection;
  author: MessageAuthor;
  text: string;
  externalId?: string;
  metadata?: Record<string, string | number | boolean | null>;
};
