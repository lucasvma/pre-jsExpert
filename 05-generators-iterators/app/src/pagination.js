const Request = require('./request')

const DEFAULT_OPTIONS = {
    maxRetries: 4,
    retryTimeout: 1000,
    maxRequestTimeout: 1000,
    threshold: 200
}

class Pagination {
    constructor(options = DEFAULT_OPTIONS) {
        this.request = new Request()

        this.maxRetries = options.maxRetries
        this.retryTimeout = options.retryTimeout
        this.maxRequestTimeout = options.maxRequestTimeout
        this.threshold = options.threshold
    }

    async handleRequest({ url, page, retries = 1 }) {
        try {
            const finalUrl = `${url}?tid=${page}`
            const result = await this.request.makeRequest({
                url: finalUrl,
                method: 'get',
                timeout: this.maxRequestTimeout
            })

            return result
        } catch (error) {
            if (retries === this.maxRetries) {
                console.error(`[${retries}] max retries reached!`)
                throw error
            }
            console.error(`[${retries}] an error: [${error.message}] has happened! Tryng again in ${this.retryTimeout}ms`)
            await Pagination.sleep(this.retryTimeout)

            return this.handleRequest({ url, page, retries: retries += 1})
        }
    }

    static async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    /**
     * The generators are used to work with on-demand data
     * We need note the function with * and use the yield to return on-demand data
     * 
     * When we use the tield { 0 }
     * The return can be { done: false, value: 0 }
     * const r = getPaginated()
     * r.next() -> { done: false, value 0 }
     * r.next() -> { done: true, value 0 }
     * 
     * When we want to delegate an execution (don't return a value, delegate)
     * 
     * yield* function
     */
    async * getPaginated({ url, page }) {
        const result = await this.handleRequest({ url, page })

        const lastId = result[result.length - 1]?.tid ?? 0

        if (lastId === 0) return

        yield result
        await Pagination.sleep(this.threshold)
        yield* this.getPaginated({ url, page: lastId })
    }
}

module.exports = Pagination