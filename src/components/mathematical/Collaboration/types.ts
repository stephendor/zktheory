/**
 * Types for Real-time Collaborative Mathematical Exploration
 * 
 * This module defines the type system for enabling multiple users to collaboratively
 * explore mathematical concepts with synchronized views, shared annotations, and 
 * real-time updates across the mathematical visualization platform.
 */

import { MathematicalConcept, ConceptRelationship } from '../ConceptMapping/types';

// ============================================================================
// Core Collaboration Types
// ============================================================================

/**
 * Unique identifier for a collaboration session
 */
export type SessionId = string;

/**
 * Unique identifier for a collaborative user
 */
export type UserId = string;

/**
 * Unique identifier for a collaborative action/event
 */
export type ActionId = string;

/**
 * Timestamp for collaboration events (ISO 8601 format)
 */
export type Timestamp = string;

// ============================================================================
// User Management
// ============================================================================

/**
 * Represents a user participating in collaborative mathematical exploration
 */
export interface CollaborativeUser {
  id: UserId;
  name: string;
  email?: string;
  color: string; // Unique color for user identification in shared views
  avatar?: string;
  isActive: boolean;
  lastSeen: Timestamp;
  cursor?: {
    x: number;
    y: number;
    visible: boolean;
  };
  currentFocus?: {
    conceptId?: string;
    type: 'concept' | 'relationship' | 'annotation' | 'visualization';
  };
}

/**
 * User permissions within a collaborative session
 */
export enum UserRole {
  HOST = 'host',       // Full control over session
  EDITOR = 'editor',   // Can edit and annotate
  VIEWER = 'viewer',   // Read-only access
  GUEST = 'guest'      // Limited temporary access
}

/**
 * User with assigned role and permissions
 */
export interface SessionParticipant extends CollaborativeUser {
  role: UserRole;
  joinedAt: Timestamp;
  permissions: {
    canEdit: boolean;
    canAnnotate: boolean;
    canInvite: boolean;
    canExport: boolean;
  };
}

// ============================================================================
// Collaboration Session
// ============================================================================

/**
 * Configuration for a collaborative mathematical exploration session
 */
export interface CollaborationSession {
  id: SessionId;
  title: string;
  description?: string;
  hostUserId: UserId;
  participants: Record<UserId, SessionParticipant>;
  createdAt: Timestamp;
  lastActivity: Timestamp;
  isActive: boolean;
  settings: {
    maxParticipants: number;
    allowGuestAccess: boolean;
    requireApproval: boolean;
    autoSave: boolean;
    syncLevel: 'real-time' | 'periodic' | 'manual';
  };
  sharedState: SharedMathematicalState;
}

/**
 * Shared mathematical exploration state across all participants
 */
export interface SharedMathematicalState {
  // Current visualization state
  currentView: {
    type: 'concept-mapping' | 'elliptic-curve' | 'topology' | 'algebra';
    center: { x: number; y: number };
    zoom: number;
    rotation?: number;
    activeFilters: string[];
  };
  
  // Selected concepts and relationships
  selectedConcepts: string[];
  selectedRelationships: string[];
  
  // Shared annotations and notes
  annotations: CollaborativeAnnotation[];
  
  // Mathematical exploration path
  explorationPath: ExplorationStep[];
  
  // Synchronized mathematical calculations
  sharedCalculations: SharedCalculation[];
  
  // Version for conflict resolution
  version: number;
  lastModified: Timestamp;
  lastModifiedBy: UserId;
}

// ============================================================================
// Real-time Actions and Events
// ============================================================================

/**
 * Types of collaborative actions that can be synchronized
 */
export enum CollaborativeActionType {
  // View synchronization
  VIEW_CHANGE = 'view_change',
  ZOOM_CHANGE = 'zoom_change',
  PAN_CHANGE = 'pan_change',
  
  // Concept selection and manipulation
  CONCEPT_SELECT = 'concept_select',
  CONCEPT_DESELECT = 'concept_deselect',
  CONCEPT_HIGHLIGHT = 'concept_highlight',
  CONCEPT_FOCUS = 'concept_focus',
  
  // Relationship exploration
  RELATIONSHIP_TRACE = 'relationship_trace',
  RELATIONSHIP_HIGHLIGHT = 'relationship_highlight',
  
  // Annotations and notes
  ANNOTATION_CREATE = 'annotation_create',
  ANNOTATION_UPDATE = 'annotation_update',
  ANNOTATION_DELETE = 'annotation_delete',
  
  // Mathematical calculations
  CALCULATION_START = 'calculation_start',
  CALCULATION_UPDATE = 'calculation_update',
  CALCULATION_COMPLETE = 'calculation_complete',
  
  // User presence
  CURSOR_MOVE = 'cursor_move',
  USER_JOIN = 'user_join',
  USER_LEAVE = 'user_leave',
  USER_TYPING = 'user_typing',
  
  // Session management
  SESSION_STATE_SYNC = 'session_state_sync',
  CONFLICT_RESOLUTION = 'conflict_resolution'
}

/**
 * Base structure for all collaborative actions
 */
export interface CollaborativeAction {
  id: ActionId;
  type: CollaborativeActionType;
  sessionId: SessionId;
  userId: UserId;
  timestamp: Timestamp;
  payload: Record<string, any>;
  metadata?: {
    clientVersion: string;
    networkLatency?: number;
    priority: 'high' | 'medium' | 'low';
  };
}

/**
 * Specific action types with typed payloads
 */
export interface ViewChangeAction extends CollaborativeAction {
  type: CollaborativeActionType.VIEW_CHANGE;
  payload: {
    center: { x: number; y: number };
    zoom: number;
    duration?: number;
    animated: boolean;
  };
}

export interface ConceptSelectAction extends CollaborativeAction {
  type: CollaborativeActionType.CONCEPT_SELECT;
  payload: {
    conceptIds: string[];
    mode: 'replace' | 'add' | 'toggle';
    showDetails: boolean;
  };
}

export interface AnnotationCreateAction extends CollaborativeAction {
  type: CollaborativeActionType.ANNOTATION_CREATE;
  payload: {
    annotation: CollaborativeAnnotation;
  };
}

export interface CursorMoveAction extends CollaborativeAction {
  type: CollaborativeActionType.CURSOR_MOVE;
  payload: {
    x: number;
    y: number;
    visible: boolean;
  };
}

// ============================================================================
// Collaborative Annotations
// ============================================================================

/**
 * Types of mathematical annotations in collaborative context
 */
export enum AnnotationType {
  NOTE = 'note',                    // Text notes
  PROOF_SKETCH = 'proof_sketch',    // Mathematical proof outlines
  CALCULATION = 'calculation',      // Step-by-step calculations
  QUESTION = 'question',            // Questions and discussions
  INSIGHT = 'insight',              // Mathematical insights and connections
  DIAGRAM = 'diagram',              // Hand-drawn mathematical diagrams
  FORMULA = 'formula',              // Mathematical formulas and equations
  EXAMPLE = 'example'               // Concrete examples and counterexamples
}

/**
 * Collaborative annotation with real-time editing support
 */
export interface CollaborativeAnnotation {
  id: string;
  type: AnnotationType;
  title: string;
  content: string;
  position: {
    x: number;
    y: number;
    anchor?: 'concept' | 'relationship' | 'calculation';
    anchorId?: string;
  };
  author: UserId;
  createdAt: Timestamp;
  lastModified: Timestamp;
  lastModifiedBy: UserId;
  tags: string[];
  isShared: boolean;
  visibility: 'public' | 'private' | 'role-restricted';
  style: {
    color: string;
    fontSize: number;
    backgroundColor?: string;
    borderColor?: string;
  };
  replies?: AnnotationReply[];
  version: number;
}

/**
 * Reply to a collaborative annotation
 */
export interface AnnotationReply {
  id: string;
  parentAnnotationId: string;
  content: string;
  author: UserId;
  createdAt: Timestamp;
  lastModified: Timestamp;
}

// ============================================================================
// Mathematical Exploration Path
// ============================================================================

/**
 * Represents a step in the collaborative mathematical exploration
 */
export interface ExplorationStep {
  id: string;
  title: string;
  description?: string;
  conceptIds: string[];
  relationshipIds: string[];
  viewState: {
    center: { x: number; y: number };
    zoom: number;
    filters: string[];
  };
  annotations: string[]; // Annotation IDs associated with this step
  calculations: string[]; // Calculation IDs for this step
  timestamp: Timestamp;
  author: UserId;
  duration?: number; // Time spent on this step (milliseconds)
}

/**
 * Complete exploration path with branching support
 */
export interface ExplorationPath {
  id: string;
  title: string;
  steps: ExplorationStep[];
  branches?: ExplorationBranch[];
  currentStepId: string;
  collaborators: UserId[];
  isLinear: boolean;
}

/**
 * Branching point in exploration path for different approaches
 */
export interface ExplorationBranch {
  id: string;
  title: string;
  description?: string;
  branchPoint: string; // Step ID where branch diverges
  steps: ExplorationStep[];
  author: UserId;
  createdAt: Timestamp;
}

// ============================================================================
// Shared Mathematical Calculations
// ============================================================================

/**
 * Types of mathematical calculations that can be shared
 */
export enum CalculationType {
  ALGEBRAIC = 'algebraic',
  GEOMETRIC = 'geometric',
  TOPOLOGICAL = 'topological',
  NUMERICAL = 'numerical',
  SYMBOLIC = 'symbolic',
  PROOF = 'proof'
}

/**
 * Shared mathematical calculation with step-by-step tracking
 */
export interface SharedCalculation {
  id: string;
  title: string;
  type: CalculationType;
  description?: string;
  steps: CalculationStep[];
  result?: CalculationResult;
  relatedConcepts: string[];
  author: UserId;
  collaborators: UserId[];
  createdAt: Timestamp;
  lastModified: Timestamp;
  isCompleted: boolean;
  version: number;
}

/**
 * Individual step in a mathematical calculation
 */
export interface CalculationStep {
  id: string;
  content: string;
  formula?: string; // LaTeX or MathML format
  justification?: string;
  author: UserId;
  timestamp: Timestamp;
  isVerified: boolean;
  verifiedBy?: UserId[];
}

/**
 * Result of a mathematical calculation
 */
export interface CalculationResult {
  value: string | number | Record<string, any>;
  formula?: string;
  interpretation: string;
  confidence: number; // 0-1 confidence score
  verificationStatus: 'unverified' | 'peer-verified' | 'expert-verified';
}

// ============================================================================
// Conflict Resolution
// ============================================================================

/**
 * Types of conflicts that can occur in collaborative sessions
 */
export enum ConflictType {
  CONCURRENT_EDIT = 'concurrent_edit',
  STATE_DIVERGENCE = 'state_divergence',
  VERSION_MISMATCH = 'version_mismatch',
  PERMISSION_VIOLATION = 'permission_violation'
}

/**
 * Conflict resolution strategy
 */
export enum ConflictResolution {
  LAST_WRITER_WINS = 'last_writer_wins',
  MERGE_CHANGES = 'merge_changes',
  USER_CHOICE = 'user_choice',
  ROLLBACK = 'rollback'
}

/**
 * Conflict detected in collaborative session
 */
export interface CollaborationConflict {
  id: string;
  type: ConflictType;
  sessionId: SessionId;
  conflictingActions: CollaborativeAction[];
  detectedAt: Timestamp;
  resolution?: ConflictResolution;
  resolvedAt?: Timestamp;
  resolvedBy?: UserId;
  description: string;
}

// ============================================================================
// WebSocket Communication
// ============================================================================

/**
 * WebSocket message types for real-time collaboration
 */
export enum WebSocketMessageType {
  // Connection management
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  HEARTBEAT = 'heartbeat',
  
  // Session management
  JOIN_SESSION = 'join_session',
  LEAVE_SESSION = 'leave_session',
  SESSION_UPDATE = 'session_update',
  
  // Real-time actions
  ACTION_BROADCAST = 'action_broadcast',
  STATE_SYNC = 'state_sync',
  
  // Error handling
  ERROR = 'error',
  CONFLICT = 'conflict'
}

/**
 * WebSocket message structure
 */
export interface WebSocketMessage {
  type: WebSocketMessageType;
  sessionId?: SessionId;
  userId?: UserId;
  payload: Record<string, any>;
  timestamp: Timestamp;
  messageId: string;
}

// ============================================================================
// Utility Types and Functions
// ============================================================================

/**
 * Configuration for collaboration features
 */
export interface CollaborationConfig {
  websocketUrl: string;
  maxRetries: number;
  heartbeatInterval: number;
  syncInterval: number;
  conflictResolutionStrategy: ConflictResolution;
  enableRealTimeCursors: boolean;
  enableVoiceChat: boolean;
  enableScreenSharing: boolean;
  maxAnnotationsPerUser: number;
  autoSaveInterval: number;
}

/**
 * Event handlers for collaboration events
 */
export interface CollaborationEventHandlers {
  onUserJoin: (user: SessionParticipant) => void;
  onUserLeave: (userId: UserId) => void;
  onStateSync: (state: SharedMathematicalState) => void;
  onAction: (action: CollaborativeAction) => void;
  onConflict: (conflict: CollaborationConflict) => void;
  onError: (error: Error) => void;
  onConnectionChange: (connected: boolean) => void;
  onSessionUpdate: (session: CollaborationSession) => void;
}

/**
 * Utility function to create a new collaborative user
 */
export function createCollaborativeUser(
  id: UserId,
  name: string,
  email?: string
): CollaborativeUser {
  return {
    id,
    name,
    email,
    color: generateUserColor(id),
    isActive: true,
    lastSeen: new Date().toISOString()
  };
}

/**
 * Utility function to generate a unique color for a user
 */
function generateUserColor(userId: UserId): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
    '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
    '#C44569', '#F8B500', '#78E08F', '#60A3BC', '#EE5A24'
  ];
  
  // Simple hash function to consistently assign colors
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash + userId.charCodeAt(i)) & 0xffffffff;
  }
  
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Utility function to check if user has permission for an action
 */
export function hasPermission(
  participant: SessionParticipant,
  action: CollaborativeActionType
): boolean {
  switch (action) {
    case CollaborativeActionType.ANNOTATION_CREATE:
    case CollaborativeActionType.ANNOTATION_UPDATE:
    case CollaborativeActionType.ANNOTATION_DELETE:
      return participant.permissions.canAnnotate;
    
    case CollaborativeActionType.CONCEPT_SELECT:
    case CollaborativeActionType.VIEW_CHANGE:
    case CollaborativeActionType.CALCULATION_START:
      return participant.permissions.canEdit;
    
    default:
      return true; // Allow read-only actions by default
  }
}

/**
 * Utility function to validate collaboration action
 */
export function validateCollaborativeAction(
  action: CollaborativeAction,
  session: CollaborationSession
): boolean {
  const participant = session.participants[action.userId];
  if (!participant) return false;
  
  if (!participant.isActive) return false;
  
  return hasPermission(participant, action.type);
}
