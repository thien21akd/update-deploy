import { readValue, setValue, updateValue, removeValue } from './databaseService';

export async function getAllUsers() {
  return readValue('users');
}

export async function updateUserRole(uid, role) {
  return updateValue(`users/${uid}/profile`, { role });
}

export async function deleteUser(uid) {
  return removeValue(`users/${uid}`);
}

export async function getGlobalCourses() {
  return readValue('courses');
}

export async function setGlobalCourses(courses) {
  return setValue('courses', courses);
}

export async function getGlobalProblems() {
  return readValue('problems');
}

export async function setGlobalProblems(problems) {
  return setValue('problems', problems);
}
