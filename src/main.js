import './style.css'

import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

import { setupAuthModal } from './components/auth'
import { auth, db } from './firebase/firebase-init'
import {
  launchGame,
  destroyGame,
  getGameInstance,
} from './components/game/game-config'

document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.createElement('nav')
  navbar.classList.add('navbar')
  navbar.innerHTML = `
    <ul class="navbar-left">
      <li><a href="#home">Home</a></li>
      <li><a href="#about">About</a></li>
  </ul>
  <ul class="navbar-right">
      <li><span id="user-display" style="color:white;"></span></li>
      <li><button id="login-btn">Login</button></li>
      <li><button id="logout-btn" style="display: none;">Logout</button></li>
  </ul>
    `

  const app = document.getElementById('app')
  app.appendChild(navbar)

  setupAuthModal()

  onAuthStateChanged(auth, async (user) => {
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
  })
})

document.addEventListener('click', async (e) => {
  if (e.target.id === 'logout-btn') {
    try {
      await signOut(auth)
      document.getElementById('user-display').textContent = ''
      alert('Successfully logged out')
    } catch (error) {
      console.error('Logout error:', error)
      alert(`Logout failed: ${error.message}`)
    }
  }
})
