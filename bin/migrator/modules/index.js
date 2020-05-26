const category = require("./category");
const users = require("./users");
const products = require("./products");
const courses = require("./courses");
const usersData = require("./usets_data");

const modules = [
    category,
    users,
    products,
    courses,
    usersData
]

async function moduleResolver(cursor, options) {
    const __modules = options ? options.skip ? modules.filter(m => options.skip.indexOf(m.name) === -1) : modules : modules;
    console.log(`module resolver is begin: modules - ${__modules.map(m => m.name)}`);
    for (let i = 0; i < __modules.length; i++) {
        console.log(`resolve module begin: ${__modules[i].name}`);
        const module = __modules[i]();
        if (!module.resolve) {
            throw new Error(`Module ${module} must be implements method 'Resolve'!`)
        }

        await module.resolve(cursor);
        console.log(`resolve module end: ${__modules[i].name}`);
    }
    console.log(`module resolver is end!`);
}


module.exports = moduleResolver;