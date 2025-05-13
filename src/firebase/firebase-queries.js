import { auth, db } from './firebase-init'

import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'

export const createUserData = async (user) => {
  const userRef = doc(db, 'users', user.uid)
  await setDoc(
    userRef,
    {
      username: user.email,
      email: user.email,
      inventory: [
        { slot0: { item: '' } },
        { slot1: { item: '' } },
        { slot2: { item: '' } },
        { slot3: { item: '' } },
        { slot4: { item: '' } },
      ],
      created_at: new Date(),
      last_login_at: new Date(),
      user_id: user.uid,
      position: {
        x: 0,
        y: 0,
        map: 'StartZone',
      },
    },
    { merge: true }
  )
}

export const getUserData = async (uid) => {
  const userRef = doc(db, 'users', uid)
  const snap = await getDoc(userRef)

  if (!snap.exists()) {
    console.error('User data invalid')
  }
  return snap.data()
}