const generateTeamProfiles = (team) => {
  return team
    .map(
      (dev) => `
      <div class="team-member">
        <img src="https://avatars.githubusercontent.com/${dev.github}" alt="${dev.name}" class="avatar" />
        <h3>${dev.name}</h3>
        <a href="https://github.com/${dev.github}" target="_blank">GitHub</a>
      </div>
    `
    )
    .join('')
}

export const setupAboutModal = () => {
  const modal = `
  <div id="about-modal" class="modal">
    <div class="modal-content">
      <span id="close-about-modal" class="close-btn">&times;</span>
      <div id="about-content">
        
        <section class="about-section">
          <h2>Meet the Team</h2>
          <div class="team-grid">
            ${generateTeamProfiles([
              { name: 'Chris Askew', github: 'slightly76' },
              { name: 'Tymur Holovko', github: 'papaparadox' },
              { name: 'Sophie Thompson', github: 'sophtompa' },
              { name: 'Paul McDonagh', github: 'testmango-sudo' },
              { name: "Ken'Terria Reaves", github: 'MuseOfCode' },
              { name: 'Dean Wilson', github: 'notyourimaginarycoder' },
            ])}
          </div>
        </section>

        <br/>
        <hr/>

        <section class="about-section">
          <h2>Tech Stack</h2>
          <div class="logo-grid">
            <div class="logo-item">
              <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" alt="JavaScript">
              <span>JavaScript</span>
            </div>
            <div class="logo-item">
              <img src="https://cdn.phaser.io/images/logo/logo-download-vector.png" alt="Phaser">
              <span>Phaser</span>
            </div>
            <div class="logo-item">
              <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vite/vite-original.svg" alt="Vite">
              <span>Vite</span>
            </div>
            <div class="logo-item">
              <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" alt="HTML5">
              <span>HTML5</span>
            </div>
            <div class="logo-item">
              <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg" alt="Firebase">
              <span>Firebase</span>
            </div>
          </div>
        </section>

      </div>
    </div>
  </div>
`


  document.body.insertAdjacentHTML('beforeend', modal)

  const aboutModal = document.getElementById('about-modal')
  const closeBtn = document.getElementById('close-about-modal')

  closeBtn.addEventListener('click', () => {
    aboutModal.style.display = 'none'
  })

  window.addEventListener('click', (e) => {
    if (e.target === aboutModal) {
      aboutModal.style.display = 'none'
    }
  })

  const aboutLink = document.querySelector('a[href="#about"]')
  if (aboutLink) {
    aboutLink.addEventListener('click', (e) => {
      e.preventDefault()
      aboutModal.style.display = 'block'
    })
  }
}
