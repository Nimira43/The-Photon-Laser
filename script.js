const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
const scoreEl = document.querySelector('#score-el')

canvas.width = innerWidth
canvas.height = innerHeight

class Player {
  constructor(x, y, radius, colour) {
    this.x = x
    this.y = y
    this.radius = radius
    this.colour = colour
  }
  draw() {
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.colour
    c.fill()
  }
}

class Projectile {
  constructor(x, y, radius, colour, velocity) {
    this.x = x
    this.y = y
    this.radius = radius
    this.colour = colour
    this.velocity = velocity
  }
  draw() {
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.colour
    c.fill()
  }
  update() {
    this.draw()
    this.x = this.x + this.velocity.x
    this.y = this.y + this.velocity.y
  }
}

class Enemy {
  constructor(x, y, radius, colour, velocity) {
    this.x = x
    this.y = y
    this.radius = radius
    this.colour = colour
    this.velocity = velocity
  }
  draw() {
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.colour
    c.fill()
  }
  update() {
    this.draw()
    this.x = this.x + this.velocity.x
    this.y = this.y + this.velocity.y
  }
}

const friction = 0.99

class Particle {
  constructor(x, y, radius, colour, velocity) {
    this.x = x
    this.y = y
    this.radius = radius
    this.colour = colour
    this.velocity = velocity
    this.alpha = 1
  }
  draw() {
    c.save()
    c.globalAlpha = this.alpha 
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.colour
    c.fill()
    c.restore()
  }
  update() {
    this.draw()
    this.velocity.x *= friction
    this.velocity.y *= friction
    this.x = this.x + this.velocity.x
    this.y = this.y + this.velocity.y
    this.alpha -= 0.01
  }
}

const x = canvas.width / 2
const y = canvas.height / 2
const player = new Player(x, y, 10, '#ff4500')
const projectiles = []
const enemies = []
const particles = []

function spawnEnemies() {
  setInterval(() => {
    const radius = Math.random() * (30 - 4) + 4
    let x
    let y
  
    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
      y = Math.random() * canvas.height
    } else {
      x = Math.random() * canvas.width
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius 
    }

    const colour = `hsl(${Math.random() * 360}, 50%, 50%)`
    const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x)
    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle)
    }
    enemies.push(new Enemy(x, y, radius, colour, velocity))
  }, 1000)
}

let animatedId
let score = 0

function animate() {
  animatedId = requestAnimationFrame(animate)
  c.fillStyle = 'rgba(0, 0, 0, 0.1'
  c.fillRect(0, 0, canvas.width, canvas.height)
  
  player.draw()

  for (let index = particles.length - 1; index >= 0; index--) {
    const particle = particles[index]
    if (particle.alpha <= 0) {
      particles.splice(index, 1)
    } else {
      particle.update()
    }  
  }
  
  for (let index = projectiles.length - 1; index >= 0; index--) {
    const projectile = projectiles[index]
    projectile.update()
    if (
      projectile.x - projectile.radius < 0 ||
      projectile.x - projectile.radius > canvas.width ||
      projectile.y + projectile.radius < 0 ||
      projectile.y - projectile.radius > canvas.height
    ) {
      projectiles.splice(index, 1)
    }
  }

  for (let index = enemies.length - 1; index >= 0; index--) {
    const enemy = enemies[index]
    enemy.update()
    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)
    if (dist - enemy.radius - player.radius < 1) {
      cancelAnimationFrame(animatedId)
    }

    for (
      let projectilesIndex = projectiles.length - 1; 
      projectilesIndex >= 0; 
      projectilesIndex--      
    ) {
      const projectile = projectiles[projectilesIndex]
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)
      if (dist - enemy.radius - projectile.radius < 1) {
        for (let i = 0; i < enemy.radius * 2; i++) {
          particles.push(
            new Particle(
              projectile.x,
              projectile.y,
              Math.random() * 2,
              enemy.colour,
              {
                x: (Math.random() - 0.5) * (Math.random() * 6),
                y: (Math.random() - 0.5) * (Math.random() * 6)
              }
            )
          )
        }
        if (enemy.radius - 10 > 5) {
          score += 10
          scoreEl.innerHTML = score
          gsap.to(enemy, {
            radius: enemy.radius - 10
          })
          projectiles.splice(projectilesIndex, 1)
        } else {
          score += 10
          scoreEl.innerHTML = score
          enemies.splice(index, 1)
          projectiles.splice(projectilesIndex, 1)
        }
      }
    }
  }
}

addEventListener('click', (event) => {
  const angle = Math.atan2(
    event.clientY - canvas.height / 2,
    event.clientX - canvas.width / 2
  )
  const velocity = {
    x: Math.cos(angle) * 5,
    y: Math.sin(angle) * 5
  }
  projectiles.push(
    new Projectile(canvas.width / 2, canvas.height / 2, 5, '#ffd700', velocity)
  )
}) 

animate()
spawnEnemies()