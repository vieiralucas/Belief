const { expect } = require('chai')

const Promise = require('./promise')

describe('A Promise', () => {
  it('can be fulfilled', () => {
    const p = new Promise(resolve => {
      resolve(2)
    })

    expect(p).to.have.property('state').equal('fulfilled')
  })

  it('can be rejected', () => {
    const p = new Promise((resolve, reject) => {
      reject(new Error('rejected'))
    })

    expect(p).to.have.property('state').equal('rejected')
  })

  describe('when fulfilled', () => {
    it('cannot be rejected', () => {
      const p = new Promise((resolve, reject) => {
        resolve(2)
        reject(new Error('rejected'))
      })

      expect(p).to.have.property('state').equal('fulfilled')
    })
  })

  describe('when rejected', () => {
    it('cannot be fulfilled', () => {
      const p = new Promise((resolve, reject) => {
        reject(new Error('rejected'))
        resolve(2)
      })

      expect(p).to.have.property('state').equal('rejected')
    })
  })

  describe('has a then method', () => {
    describe('that can delivery the promise fulfilled value', () => {
      it('when promise resolves', done => {
        const p = new Promise((resolve, reject) => {
          resolve(2)
        })

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

    describe('that can develivery the promise rejection reason', () => {
      it('when promise rejects', done => {
        const reason = new Error('reason')
        const p = new Promise((resolve, reject) => {
          reject(reason)
        })

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
        const p = new Promise((resolve, reject) => {
          resolve(2)
        })

        expect(() => {
          p.then(undefined)
        }).to.not.throw()
      })

      it('when onRejection is undefined', () => {
        const p = new Promise((resolve, reject) => {
          reject(new Error('reason'))
        })

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
          .then(two => {
            expect(two).to.equal(2)
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
          .then(one => {
            return new Promise(resolve => {
              setTimeout(() => {
                resolve(2)
              }, 0)
            })
          })
          .then(two => {
            expect(two).to.equal(2)
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
          .then(undefined, () => {
            return new Promise((resolve, reject) => {
              reject(anotherReason)
            })
          })
          .then(undefined, err => {
            expect(err).to.be.deep.equal(anotherReason)
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
  })
})
