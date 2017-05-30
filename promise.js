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

  fn(resolve, reject)
}

Promise.prototype.then = function then(onFulfilled, onRejection) {
  if (typeof onFulfilled !== 'function') {
    onFulfilled = () => {}
  }
  if (typeof onRejection !== 'function') {
    onRejection = () => {}
  }

  let resolve
  let reject
  const returnPromise = new Promise((rsvl, rjct) => {
    resolve = rsvl
    reject = rjct
  })

  if (this.state === 'fulfilled') {
    onFulfilled(this.value)
  } else if (this.state === 'rejected') {
    onRejection(this.value)
  } else {
    this.onFulfills.push({ fn: onFulfilled, resolve, reject })
    this.onRejections.push({ fn: onRejection, resolve, reject })
  }

  return returnPromise
}

Promise.prototype.catch = function _catch(onRejection) {
  return this.then(undefined, onRejection)
}

module.exports = Promise
