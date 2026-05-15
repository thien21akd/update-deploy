/**
 * Code Snippet Service
 * Manage personal and community code snippets
 */

import { ref, set, update, remove, get, onValue } from 'firebase/database';
import { db } from '../lib/firebase';

/**
 * Save a code snippet to user's library
 */
export async function saveSnippet(uid, snippet) {
  const {
    title,
    description,
    code,
    language,
    tags = [],
    isPublic = false,
  } = snippet;

  if (!title?.trim() || !code?.trim()) {
    throw new Error('Title và code không thể trống');
  }

  const snippetId = `snippet_${Date.now()}`;
  const snippetData = {
    title,
    description: description || '',
    code,
    language: language || 'text',
    tags,
    isPublic,
    authorId: uid,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    likes: 0,
    views: 0,
  };

  await set(ref(db, `users/${uid}/snippets/${snippetId}`), snippetData);

  // If public, also add to community snippets
  if (isPublic) {
    await set(ref(db, `communitySnippets/${snippetId}`), {
      ...snippetData,
      authorName: await getDisplayName(uid),
    });
  }

  return { id: snippetId, ...snippetData };
}

/**
 * Get user's snippets
 */
export async function getUserSnippets(uid) {
  const snapshot = await get(ref(db, `users/${uid}/snippets`));
  if (!snapshot.exists()) return [];

  return Object.entries(snapshot.val())
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Subscribe to user's snippets real-time
 */
export function subscribeToUserSnippets(uid, callback) {
  const unsubscribe = onValue(ref(db, `users/${uid}/snippets`), (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }

    const snippets = Object.entries(snapshot.val())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.createdAt - a.createdAt);

    callback(snippets);
  });

  return unsubscribe;
}

/**
 * Get public/community snippets
 */
export async function searchCommunitySnippets(query = '', language = '', tags = []) {
  const snapshot = await get(ref(db, 'communitySnippets'));
  if (!snapshot.exists()) return [];

  let snippets = Object.entries(snapshot.val())
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => (b.likes || 0) - (a.likes || 0));

  // Filter by search query
  if (query) {
    snippets = snippets.filter(
      (s) =>
        s.title.toLowerCase().includes(query.toLowerCase()) ||
        s.description.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Filter by language
  if (language) {
    snippets = snippets.filter((s) => s.language === language);
  }

  // Filter by tags
  if (tags.length > 0) {
    snippets = snippets.filter((s) =>
      tags.some((tag) => s.tags?.includes(tag))
    );
  }

  return snippets.slice(0, 100); // limit results
}

/**
 * Get single snippet
 */
export async function getSnippet(snippetId, uid = null) {
  // Try user's private snippets first
  if (uid) {
    const userSnippet = await get(ref(db, `users/${uid}/snippets/${snippetId}`));
    if (userSnippet.exists()) return userSnippet.val();
  }

  // Try public snippets
  const publicSnippet = await get(ref(db, `communitySnippets/${snippetId}`));
  return publicSnippet.val() || null;
}

/**
 * Update snippet
 */
export async function updateSnippet(uid, snippetId, updates) {
  const allowedFields = ['title', 'description', 'code', 'tags'];
  const cleanUpdates = {};

  allowedFields.forEach((field) => {
    if (field in updates) {
      cleanUpdates[field] = updates[field];
    }
  });

  cleanUpdates.updatedAt = Date.now();

  await update(ref(db, `users/${uid}/snippets/${snippetId}`), cleanUpdates);

  // Update community version if public
  const snippet = await getSnippet(snippetId, uid);
  if (snippet?.isPublic) {
    await update(ref(db, `communitySnippets/${snippetId}`), cleanUpdates);
  }
}

/**
 * Delete snippet
 */
export async function deleteSnippet(uid, snippetId) {
  const snippet = await getSnippet(snippetId, uid);

  await remove(ref(db, `users/${uid}/snippets/${snippetId}`));

  if (snippet?.isPublic) {
    await remove(ref(db, `communitySnippets/${snippetId}`));
  }
}

/**
 * Like/unlike a community snippet
 */
export async function toggleSnippetLike(snippetId, userId) {
  const likePath = `communitySnippets/${snippetId}/likes`;
  const snippet = await get(ref(db, likePath));

  if (snippet.exists() && snippet.val()[userId]) {
    // Unlike
    await remove(ref(db, `${likePath}/${userId}`));
  } else {
    // Like
    await set(ref(db, `${likePath}/${userId}`), true);
  }
}

/**
 * Increment view count
 */
export async function incrementSnippetViews(snippetId) {
  const viewPath = `communitySnippets/${snippetId}/views`;
  const current = await get(ref(db, viewPath));
  await set(ref(db, viewPath), (current.val() || 0) + 1);
}

/**
 * Get trending snippets (most liked)
 */
export async function getTrendingSnippets(limit = 10) {
  const snippets = await searchCommunitySnippets();
  return snippets.slice(0, limit);
}

/**
 * Get helper for display name
 */
async function getDisplayName(uid) {
  const snapshot = await get(ref(db, `users/${uid}/profile/displayName`));
  return snapshot.val() || 'Anonymous';
}
