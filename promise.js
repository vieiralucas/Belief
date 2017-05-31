function Promise (fn) {
  this.state = 'pending'
  this.onFulfills = []
  this.onRejections = []

  const resolve = value => {
    if (this.state === 'pending') {
      this.state = 'fulfilled'
      this.value = value

      this.onFulfills.forEach(onFulfill => {
        const nextValue = onFulfill.fn(this.value)
        if (nextValue && typeof nextValue.then === 'function') {
          nextValue.then(onFulfill.resolve)
        } else {
          onFulfill.resolve(nextValue)
        }
      })
    }
  }

  const reject = reason => {
    if (this.state === 'pending') {
      this.state = 'rejected'
      this.value = reason

      this.onRejections.forEach(onRejection => {
        const nextValue = onRejection.fn(this.value)
        if (nextValue && typeof nextValue.then === 'function') {
          nextValue.then(onRejection.resolve, onRejection.reject)
        } else {
          onRejection.resolve(nextValue)
        }
      })
    }
  }

  setTimeout(() => {
    fn(resolve, reject)
  }, 0)
}

Promise.prototype.then = function then(onFulfilled, onRejection) {
  const returnPromise = new Promise((resolve, reject) => {
    if (this.state === 'fulfilled') {
      if (typeof onFulfilled === 'function') {
        const nextValue = onFulfilled(this.value)
        if (nextValue && typeof nextValue.then === 'function') {
          nextValue.then(resolve, reject)
        } else {
          resolve(nextValue)
        }
      } else {
        resolve(this.value)
      }
    } else if (this.state === 'rejected') {
      if (typeof onRejection === 'function') {
        const nextValue = onRejection(this.value)

        if (nextValue && typeof nextValue.then === 'function') {
          nextValue.then(resolve, reject)
        } else {
          resolve(nextValue)
        }
      } else {
        reject(this.value)
      }
    } else {
      this.onFulfills.push({ fn: onFulfilled || new Function(), resolve, reject })
      this.onRejections.push({ fn: onRejection || new Function(), resolve, reject })
    }
  })

  return returnPromise
}

Promise.prototype.catch = function _catch(onRejection) {
  return this.then(undefined, onRejection)
}

Promise.prototype.map = function map(mapper) {
  return this.then(values => Promise.all(values.map(mapper)))
}

Promise.resolve = function resolve(value) {
  return new Promise(resolve => {
    resolve(value)
  })
}

Promise.reject = function reject(reason) {
  return new Promise((resolve, reject) => {
    reject(reason)
  })
}

Promise.all = function all(promises) {
  const returnedPromise = new Promise((resolve, reject) => {
    const values = []
    let count = 0

    const check = i => value => {
      values[i] = value
      count++
      if (count === promises.length) {
        resolve(values)
      }
    }

    for (let i = 0; i < promises.length; i++) {
      const promise = promises[i]
      if (typeof promise.then === 'function') {
        promise.then(check(i), reject)
      } else {
        check(i)(promise)
      }
    }

  })

  return returnedPromise
}

module.exports = Promise
