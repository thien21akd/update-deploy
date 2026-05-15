/**
 * useNewFeatures.js
 * Hook to manage all new features (paths, comments, profiles, snippets, notifications)
 */

import { useState, useEffect } from 'react';
import {
  subscribeToComments,
  postComment,
  deleteComment,
} from '../services/commentService';

import {
  subscribeToProfile,
  updateProfile,
  getUserStats,
} from '../services/profileService';

import {
  getFollowing,
  getFollowers,
  subscribeToActivityFeed,
  followUser,
  unfollowUser,
} from '../services/followService';

import {
  subscribeToUserSnippets,
  saveSnippet,
  deleteSnippet,
} from '../services/snippetService';

import {
  getNotificationPreferences,
  subscribeToNotificationPreferences,
  updateNotificationSettings,
} from '../services/notificationService';

export function useNewFeatures(uid) {
  // Comments
  const [commentsByProblem, setCommentsByProblem] = useState({});

  // Profile
  const [userProfile, setUserProfile] = useState(null);
  const [userStats, setUserStats] = useState(null);

  // Following
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);

  // Snippets
  const [snippets, setSnippets] = useState([]);

  // Notifications
  const [notificationPrefs, setNotificationPrefs] = useState(null);

  // Subscribe to profile
  useEffect(() => {
    if (!uid) return;

    const unsubscribe = subscribeToProfile(uid, (profile) => {
      setUserProfile(profile);
    });

    return unsubscribe;
  }, [uid]);

  // Load user stats
  useEffect(() => {
    if (!uid) return;

    const loadStats = async () => {
      try {
        const stats = await getUserStats(uid);
        setUserStats(stats);
      } catch (error) {
        console.error('Error loading user stats:', error);
      }
    };

    loadStats();
  }, [uid]);

  // Subscribe to activity feed
  useEffect(() => {
    if (!uid) return;

    const unsubscribe = subscribeToActivityFeed(uid, (activities) => {
      setActivityFeed(activities);
    });

    return unsubscribe;
  }, [uid]);

  // Subscribe to snippets
  useEffect(() => {
    if (!uid) return;

    const unsubscribe = subscribeToUserSnippets(uid, (snippetList) => {
      setSnippets(snippetList);
    });

    return unsubscribe;
  }, [uid]);

  // Subscribe to notification preferences
  useEffect(() => {
    if (!uid) return;

    const unsubscribe = subscribeToNotificationPreferences(uid, (prefs) => {
      setNotificationPrefs(prefs);
    });

    return unsubscribe;
  }, [uid]);

  // Methods
  const subscribeToCommentsByProblem = async (problemId, callback) => {
    return subscribeToComments(problemId, callback);
  };

  const handlePostComment = async (problemId, comment) => {
    try {
      return await postComment(problemId, comment);
    } catch (error) {
      console.error('Error posting comment:', error);
      throw error;
    }
  };

  const handleDeleteComment = async (problemId, commentId) => {
    try {
      return await deleteComment(problemId, commentId);
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  };

  const handleUpdateProfile = async (profileData) => {
    try {
      return await updateProfile(uid, profileData);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const handleFollowUser = async (targetUid) => {
    try {
      await followUser(uid, targetUid);
    } catch (error) {
      console.error('Error following user:', error);
      throw error;
    }
  };

  const handleUnfollowUser = async (targetUid) => {
    try {
      await unfollowUser(uid, targetUid);
    } catch (error) {
      console.error('Error unfollowing user:', error);
      throw error;
    }
  };

  const handleSaveSnippet = async (snippet) => {
    try {
      return await saveSnippet(uid, snippet);
    } catch (error) {
      console.error('Error saving snippet:', error);
      throw error;
    }
  };

  const handleDeleteSnippet = async (snippetId) => {
    try {
      return await deleteSnippet(uid, snippetId);
    } catch (error) {
      console.error('Error deleting snippet:', error);
      throw error;
    }
  };

  const handleUpdateNotifications = async (settings) => {
    try {
      return await updateNotificationSettings(uid, settings);
    } catch (error) {
      console.error('Error updating notifications:', error);
      throw error;
    }
  };

  return {
    // Comments
    commentsByProblem,
    subscribeToCommentsByProblem,
    postComment: handlePostComment,
    deleteComment: handleDeleteComment,

    // Profile
    userProfile,
    userStats,
    updateProfile: handleUpdateProfile,

    // Following
    following,
    followers,
    activityFeed,
    followUser: handleFollowUser,
    unfollowUser: handleUnfollowUser,

    // Snippets
    snippets,
    saveSnippet: handleSaveSnippet,
    deleteSnippet: handleDeleteSnippet,

    // Notifications
    notificationPrefs,
    updateNotifications: handleUpdateNotifications,
  };
}
