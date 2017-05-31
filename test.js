const { expect } = require('chai')

const Promise = require('./promise')

describe('A Promise', () => {
  it('can be fulfilled', () => {
    const p = new Promise(resolve => {
      resolve(2)
    })

    setTimeout(() => {
      expect(p).to.have.property('state').equal('fulfilled')
    }, 0)
  })

  it('can be rejected', () => {
    const p = new Promise((resolve, reject) => {
      reject(new Error('rejected'))
    })

    setTimeout(() => {
      expect(p).to.have.property('state').equal('rejected')
    }, 0)
  })

  it('has a static .resolve method which returns a fulfilled promise', () => {
    const p = Promise.resolve(2)

    setTimeout(() => {
      expect(p).to.have.property('state').equal('fulfilled')
    }, 0)
  })

  it('has a static .reject method which returns a rejected promise', () => {
    const p = Promise.reject(2)

    setTimeout(() => {
      expect(p).to.have.property('state').equal('rejected')
    }, 0)
  })

  describe('when fulfilled', () => {
    it('cannot be rejected', () => {
      const p = new Promise((resolve, reject) => {
        resolve(2)
        reject(new Error('rejected'))
      })

      setTimeout(() => {
        expect(p).to.have.property('state').equal('fulfilled')
      }, 0)
    })
  })

  describe('when rejected', () => {
    it('cannot be fulfilled', () => {
      const p = new Promise((resolve, reject) => {
        reject(new Error('rejected'))
        resolve(2)
      })

      setTimeout(() => {
        expect(p).to.have.property('state').equal('rejected')
      }, 0)
    })
  })

  describe('has a then method', () => {
    describe('that can delivery the promise fulfilled value', () => {
      it('when promise resolves', done => {
        const p = Promise.resolve(2)

        p.then(two => {
          expect(two).to.be.equal(2)
          done()
        })
      })

      it('when promise resolves asynchronously', done => {
        const p = new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve(2)
          }, 0)
        })

        p.then(two => {
          expect(two).to.be.equal(2)
          done()
        })
      })
    })

    describe('that can delivery the promise rejection reason', () => {
      it('when promise rejects', done => {
        const reason = new Error('reason')
        const p = Promise.reject(reason)

        p.then(() => {}, err => {
          expect(err).to.be.deep.equal(reason)
          done()
        })
      })

      it('when promise rejects asynchronously', done => {
        const reason = new Error('reason')
        const p = new Promise((resolve, reject) => {
          setTimeout(() => {
            reject(reason)
          }, 0)
        })

        p.then(() => {}, err => {
          expect(err).to.be.deep.equal(reason)
          done()
        })
      })
    })

    describe('that does not explodes', () => {
      it('when onFulfilled is undefined', () => {
        const p = Promise.resolve(2)

        expect(() => {
          p.then(undefined)
        }).to.not.throw()
      })

      it('when onRejection is undefined', () => {
        const p = Promise.reject(new Error('reason'))

        expect(() => {
          p.then(undefined, undefined)
        }).to.not.throw()
      })
    })

    describe('that can be chained', () => {
      it('when returning plain values', done => {
        const p = new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve(1)
          }, 0)
        })

        p
          .then(one => 2)
          .then(two => 3)
          .then(three => {
            expect(three).to.equal(3)
            done()
          })
      })

      it('without messing with previous promise', done => {
        const p = new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve(1)
          }, 0)
        })

        p
          .then(one => 2)
          .then(two => {
            expect(two).to.equal(2)
            p.then(one => {
              expect(one).to.equal(1)
              done()
            })
          })
      })

      it('when chain returns another promise', done => {
        const p = new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve(1)
          }, 0)
        })

        p
          .then(one => Promise.resolve(2))
          .then(two => Promise.resolve(3))
          .then(three => {
            expect(three).to.equal(3)
            done()
          })
      })

      it('when promise rejects', done => {
        const reason = new Error('reason')
        const p = new Promise((resolve, reject) => {
          setTimeout(() => {
            reject(reason)
          }, 0)
        })

        p
          .then(undefined, () => 2)
          .then(two => {
            expect(two).to.equal(2)
            done()
          })
      })

      it('when chain rejects in another promise', done => {
        const reason = new Error('reason')
        const p = new Promise((resolve, reject) => {
          setTimeout(() => {
            reject(reason)
          }, 0)
        })

        const anotherReason = new Error('another reason')

        p
          .then(undefined, () => Promise.reject(anotherReason))
          .then(undefined, err => {
            expect(err).to.be.deep.equal(anotherReason)
            done()
          })
      })

      it('correctly when then is called after a catch in a resolved promise', done => {
        const p = Promise.resolve(1)

        p
          .catch(() => {
            done(new Error('should never call this'))
          })
          .then(one => {
            expect(one).to.equal(1)
            done()
          })
      })

      it('correctly when catch is called after a then in a rejected promise', done => {
        const p = Promise.reject(1)

        p
          .then(() => {
            done(new Error('should never call this'))
          })
          .catch(one => {
            expect(one).to.equal(1)
            done()
          })
      })

      it('correctly when then is called after a catch that returns undefined in a rejected promise', done => {
        const p = Promise.reject(1)

        p
          .catch(one => {
            expect(one).to.equal(1)
          })
          .then(() => {
            done()
          })
      })
    })
  })

  describe('has a catch method', () => {
    describe('that can delivery the promise rejection reason', () => {
      it('when promise rejects', done => {
        const reason = new Error('reason')
        const p = new Promise((resolve, reject) => {
          reject(reason)
        })

        p.catch(err => {
          expect(err).to.be.deep.equal(reason)
          done()
        })
      })

      it('when promise rejects asynchronously', done => {
        const reason = new Error('reason')
        const p = new Promise((resolve, reject) => {
          setTimeout(() => {
            reject(reason)
          }, 0)
        })

        p.catch(err => {
          expect(reason).to.be.deep.equal(reason)
          done()
        })
      })
    })

    describe('that does not explodes', () => {
      it('when onRejection is undefined', () => {
        const p = new Promise((resolve, reject) => {
          reject(new Error('reason'))
        })

        expect(() => {
          p.catch(undefined)
        }).to.not.throw()
      })
    })

    describe('that can be chained', () => {
      it('when returning plain values', done => {
        const p = new Promise((resolve, reject) => {
          setTimeout(() => {
            reject(1)
          }, 0)
        })

        p
          .catch(one => 2)
          .then(two => {
            expect(two).to.equal(2)
            done()
          })
      })

      it('without messing with previous promise', done => {
        const p = new Promise((resolve, reject) => {
          setTimeout(() => {
            reject(1)
          }, 0)
        })

        p
          .catch(one => 2)
          .then(two => {
            expect(two).to.equal(2)
            p.catch(one => {
              expect(one).to.equal(1)
              done()
            })
          })
      })

      it('when chain returns another promise', done => {
        const p = new Promise((resolve, reject) => {
          setTimeout(() => {
            reject(1)
          }, 0)
        })

        p
          .catch(one => Promise.resolve(2))
          .then(two => {
            expect(two).to.equal(2)
            done()
          })
      })

      it('when chain rejects in another promise', done => {
        const reason = new Error('reason')
        const p = Promise.reject(reason)

        const anotherReason = new Error('another reason')

        p
          .catch(() => Promise.reject(anotherReason))
          .then(undefined, err => {
            expect(err).to.be.deep.equal(anotherReason)
            done()
          })
      })
    })
  })

  it.skip('chains correctly when catch in the middle', done => {
    Promise.resolve(1)
      .then(() => Promise.resolve(2))
      .catch(() => Promise.resolve(4))
      .then(two => {
        expect(two).to.equal(2)
        done()
      })
  })

  describe('has a static .all method', () => {
    it('resolves array of promises to an array of values', done => {
      const ps = Promise.all([Promise.resolve(1), Promise.resolve(2)])

      ps
        .then(values => {
          expect(values).to.be.deep.equal([1, 2])
          done()
        })
    })

    it('rejects if any promise fails', done => {
      const reason = new Error('nops')
      const ps = Promise.all([
        Promise.resolve(1),
        Promise.reject(reason),
        Promise.resolve(3)
      ])

      ps
        .catch(err => {
          expect(err).to.be.deep.equal(reason)
          done()
        })
    })

    it('works if any element is not a promise', done => {
      const ps = Promise.all([Promise.resolve(1), 2, Promise.resolve(3)])

      ps.then(values => {
        expect(values).to.be.deep.equal([1, 2, 3])
        done()
      })
    })

    it('works if all elements are not promises', done => {
      const ps = Promise.all([1, 2, 3])

      ps.then(values => {
        expect(values).to.be.deep.equal([1, 2, 3])
        done()
      })
    })

    it('works inside chains', done => {
      Promise.resolve([1, 2])
        .then(numbers => {
          return Promise.all(
            numbers.map(n => Promise.resolve(n * 2))
          )
        })
        .then(numbers => {
          expect(numbers).to.be.deep.equal([2, 4])
          done()
        })
    })
  })

  describe('has a map method', done => {
    it('that behaves like array map, but for promises with arrays', done => {
      const ps = Promise.all([
        Promise.resolve(1),
        Promise.resolve(2),
        3
      ])

      ps
        .map(v => v * 2)
        .then(values => {
          expect(values).to.be.deep.equal([2, 4, 6])
          done()
        })
    })

    it('that works if mapper returns a promise', done => {
      const ps = Promise.all([
        Promise.resolve(1),
        Promise.resolve(2),
        3
      ])

      ps
        .map(v => v == 2 ? Promise.resolve(v * 2) : v * 2)
        .then(values => {
          expect(values).to.be.deep.equal([2, 4, 6])
          done()
        })
    })
  })

  it.skip('real world', done => {
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
      if (heroId === 4) {
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
        return fetchVillain(hero.id)
          .then(villain => {
            hero.villain = villain.name

            console.log('inside map inside then', hero)
            return hero
          })
          .catch(err => {
            console.log('inside map inside catch', hero)
            hero.villain = err.message

            return hero
          })
      })
      .then(heroesWithVillain => {
        console.trace()
        expect(heroesWithVillain).to.be.deep.equal([
          { id: 1, name: 'Batman', villain: 'The Joker' },
          { id: 1, name: 'Spiderman', villain: 'Green Goblin' },
          { id: 1, name: 'Thor', villain: 'Loki' },
          { id: 4, name: 'Superman', villain: 'Network error' },
        ])
        done()
      })
  })
})
