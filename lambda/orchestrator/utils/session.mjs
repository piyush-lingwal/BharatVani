/**
 * BharatVani — Session Manager
 * DynamoDB CRUD for conversation sessions
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const SESSIONS_TABLE = process.env.SESSIONS_TABLE || 'BharatVani-Sessions';
const USERS_TABLE = process.env.USERS_TABLE || 'BharatVani-Users';
const SESSION_TTL_HOURS = 24;

/**
 * Create a new session when a call begins
 */
export async function createSession(phoneNumber) {
  const sessionId = randomUUID();
  const now = new Date().toISOString();
  const ttl = Math.floor(Date.now() / 1000) + (SESSION_TTL_HOURS * 3600);

  const session = {
    session_id: sessionId,
    phone_number: phoneNumber,
    language: 'hi-IN', // default Hindi, updated on first utterance
    started_at: now,
    last_active: now,
    conversation_history: [],
    current_intent: null,
    current_module: null,
    module_state: {},
    verified: false,
    otp_attempts: 0,
    ttl: ttl
  };

  await docClient.send(new PutCommand({
    TableName: SESSIONS_TABLE,
    Item: session
  }));

  // Check if returning user
  const user = await getUser(phoneNumber);

  return { session, user };
}

/**
 * Load an existing session
 */
export async function getSession(sessionId) {
  const result = await docClient.send(new GetCommand({
    TableName: SESSIONS_TABLE,
    Key: { session_id: sessionId }
  }));

  return result.Item || null;
}

/**
 * Update session with new conversation turn
 */
export async function updateSession(sessionId, updates) {
  const now = new Date().toISOString();

  // Build update expression dynamically
  const expressionParts = ['#last_active = :now'];
  const expressionNames = { '#last_active': 'last_active' };
  const expressionValues = { ':now': now };

  for (const [key, value] of Object.entries(updates)) {
    const attrName = `#${key}`;
    const attrValue = `:${key}`;
    expressionParts.push(`${attrName} = ${attrValue}`);
    expressionNames[attrName] = key;
    expressionValues[attrValue] = value;
  }

  await docClient.send(new UpdateCommand({
    TableName: SESSIONS_TABLE,
    Key: { session_id: sessionId },
    UpdateExpression: `SET ${expressionParts.join(', ')}`,
    ExpressionAttributeNames: expressionNames,
    ExpressionAttributeValues: expressionValues
  }));
}

/**
 * Add a conversation turn to session history
 */
export async function addToHistory(sessionId, role, text) {
  const newEntry = { role, text, timestamp: new Date().toISOString() };

  try {
    // Use list_append — single DynamoDB call instead of GET + UPDATE
    await docClient.send(new UpdateCommand({
      TableName: SESSIONS_TABLE,
      Key: { session_id: sessionId },
      UpdateExpression: 'SET conversation_history = list_append(if_not_exists(conversation_history, :empty), :newItem), #la = :now',
      ExpressionAttributeNames: { '#la': 'last_active' },
      ExpressionAttributeValues: {
        ':newItem': [newEntry],
        ':empty': [],
        ':now': new Date().toISOString()
      }
    }));
  } catch (err) {
    console.warn('addToHistory failed (non-fatal):', err.message);
  }

  return [newEntry];
}

/**
 * Get or create user profile
 */
export async function getUser(phoneNumber) {
  const result = await docClient.send(new GetCommand({
    TableName: USERS_TABLE,
    Key: { phone_number: phoneNumber }
  }));

  return result.Item || null;
}

/**
 * Create or update user profile
 */
export async function upsertUser(phoneNumber, updates) {
  const existing = await getUser(phoneNumber);

  if (existing) {
    const expressionParts = [];
    const expressionNames = {};
    const expressionValues = {};

    for (const [key, value] of Object.entries(updates)) {
      expressionParts.push(`#${key} = :${key}`);
      expressionNames[`#${key}`] = key;
      expressionValues[`:${key}`] = value;
    }

    if (expressionParts.length > 0) {
      await docClient.send(new UpdateCommand({
        TableName: USERS_TABLE,
        Key: { phone_number: phoneNumber },
        UpdateExpression: `SET ${expressionParts.join(', ')}`,
        ExpressionAttributeNames: expressionNames,
        ExpressionAttributeValues: expressionValues
      }));
    }
  } else {
    await docClient.send(new PutCommand({
      TableName: USERS_TABLE,
      Item: {
        phone_number: phoneNumber,
        language_preference: 'hi-IN',
        created_at: new Date().toISOString(),
        ...updates
      }
    }));
  }
}
