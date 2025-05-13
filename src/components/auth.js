import {
  createUser,
  loginUser,
} from '../firebase/firebase-queries'

export const setupAuthModal = () => {
  const modal = `
        <div id="auth-modal" class="modal">
            <div class="modal-content">
                <span id="close-modal" class="close-btn">&times;</span>
                <div id="auth-forms">
                    <div id="login-form">
                        <h2>Login</h2>
                        <form id="login">
                            <label for="username">Username:</label>
                            <input type="text" id="username" name="username" required />
                            <label for="password">Password:</label>
                            <input type="password" id="password" name="password" required />
                            <button type="submit">Login</button>
                        </form>
                        <p>Don't have an account? <span id="show-signup">Sign up here</span></p>
                    </div>
                    <div id="signup-form" style="display: none;">
                        <h2>Sign Up</h2>
                        <form id="signup">
                            <label for="new-username">Username:</label>
                            <input type="text" id="new-username" name="new-username" required />
                            <label for="new-password">Password:</label>
                            <input type="password" id="new-password" name="new-password" required />
                            <label for="confirm-password">Confirm Password:</label>
                            <input type="password" id="confirm-password" name="confirm-password" required />
                            <button type="submit">Sign Up</button>
                        </form>
                        <p>Already have an account? <span id="show-login">Login here</span></p>
                    </div>
                </div>
            </div>
        </div>
    `

  const app = document.getElementById('app')
  app.innerHTML += modal

  const modalElement = document.getElementById('auth-modal')
  const closeModalButton = document.getElementById('close-modal')
  const loginButton = document.getElementById('login-btn')
  const loginForm = document.getElementById('login')
  const signupForm = document.getElementById('signup')
  const showSignupButton = document.getElementById('show-signup')
  const showLoginButton = document.getElementById('show-login')

  loginButton.addEventListener('click', () => {
    modalElement.style.display = 'block'
  })

  closeModalButton.addEventListener('click', () => {
    modalElement.style.display = 'none'
  })

  window.addEventListener('click', (event) => {
    if (event.target === modalElement) {
      modalElement.style.display = 'none'
    }
  })

  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault()

    const username = document.getElementById('username').value
    const password = document.getElementById('password').value

    try {
      await loginUser(username, password)

      alert('Logged in successfully!')
      modalElement.style.display = 'none'
    } catch (error) {
      alert(error.message)
    }
  })

  signupForm.addEventListener('submit', async function (e) {
    e.preventDefault()
    const username = document.getElementById('new-username').value
    const password = document.getElementById('new-password').value
    const confirmPassword = document.getElementById('confirm-password').value

    if (password !== confirmPassword) {
      alert('Passwords do not match!')
      return
    }

    try {
      await createUser(username, password, confirmPassword)

      alert('Signed up successfully!')
      modalElement.style.display = 'none'
    } catch (error) {
      alert(`Signup failed: ${error.message}`)
    }
  })

  showSignupButton.addEventListener('click', () => {
    document.getElementById('login-form').style.display = 'none'
    document.getElementById('signup-form').style.display = 'block'
  })

  showLoginButton.addEventListener('click', () => {
    document.getElementById('signup-form').style.display = 'none'
    document.getElementById('login-form').style.display = 'block'
  })
}
