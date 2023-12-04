const Sequelize = require('sequelize');

var sequelize = new Sequelize('WEB322', 'dantheoo12', 'wuekanlQt40V', {
    host: 'ep-wandering-mountain-36097825.us-east-2.aws.neon.tech',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

const Post = sequelize.define('Post', {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN
});

const Category = sequelize.define('Category', {
    category: Sequelize.STRING
});

Post.belongsTo(Category, {foreignKey: 'category'}); 

module.exports.initialize = () => {
    return new Promise(function(resolve, reject) {
        sequelize.sync()
        .then(() => resolve())
        .catch(() => reject('Unable to sync to database'))
    })
};

module.exports.getAllPosts = () => {
    return new Promise((resolve, reject) => {
        Post.findAll().then((allPosts) => resolve(allPosts))
        .catch(() => reject('No post results found'));
    })
};

module.exports.getPostsByCategory = (selectedCategory) => {
    return new Promise ((resolve, reject) => {
        Post.findAll({
            where: {
                category: selectedCategory,
            }
        })
        .then((foundPosts) => resolve(foundPosts))
        .catch(() => reject('No post results found'));
    })
};

module.exports.getPublishedPosts = () => {
    return new Promise ((resolve, reject) => {
        Post.findAll({
            where: {
                published: true
            }
        })
        .then((foundPosts) => resolve(foundPosts))
        .catch(() => reject('No post results found'));
    })
};

module.exports.getPostsByMinDate = (minDateStr) => {
    return new Promise ((resolve, reject) => {
        const { gte } = Sequelize.Op;
        Post.findAll({
            where: {
                postDate: {
                    [gte]: new Date(minDateStr)
                }
        }})
        .then((foundPosts) => resolve(foundPosts))
        .catch(() => reject('No post results found'));
    })
};

module.exports.getPostById = (id) => {
    return new Promise((resolve, reject) => {
        Post.findOne({
            where: {
                id: id
            }
        })
        .then((post) => {
            resolve(post);
        })
        .catch(() => reject('No post results found'));
    })
};

module.exports.getCategories = () => {
    return new Promise((resolve, reject) => {
        Category.findAll().then((allCategories) => resolve(allCategories))
        .catch(() => reject('No category results found'));
    })
};

module.exports.addPost = (postData) => {
    return new Promise((resolve, reject) => {
        for (attribute in postData) {
            if (postData[attribute] === "") postData[attribute] = null;
        }
        Post.create({
            body: postData.body,
            title: postData.title,
            featureImage: postData.featureImage,
            postDate: new Date(),
            published: (postData.published) ? true : false,
            category: postData.category
        })
        .then((newPost) => {
            resolve(newPost);
        })
        .catch(() => reject('Unable to create post'));
    })
};

module.exports.getPublishedPostsByCategory = (selectedCategory) => {
    return new Promise ((resolve, reject) => {
        Post.findAll({
            where: {
                published: true,
                category: selectedCategory
            }
        })
        .then((foundPosts) => resolve(foundPosts))
        .catch(() => reject('No post results found'));
    })
};

module.exports.addCategory = (categoryData) => {
    return new Promise((resolve, reject) => {
        for (categoryData[attribute] in categoryData) {
            if (categoryData[attribute] === "") categoryData[attribute] = null;
        }
        Category.create({
            category: categoryData.category
        })
        .then((newCategory) => resolve(newCategory))
        .catch(() => reject('Unable to create category'));
    })
};

module.exports.deleteCategoryById = (id) => {
    return new Promise((resolve, reject) => {
        Category.destroy({
            where: {
                id: id
            }
        })
        .then(() => resolve())
        .catch(() => reject('Error, category not deleted'));
    })
};

module.exports.deletePostById = (id) => {
    return new Promise((resolve, reject) => {
        Post.destroy({
            where: {
                id: id
            }
        })
        .then(() => resolve())
        .catch(() => reject('Error, post not deleted'));
    })
};