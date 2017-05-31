const Promise = require('./promise')

const heroes = [
  { id: 1, name: 'Batman' },
  { id: 2, name: 'Spiderman' },
  { id: 3, name: 'Thor' },
  { id: 4, name: 'Superman' }
]

const villains = [
  { heroId: 1, name: 'The Joker' },
  { heroId: 2, name: 'Green Goblin' },
  { heroId: 3, name: 'Loki' },
  { heroId: 4, name: 'Zod' }
]

const fetchVillain = heroId => new Promise((resolve, reject) => {
  if (Math.random() > 0.7) {
    setTimeout(() => {
      reject(new Error('Network error'))
    }, Math.random() * 100)
    return
  }

  const villain = villains.find(v => v.heroId === heroId)

  setTimeout(() => {
    resolve(villain)
  }, Math.random() * 100)
})

const fetchHeroes = () => Promise.resolve(heroes)

fetchHeroes()
  .map(hero => {
    console.log(1, hero)
    return fetchVillain(hero.id)
      .then(villain => {
        hero.villain = villain.name

        console.log(2, villain)
        return hero
      })
      .catch(err => {
        console.log(2, err)
        hero.villain = err.message
        return hero
      })
  })
  .then(heroesWithVillain => {
    console.log(3, heroesWithVillain)
    console.log(JSON.stringify(heroesWithVillain, null, 2))
  })
