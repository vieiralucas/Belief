function Belief(fn) {
  this.state = 'pending'

  this.onFulfills = []
  this.onRejections = []

  const resolve = value => {
    if (this.state !== 'pending') {
      return
    }

    this.state = 'fulfilled'
    this.value = value
    this.onFulfills.forEach(this._doResolve.bind(this))
  }

  const reject = reason => {
    if (this.state !== 'pending')
      return

    this.state = 'rejected'
    this.value = reason
    this.onRejections.forEach(this._doResolve.bind(this))
  }

  if (typeof fn === 'function')
    fn(resolve, reject)
}

Belief.prototype._doResolve = function doResolve({ fn, resolve, reject }) {
  const result = fn(this.value)

  if (result && typeof result.then === 'function') {
    result.then(resolve, reject)
  } else {
    resolve(result)
  }
}

Belief.prototype.then = function then(onFulfill, onRejection) {
  onFulfill = onFulfill || (() => this.value)
  onRejection = onRejection || (() => Belief.reject(this.value))

  return new Belief((resolve, reject) => {
    if (this.state === 'fulfilled') {
      this._doResolve({ fn: onFulfill, resolve, reject })
    } else if(this.state === 'rejected') {
      this._doResolve({ fn: onRejection, resolve, reject })
    } else if (this.state === 'pending') {
      this.onFulfills.push({ fn: onFulfill, resolve, reject })
      this.onRejections.push({ fn: onRejection, resolve, reject })
    }
  })
}

Belief.prototype.map = function map(onFulfill) {
  return this.then(values => Belief.all(values.map(onFulfill)))
}

Belief.prototype.catch = function katch(onRejection) {
  return this.then(undefined, onRejection)
}

Belief.resolve = function resolve(value) {
  return new Belief(resolve => {
    resolve(value)
  })
}

Belief.reject = function reject(reason) {
  return new Belief((resolve, reject) => {
    reject(reason)
  })
}

Belief.all = function all(promises) {
  return new Belief((resolve, reject) => {
    let count = 0
    const values = []
    const waitOnValue = value => {
      if (value && typeof value.then === 'function') {
        value
          .catch(reject)
          .then(v => {
            count++
            values.push(v)
            if (values.length === promises.length) {
              resolve(values)
            }
          })
        return
      }

      count++
      values.push(value)
      if (values.length === promises.length) {
        resolve(values)
      }
    }

    promises.forEach(waitOnValue)
  })
}

module.exports = Belief
