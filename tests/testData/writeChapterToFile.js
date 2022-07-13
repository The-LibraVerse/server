const fs = require('fs');
const { faker } = require('@faker-js/faker');
const ipfsUpload = require('../helpers/ipfsUpload');

const numChapters = 100;
const chapters = [];

function writeFile(path, content) {
    const folderPath = `./tests/testData/chapterContent`;

    // If chaptercontent dir doesn't exist, create it
    try {
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);
        }
    } catch (err) {
        console.error(err);
    }

    fs.writeFileSync(`${folderPath}/${path}`, content);
}

function createChapters() {
    let promiseChain = Promise.resolve();

    for (let i=1; i<= numChapters; i++) {
        const numParagraphs = faker.random.numeric(2);
        const content = faker.lorem.paragraphs(numParagraphs);

        chapters.push({ content });
    }

    return promiseChain;
}

function uploadToIPFS() {
    const content = chapters.map(c => c.content);

    return ipfsUpload.batch(content)
        .then(res => {
            chapters.forEach((c, i) => {
                chapters[i].contentURL = res[i].url;
                chapters[i].ipfsHash = res[i].cidv0;
            });

            writeFile('chapters.json', JSON.stringify(chapters));

            return chapters;
        });
}

function main() {
    return createChapters()
    .then(res => {
        return uploadToIPFS();
    });
}

main();
