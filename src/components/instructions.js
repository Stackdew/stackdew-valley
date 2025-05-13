export const setupInstructionsModal = () => {
  const modalHTML = `
  <div id="instructions-section">
    <div id="instructions-modal" class="modal">
      <div class="modal-content">
        <span id="close-instructions-modal" class="close-btn">&times;</span>
        <div id="instructions-content">
          <section class="instructions-section">
            <h2>Instructions</h2>
            <p>
              Welcome to <strong>Stack Dew Valley</strong>.<br><br>
              You have been given a lucrative job working for the Southcoders Coding School in the countryside.
              Your mission, should you choose to accept it, is to receive a new intake of devlings thirsting for knowledge. 
              Plant the devlings in your devling patch and water them with all the knowledge of coding they will need in order to succeed in the job market. 
              Once your devlings have learned all they can, you must harvest and take them to the dreaded job arena where they will battle it out 
              with devlings from the insidious Eastcoders Bootcamp to win the ultimate prize: a job in the tech industry—spending their days tapping 
              away at a keyboard in the pursuit of the most noble goal: creating the ultimate piece of code. 
              <br><br>
              <strong>Gameplay:</strong><br>
              - When the game starts, go to your laptop and collect the first intake of devlings.<br>
              - Take them to the devling patch.<br>
              - Move your player using the <strong>arrow keys</strong>.<br>
              - Interact with the laptop using the <strong>space bar</strong>.<br>
              - Once planted, water your devlings with knowledge.<br><br>
              Be careful! If your devlings use AI too many times, they will be sent to the <em>Tech Dungeon</em>, where they can only be freed by solving coding tests 
              without AI or by discovering the identity of the eternal "Mitch".<br><br>
              Once your devlings have been harvested, take them to the job market and battle against the Eastcoders.<br><br>
              <strong>Good Luck!</strong><br><br>
              <em>Upcoming Features:</em><br>
              - Programming problems for devlings to solve<br>
              - More complex game mechanics for fight sequences<br>
              - Customisable characters
            </p>
          </section>
        </div>
      </div>
    </div>
  </div>
`

  document.body.insertAdjacentHTML('beforeend', modalHTML)

  const instructionModal = document.getElementById('instructions-modal')
  const closeBtn = document.getElementById('close-instructions-modal')

  closeBtn.addEventListener('click', () => {
    instructionModal.style.display = 'none'
  })

  window.addEventListener('click', (e) => {
    if (e.target === instructionModal) {
      instructionModal.style.display = 'none'
    }
  })

  const instructionLink = document.querySelector('a[href="#instructions"]')
  if (instructionLink) {
    instructionLink.addEventListener('click', (e) => {
      e.preventDefault()
      instructionModal.style.display = 'block'
    })
  }
}
