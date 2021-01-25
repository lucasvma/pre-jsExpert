const loki = require('lokijs')

class TodoRepositoy {
    constructor() {
        const db = new loki('todo', { })
        this.schedule = db.addCollection('schedule')
    }

    list () {
        return this.schedule.find()
    }

    create(data) {
        return this.schedule.insertOne(data)
    }
}

module.exports = TodoRepositoy

// const c = new TodoRepositoy()

// c.create({ name: 'XuxadaSilva', age: 90})
// c.create({ name: 'Joaozinho', age: 90})

// console.log('list', c.list())