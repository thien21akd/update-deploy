/**
 * Comment Service
 * Real-time discussion on problems, lessons, code
 */

import { ref, set, update, remove, onValue, off, query, orderByChild } from 'firebase/database';
import { db } from '../lib/firebase';

/**
 * Subscribe to real-time comments on a problem
 * Listener receives array of comments sorted by newest first
 */
export function subscribeToComments(problemId, callback) {
  const commentsRef = ref(db, `problems/${problemId}/comments`);
  
  const unsubscribe = onValue(commentsRef, (snapshot) => {
    if (snapshot.exists()) {
      const commentsObj = snapshot.val();
      const comments = Object.entries(commentsObj)
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.createdAt - a.createdAt);
      callback(comments);
    } else {
      callback([]);
    }
  });

  return unsubscribe;
}

/**
 * Post a new comment
 */
export async function postComment(problemId, comment) {
  const { text, authorId, authorName, codeBlock = null, language = 'text', solved = false } = comment;

  if (!text?.trim()) {
    throw new Error('Comment không thể trống');
  }

  const commentId = `comment_${Date.now()}`;
  const commentData = {
    text,
    authorId,
    authorName,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    likes: 0,
    replies: [],
    solved,
    ...(codeBlock && { codeBlock, language }),
  };

  await set(ref(db, `problems/${problemId}/comments/${commentId}`), commentData);
  return { id: commentId, ...commentData };
}

/**
 * Update comment text
 */
export async function updateComment(problemId, commentId, newText) {
  if (!newText?.trim()) throw new Error('Nội dung comment không thể trống');

  await update(ref(db, `problems/${problemId}/comments/${commentId}`), {
    text: newText,
    updatedAt: Date.now(),
  });
}

/**
 * Delete comment
 */
export async function deleteComment(problemId, commentId) {
  await remove(ref(db, `problems/${problemId}/comments/${commentId}`));
}

/**
 * Like a comment
 */
export async function likeComment(problemId, commentId, userId) {
  const likesPath = `problems/${problemId}/comments/${commentId}/likes`;
  await update(ref(db, likesPath), {
    [userId]: true,
  });
}

/**
 * Unlike a comment
 */
export async function unlikeComment(problemId, commentId, userId) {
  await remove(ref(db, `problems/${problemId}/comments/${commentId}/likes/${userId}`));
}

/**
 * Mark comment as solution/answer
 */
export async function markAsSolution(problemId, commentId, isSolution) {
  await update(ref(db, `problems/${problemId}/comments/${commentId}`), {
    solved: isSolution,
  });
}

/**
 * Reply to a comment (nested)
 */
export async function replyToComment(problemId, commentId, reply) {
  const { text, authorId, authorName } = reply;

  const replyData = {
    text,
    authorId,
    authorName,
    createdAt: Date.now(),
    likes: 0,
  };

  const replyId = `reply_${Date.now()}`;
  await update(ref(db, `problems/${problemId}/comments/${commentId}/replies`), {
    [replyId]: replyData,
  });

  return { id: replyId, ...replyData };
}

/**
 * Get comment count for a problem
 */
export async function getCommentCount(problemId) {
  return new Promise((resolve) => {
    const unsubscribe = onValue(
      ref(db, `problems/${problemId}/comments`),
      (snapshot) => {
        resolve(snapshot.size || 0);
        unsubscribe();
      }
    );
  });
}
