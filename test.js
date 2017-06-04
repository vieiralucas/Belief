const { expect } = require('chai')

const Belief = require('./belief')

describe('A Belief', () => {
  it('can be fulfilled', done => {
    const b = new Belief(resolve => {
      resolve(2)
    })

    setTimeout(() => {
      expect(b).to.have.property('state').equal('fulfilled')
      done()
    }, 0)
  })

  it('can be rejected', done => {
    const b = new Belief((resolve, reject) => {
      reject(new Error('rejected'))
    })

    setTimeout(() => {
      expect(b).to.have.property('state').equal('rejected')
      done()
    }, 0)
  })

  it('has a static .resolve method which returns a fulfilled belief', done => {
    const b = Belief.resolve(2)

    setTimeout(() => {
      expect(b).to.have.property('state').equal('fulfilled')
      done()
    }, 0)
  })

  it('has a static .reject method which returns a rejected belief', done => {
    const b = Belief.reject(2)

    setTimeout(() => {
      expect(b).to.have.property('state').equal('rejected')
      done()
    }, 0)
  })

  describe('when fulfilled', () => {
    it('cannot be rejected', done => {
      const b = new Belief((resolve, reject) => {
        resolve(2)
        reject(new Error('rejected'))
      })

      setTimeout(() => {
        expect(b).to.have.property('state').equal('fulfilled')
        done()
      }, 0)
    })
  })

  describe('when rejected', () => {
    it('cannot be fulfilled', done => {
      const b = new Belief((resolve, reject) => {
        reject(new Error('rejected'))
        resolve(2)
      })

      setTimeout(() => {
        expect(b).to.have.property('state').equal('rejected')
        done()
      }, 0)
    })
  })

  describe('has a then method', () => {
    describe('that can delivery the belief fulfilled value', () => {
      it('when belief resolves', done => {
        const b = Belief.resolve(2)

        b.then(two => {
          expect(two).to.be.equal(2)
          done()
        })
      })

      it('when belief resolves asynchronously', done => {
        const b = new Belief((resolve, reject) => {
          setTimeout(() => {
            resolve(2)
          }, 0)
        })

        b.then(two => {
          expect(two).to.be.equal(2)
          done()
        })
      })
    })

    describe('that can delivery the belief rejection reason', () => {
      it('when belief rejects', done => {
        const reason = new Error('reason')
        const b = Belief.reject(reason)

        b.then(() => {}, err => {
          expect(err).to.be.deep.equal(reason)
          done()
        })
      })

      it('when belief rejects asynchronously', done => {
        const reason = new Error('reason')
        const b = new Belief((resolve, reject) => {
          setTimeout(() => {
            reject(reason)
          }, 0)
        })

        b.then(() => {}, err => {
          expect(err).to.be.deep.equal(reason)
          done()
        })
      })
    })

    describe('that does not explodes', () => {
      it('when onFulfilled is undefined', () => {
        const b = Belief.resolve(2)

        expect(() => {
          b.then(undefined)
        }).to.not.throw()
      })

      it('when onRejection is undefined', () => {
        const b = Belief.reject(new Error('reason'))

        expect(() => {
          b.then(undefined, undefined)
        }).to.not.throw()
      })
    })

    describe('that can be chained', () => {
      it('when returning plain values', done => {
        const b = new Belief((resolve, reject) => {
          setTimeout(() => {
            resolve(1)
          }, 0)
        })

        b
          .then(one => 2)
          .then(two => 3)
          .then(three => {
            expect(three).to.equal(3)
            done()
          })
      })

      it('without messing with previous belief', done => {
        const b = new Belief((resolve, reject) => {
          setTimeout(() => {
            resolve(1)
          }, 0)
        })

        b
          .then(one => 2)
          .then(two => {
            expect(two).to.equal(2)
            b.then(one => {
              expect(one).to.equal(1)
              done()
            })
          })
      })

      it('when chain returns another belief', done => {
        const b = new Belief((resolve, reject) => {
          setTimeout(() => {
            resolve(1)
          }, 0)
        })

        b
          .then(one => Belief.resolve(2))
          .then(two => Belief.resolve(3))
          .then(three => {
            expect(three).to.equal(3)
            done()
          })
      })

      it('when belief rejects', done => {
        const reason = new Error('reason')
        const b = new Belief((resolve, reject) => {
          setTimeout(() => {
            reject(reason)
          }, 0)
        })

        b
          .then(undefined, () => 2)
          .then(two => {
            expect(two).to.equal(2)
            done()
          })
      })

      it('when chain rejects in another belief', done => {
        const reason = new Error('reason')
        const b = new Belief((resolve, reject) => {
          setTimeout(() => {
            reject(reason)
          }, 0)
        })

        const anotherReason = new Error('another reason')

        b
          .then(undefined, () => Belief.reject(anotherReason))
          .then(undefined, err => {
            expect(err).to.be.deep.equal(anotherReason)
            done()
          })
      })

      it('correctly when then is called after a catch in a resolved belief', done => {
        const b = Belief.resolve(1)

        b
          .catch(() => {
            done(new Error('should never call this'))
          })
          .then(one => {
            expect(one).to.equal(1)
            done()
          })
      })

      it('correctly when catch is called after a then in a rejected belief', done => {
        const b = Belief.reject(1)

        b
          .then(() => {
            done(new Error('should never call this'))
          })
          .catch(one => {
            expect(one).to.equal(1)
            done()
          })
      })

      it('correctly when then is called after a catch that returns undefined in a rejected belief', done => {
        const b = Belief.reject(1)

        b
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
    describe('that can delivery the belief rejection reason', () => {
      it('when belief rejects', done => {
        const reason = new Error('reason')
        const b = new Belief((resolve, reject) => {
          reject(reason)
        })

        b.catch(err => {
          expect(err).to.be.deep.equal(reason)
          done()
        })
      })

      it('when belief rejects asynchronously', done => {
        const reason = new Error('reason')
        const b = new Belief((resolve, reject) => {
          setTimeout(() => {
            reject(reason)
          }, 0)
        })

        b.catch(err => {
          expect(reason).to.be.deep.equal(reason)
          done()
        })
      })
    })

    describe('that does not explodes', () => {
      it('when onRejection is undefined', () => {
        const b = new Belief((resolve, reject) => {
          reject(new Error('reason'))
        })

        expect(() => {
          b.catch(undefined)
        }).to.not.throw()
      })
    })

    describe('that can be chained', () => {
      it('when returning plain values', done => {
        const b = new Belief((resolve, reject) => {
          setTimeout(() => {
            reject(1)
          }, 0)
        })

        b
          .catch(one => 2)
          .then(two => {
            expect(two).to.equal(2)
            done()
          })
      })

      it('without messing with previous belief', done => {
        const b = new Belief((resolve, reject) => {
          setTimeout(() => {
            reject(1)
          }, 0)
        })

        b
          .catch(one => 2)
          .then(two => {
            expect(two).to.equal(2)
            b.catch(one => {
              expect(one).to.equal(1)
              done()
            })
          })
      })

      it('when chain returns another belief', done => {
        const b = new Belief((resolve, reject) => {
          setTimeout(() => {
            reject(1)
          }, 0)
        })

        b
          .catch(one => Belief.resolve(2))
          .then(two => {
            expect(two).to.equal(2)
            done()
          })
      })

      it('when chain rejects in another belief', done => {
        const reason = new Error('reason')
        const b = Belief.reject(reason)

        const anotherReason = new Error('another reason')

        b
          .catch(() => Belief.reject(anotherReason))
          .then(undefined, err => {
            expect(err).to.be.deep.equal(anotherReason)
            done()
          })
      })

      it('chains correctly when catch in the middle', done => {
        Belief.resolve(1)
          .then(() => Belief.resolve(2))
          .catch(() => Belief.resolve(4))
          .then(two => {
            expect(two).to.equal(2)
            done()
          })
      })
    })
  })

  describe('has a static .all method', () => {
    it('that resolves array of beliefs to an array of values', done => {
      const bs = Belief.all([Belief.resolve(1), Belief.resolve(2)])

      bs
        .then(values => {
          expect(values).to.be.deep.equal([1, 2])
          done()
        })
    })

    it('rejects if any belief fails', done => {
      const reason = new Error('nops')
      const bs = Belief.all([
        Belief.resolve(1),
        Belief.reject(reason),
        Belief.resolve(3)
      ])

      bs
        .catch(err => {
          expect(err).to.be.deep.equal(reason)
          done()
        })
    })

    it('works if any element is not a belief', done => {
      const bs = Belief.all([Belief.resolve(1), 2, Belief.resolve(3)])

      bs.then(values => {
        expect(values).to.be.deep.equal([1, 2, 3])
        done()
      })
    })

    it('works if all elements are not beliefs', done => {
      const bs = Belief.all([1, 2, 3])

      bs.then(values => {
        expect(values).to.be.deep.equal([1, 2, 3])
        done()
      })
    })

    it('works inside chains', done => {
      Belief.resolve([1, 2])
        .then(numbers => {
          return Belief.all(
            numbers.map(n => Belief.resolve(n * 2))
          )
        })
        .then(numbers => {
          expect(numbers).to.be.deep.equal([2, 4])
          done()
        })
    })
  })

  describe('has a map method', done => {
    it('that behaves like array map, but for beliefs with arrays', done => {
      const bs = Belief.all([
        Belief.resolve(1),
        Belief.resolve(2),
        3
      ])

      bs
        .map(v => v * 2)
        .then(values => {
          expect(values).to.be.deep.equal([2, 4, 6])
          done()
        })
    })

    it('that works if mapper returns a belief', done => {
      const bs = Belief.all([
        Belief.resolve(1),
        Belief.resolve(2),
        3
      ])

      bs
        .map(v => v == 2 ? Belief.resolve(v * 2) : v * 2)
        .then(values => {
          expect(values).to.be.deep.equal([2, 4, 6])
          done()
        })
    })
  })

  it('real world', done => {
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

    const fetchVillain = heroId => new Belief((resolve, reject) => {
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

    const fetchHeroes = () => Belief.resolve(heroes)

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
        expect(heroesWithVillain).to.be.same.deep.members([
          { id: 1, name: 'Batman', villain: 'The Joker' },
          { id: 2, name: 'Spiderman', villain: 'Green Goblin' },
          { id: 3, name: 'Thor', villain: 'Loki' },
          { id: 4, name: 'Superman', villain: 'Network error' },
        ])
        done()
      })
  })
})
