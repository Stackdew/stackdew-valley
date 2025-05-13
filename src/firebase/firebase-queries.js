import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth'
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
  getDocs,
  query,
  collection,
  where,
} from 'firebase/firestore'

import { auth, db } from './firebase-init'
import {
  launchGame,
  destroyGame,
  getGameInstance,
} from '../components/game/game-config'

const createEmptyInventory = () => {
  const inventory = {}
  for (let i = 0; i < 6; i++) {
    inventory[`slot${i}`] = { item: null }
  }
  return inventory
}

export const createUser = async (username, password, confirmPassword) => {
  if (password !== confirmPassword) {
    throw new Error('Passwords do not match!')
  }

  const email = `${username}@example.com`

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    )
    const user = userCredential.user

    const emptyInventory = createEmptyInventory()

    const userRef = doc(db, 'users', user.uid)
    await setDoc(userRef, {
      username,
      email: user.email,
      inventory: emptyInventory,
      created_at: serverTimestamp(),
      last_login_at: serverTimestamp(),
      user_id: user.uid,
      position: { x: 0, y: 0, map: 'StartZone' },
    })
  } catch (error) {
    throw new Error(`Signup failed: ${error.message}`)
  }
}

export const loginUser = async (username, password) => {
  try {
    const userSnapshot = await getDocs(
      query(collection(db, 'users'), where('username', '==', username))
    )

    if (userSnapshot.empty) throw new Error('User not found!')

    const email = userSnapshot.docs[0].data().email

    await signInWithEmailAndPassword(auth, email, password)
  } catch (error) {
    throw new Error(`Login failed: ${error.message}`)
  }
}

export const getCurrentUser = async () => {
  const user = auth.currentUser

  if (!user) throw new Error('No user is currently logged in')

  const userDocRef = doc(db, 'users', user.uid)
  const userDocSnap = await getDoc(userDocRef)

  if (!userDocSnap.exists()) throw new Error('User document not found')

  return userDocSnap.data()
}

export const handleAuthStateChange = async (user) => {
  const userDisplay = document.getElementById('user-display')
  const loginBtn = document.getElementById('login-btn')
  const logoutBtn = document.getElementById('logout-btn')

  if (user) {
    try {
      const userDocRef = doc(db, 'users', user.uid)
      const userDocSnap = await getDoc(userDocRef)

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data()
        userDisplay.textContent = `Logged in as: ${userData.username}`
      }

      loginBtn.style.display = 'none'
      logoutBtn.style.display = 'inline-block'
      if (!getGameInstance()) {
        launchGame()
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  } else {
    userDisplay.textContent = ''
    loginBtn.style.display = 'inline-block'
    logoutBtn.style.display = 'none'
    destroyGame()
  }
}

export const addItemToInventory = async (item) => {
  const uid = auth.currentUser?.uid
  if (!uid) return console.error('Not authenticated')

  const ref = doc(db, 'users', uid)
  const inv = (await getDoc(ref)).data()?.inventory
  const slot = Object.keys(inv || {}).find((k) => !inv[k]?.item)

  if (!slot) return console.warn('No empty slots available')

  await updateDoc(ref, { [`inventory.${slot}`]: { item } })
  console.log(`Added to ${slot}:`, item)
}

export const removeLastItemFromInventory = async () => {
  const uid = auth.currentUser?.uid
  if (!uid) return console.error('Not authenticated')

  const ref = doc(db, 'users', uid)
  const inv = (await getDoc(ref)).data()?.inventory
  const slot = Object.keys(inv || {})
    .reverse()
    .find((k) => inv[k]?.item)

  if (!slot) return console.warn('No items to remove')

  await updateDoc(ref, { [`inventory.${slot}`]: { item: null } })
  console.log(`Removed from ${slot}`)
}

export const playerMovement = async (x, y) => {
  const uid = auth.currentUser?.uid
  if (!uid) return console.error('Not authenticated')

  const userDocRef = doc(db, 'users', uid)
  try {
    await updateDoc(userDocRef, {
      position: { x, y}
    })
  } catch (err) {
    console.error('Failed to update player position:', err)
  }
}

