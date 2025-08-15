/**
 * WebSocket-based Real-time Collaboration Manager
 * 
 * This module manages real-time collaborative mathematical exploration through
 * WebSocket connections, enabling synchronized views, shared annotations, and
 * collaborative interactions across multiple users.
 */

import {
  SessionId,
  UserId,
  CollaborationSession,
  CollaborativeAction,
  CollaborativeActionType,
  SharedMathematicalState,
  SessionParticipant,
  WebSocketMessage,
  WebSocketMessageType,
  CollaborationConfig,
  CollaborationEventHandlers,
  CollaborationConflict,
  ConflictType,
  ConflictResolution,
  validateCollaborativeAction
} from './types';

/**
 * Real-time collaboration manager using WebSocket communication
 */
export class CollaborationManager {
  private websocket: WebSocket | null = null;
  private config: CollaborationConfig;
  private eventHandlers: Partial<CollaborationEventHandlers> = {};
  private currentSession: CollaborationSession | null = null;
  private currentUserId: UserId | null = null;
  private connectionRetries = 0;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private syncInterval: NodeJS.Timeout | null = null;
  private actionQueue: CollaborativeAction[] = [];
  private isConnected = false;
  private reconnectAttempts = 0;

  constructor(config: CollaborationConfig) {
    this.config = config;
  }

  // ============================================================================
  // Connection Management
  // ============================================================================

  /**
   * Initialize WebSocket connection to collaboration server
   */
  async connect(userId: UserId): Promise<boolean> {
    try {
      this.currentUserId = userId;
      
      if (this.websocket) {
        this.disconnect();
      }

      this.websocket = new WebSocket(this.config.websocketUrl);
      
      this.websocket.onopen = this.handleWebSocketOpen.bind(this);
      this.websocket.onmessage = this.handleWebSocketMessage.bind(this);
      this.websocket.onclose = this.handleWebSocketClose.bind(this);
      this.websocket.onerror = this.handleWebSocketError.bind(this);

      // Wait for connection
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 10000);

        this.websocket!.addEventListener('open', () => {
          clearTimeout(timeout);
          resolve(true);
        });

        this.websocket!.addEventListener('error', () => {
          clearTimeout(timeout);
          reject(new Error('Connection failed'));
        });
      });
    } catch (error) {
      console.error('Failed to connect to collaboration server:', error);
      this.handleError(error as Error);
      return false;
    }
  }

  /**
   * Disconnect from collaboration server
   */
  disconnect(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }

    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.eventHandlers.onConnectionChange?.(false);
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private async attemptReconnect(): Promise<void> {
    if (this.reconnectAttempts >= this.config.maxRetries) {
      console.error('Max reconnection attempts exceeded');
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;

    setTimeout(async () => {
      if (this.currentUserId) {
        console.log(`Attempting reconnection ${this.reconnectAttempts}/${this.config.maxRetries}`);
        const success = await this.connect(this.currentUserId);
        
        if (success && this.currentSession) {
          // Rejoin current session
          await this.joinSession(this.currentSession.id);
        }
      }
    }, delay);
  }

  // ============================================================================
  // WebSocket Event Handlers
  // ============================================================================

  private handleWebSocketOpen(): void {
    console.log('Connected to collaboration server');
    this.isConnected = true;
    this.reconnectAttempts = 0;
    this.connectionRetries = 0;

    // Start heartbeat
    this.startHeartbeat();
    
    // Start periodic sync
    this.startPeriodicSync();

    // Process queued actions
    this.processActionQueue();

    this.eventHandlers.onConnectionChange?.(true);
  }

  private handleWebSocketMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      this.processWebSocketMessage(message);
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  private handleWebSocketClose(event: CloseEvent): void {
    console.log('Disconnected from collaboration server:', event.reason);
    this.isConnected = false;
    this.eventHandlers.onConnectionChange?.(false);

    // Attempt reconnection if not intentional
    if (event.code !== 1000 && this.currentUserId) {
      this.attemptReconnect();
    }
  }

  private handleWebSocketError(error: Event): void {
    console.error('WebSocket error:', error);
    this.handleError(new Error('WebSocket connection error'));
  }

  // ============================================================================
  // Message Processing
  // ============================================================================

  private processWebSocketMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case WebSocketMessageType.SESSION_UPDATE:
        this.handleSessionUpdate(message.payload.session);
        break;

      case WebSocketMessageType.ACTION_BROADCAST:
        this.handleActionBroadcast(message.payload.action);
        break;

      case WebSocketMessageType.STATE_SYNC:
        this.handleStateSync(message.payload.state);
        break;

      case WebSocketMessageType.ERROR:
        this.handleError(new Error(message.payload.error));
        break;

      case WebSocketMessageType.CONFLICT:
        this.handleConflict(message.payload.conflict);
        break;

      case WebSocketMessageType.HEARTBEAT:
        // Echo heartbeat back
        this.sendMessage({
          type: WebSocketMessageType.HEARTBEAT,
          payload: {},
          timestamp: new Date().toISOString(),
          messageId: this.generateMessageId()
        });
        break;

      default:
        console.warn('Unknown message type:', message.type);
    }
  }

  private handleSessionUpdate(session: CollaborationSession): void {
    this.currentSession = session;
    console.log('Session updated:', session.id);
  }

  private handleActionBroadcast(action: CollaborativeAction): void {
    // Don't process our own actions
    if (action.userId === this.currentUserId) {
      return;
    }

    // Validate action
    if (this.currentSession && !validateCollaborativeAction(action, this.currentSession)) {
      console.warn('Invalid action received:', action);
      return;
    }

    this.eventHandlers.onAction?.(action);
  }

  private handleStateSync(state: SharedMathematicalState): void {
    console.log('State synchronized:', state.version);
    this.eventHandlers.onStateSync?.(state);
  }

  private handleConflict(conflict: CollaborationConflict): void {
    console.warn('Collaboration conflict detected:', conflict);
    this.eventHandlers.onConflict?.(conflict);
  }

  private handleError(error: Error): void {
    console.error('Collaboration error:', error);
    this.eventHandlers.onError?.(error);
  }

  // ============================================================================
  // Session Management
  // ============================================================================

  /**
   * Join a collaborative session
   */
  async joinSession(sessionId: SessionId): Promise<boolean> {
    if (!this.isConnected || !this.currentUserId) {
      throw new Error('Not connected to collaboration server');
    }

    try {
      const message: WebSocketMessage = {
        type: WebSocketMessageType.JOIN_SESSION,
        sessionId,
        userId: this.currentUserId,
        payload: {
          sessionId,
          userId: this.currentUserId
        },
        timestamp: new Date().toISOString(),
        messageId: this.generateMessageId()
      };

      this.sendMessage(message);
      
      // Wait for session update
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Join session timeout'));
        }, 5000);

        const originalHandler = this.eventHandlers.onSessionUpdate;
        this.eventHandlers.onSessionUpdate = (session) => {
          clearTimeout(timeout);
          this.eventHandlers.onSessionUpdate = originalHandler;
          resolve(true);
        };
      });
    } catch (error) {
      console.error('Failed to join session:', error);
      return false;
    }
  }

  /**
   * Leave current collaborative session
   */
  async leaveSession(): Promise<void> {
    if (!this.currentSession || !this.isConnected) {
      return;
    }

    const message: WebSocketMessage = {
      type: WebSocketMessageType.LEAVE_SESSION,
      sessionId: this.currentSession.id,
      userId: this.currentUserId!,
      payload: {
        sessionId: this.currentSession.id,
        userId: this.currentUserId
      },
      timestamp: new Date().toISOString(),
      messageId: this.generateMessageId()
    };

    this.sendMessage(message);
    this.currentSession = null;
  }

  // ============================================================================
  // Action Broadcasting
  // ============================================================================

  /**
   * Broadcast a collaborative action to all session participants
   */
  broadcastAction(action: Omit<CollaborativeAction, 'id' | 'timestamp' | 'sessionId' | 'userId'>): void {
    if (!this.currentSession || !this.currentUserId) {
      console.warn('Cannot broadcast action: not in session');
      return;
    }

    const fullAction: CollaborativeAction = {
      id: this.generateActionId(),
      sessionId: this.currentSession.id,
      userId: this.currentUserId,
      timestamp: new Date().toISOString(),
      ...action
    };

    // Validate action
    if (!validateCollaborativeAction(fullAction, this.currentSession)) {
      console.warn('Invalid action, not broadcasting:', fullAction);
      return;
    }

    if (this.isConnected) {
      const message: WebSocketMessage = {
        type: WebSocketMessageType.ACTION_BROADCAST,
        sessionId: this.currentSession.id,
        userId: this.currentUserId,
        payload: { action: fullAction },
        timestamp: fullAction.timestamp,
        messageId: this.generateMessageId()
      };

      this.sendMessage(message);
    } else {
      // Queue action for later
      this.actionQueue.push(fullAction);
    }
  }

  /**
   * Request state synchronization
   */
  requestStateSync(): void {
    if (!this.currentSession || !this.isConnected) {
      return;
    }

    const message: WebSocketMessage = {
      type: WebSocketMessageType.STATE_SYNC,
      sessionId: this.currentSession.id,
      userId: this.currentUserId!,
      payload: {
        requestSync: true
      },
      timestamp: new Date().toISOString(),
      messageId: this.generateMessageId()
    };

    this.sendMessage(message);
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  private sendMessage(message: WebSocketMessage): void {
    if (this.websocket?.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not open, message not sent:', message);
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        const message: WebSocketMessage = {
          type: WebSocketMessageType.HEARTBEAT,
          payload: {},
          timestamp: new Date().toISOString(),
          messageId: this.generateMessageId()
        };
        this.sendMessage(message);
      }
    }, this.config.heartbeatInterval);
  }

  private startPeriodicSync(): void {
    if (this.config.syncInterval > 0) {
      this.syncInterval = setInterval(() => {
        if (this.currentSession && this.isConnected) {
          this.requestStateSync();
        }
      }, this.config.syncInterval);
    }
  }

  private processActionQueue(): void {
    if (this.actionQueue.length > 0) {
      console.log(`Processing ${this.actionQueue.length} queued actions`);
      
      this.actionQueue.forEach(action => {
        const message: WebSocketMessage = {
          type: WebSocketMessageType.ACTION_BROADCAST,
          sessionId: action.sessionId,
          userId: action.userId,
          payload: { action },
          timestamp: action.timestamp,
          messageId: this.generateMessageId()
        };
        this.sendMessage(message);
      });

      this.actionQueue = [];
    }
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateActionId(): string {
    return `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ============================================================================
  // Public API
  // ============================================================================

  /**
   * Set event handlers for collaboration events
   */
  setEventHandlers(handlers: Partial<CollaborationEventHandlers>): void {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
  }

  /**
   * Get current session information
   */
  getCurrentSession(): CollaborationSession | null {
    return this.currentSession;
  }

  /**
   * Get current user ID
   */
  getCurrentUserId(): UserId | null {
    return this.currentUserId;
  }

  /**
   * Check if connected to collaboration server
   */
  isConnectedToServer(): boolean {
    return this.isConnected;
  }

  /**
   * Get list of current session participants
   */
  getSessionParticipants(): SessionParticipant[] {
    if (!this.currentSession) return [];
    return Object.values(this.currentSession.participants);
  }

  /**
   * Get queued actions count (for debugging)
   */
  getQueuedActionsCount(): number {
    return this.actionQueue.length;
  }

  // ============================================================================
  // Convenience Methods for Common Actions
  // ============================================================================

  /**
   * Broadcast view change action
   */
  broadcastViewChange(center: { x: number; y: number }, zoom: number, animated = true): void {
    this.broadcastAction({
      type: CollaborativeActionType.VIEW_CHANGE,
      payload: {
        center,
        zoom,
        animated,
        duration: animated ? 500 : 0
      }
    });
  }

  /**
   * Broadcast concept selection
   */
  broadcastConceptSelect(conceptIds: string[], mode: 'replace' | 'add' | 'toggle' = 'replace'): void {
    this.broadcastAction({
      type: CollaborativeActionType.CONCEPT_SELECT,
      payload: {
        conceptIds,
        mode,
        showDetails: true
      }
    });
  }

  /**
   * Broadcast cursor movement
   */
  broadcastCursorMove(x: number, y: number, visible = true): void {
    this.broadcastAction({
      type: CollaborativeActionType.CURSOR_MOVE,
      payload: { x, y, visible }
    });
  }

  /**
   * Broadcast annotation creation
   */
  broadcastAnnotationCreate(annotation: any): void {
    this.broadcastAction({
      type: CollaborativeActionType.ANNOTATION_CREATE,
      payload: { annotation }
    });
  }
}

/**
 * Default collaboration configuration
 */
export const defaultCollaborationConfig: CollaborationConfig = {
  websocketUrl: process.env.NEXT_PUBLIC_COLLABORATION_WS_URL || 'ws://localhost:8080/collaborate',
  maxRetries: 5,
  heartbeatInterval: 30000, // 30 seconds
  syncInterval: 60000, // 1 minute
  conflictResolutionStrategy: ConflictResolution.LAST_WRITER_WINS,
  enableRealTimeCursors: true,
  enableVoiceChat: false,
  enableScreenSharing: false,
  maxAnnotationsPerUser: 50,
  autoSaveInterval: 10000 // 10 seconds
};

/**
 * Singleton collaboration manager instance
 */
let collaborationManagerInstance: CollaborationManager | null = null;

/**
 * Get or create collaboration manager instance
 */
export function getCollaborationManager(config?: Partial<CollaborationConfig>): CollaborationManager {
  if (!collaborationManagerInstance) {
    const finalConfig = { ...defaultCollaborationConfig, ...config };
    collaborationManagerInstance = new CollaborationManager(finalConfig);
  }
  return collaborationManagerInstance;
}

/**
 * Initialize collaboration system
 */
export async function initializeCollaboration(
  userId: UserId,
  config?: Partial<CollaborationConfig>
): Promise<CollaborationManager> {
  const manager = getCollaborationManager(config);
  await manager.connect(userId);
  return manager;
}
