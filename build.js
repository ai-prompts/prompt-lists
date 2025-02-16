import listHelpers from "./index.js";
import fs from "fs";

const allLists = [];
const listMetadata = {};

// Simple deterministic random number generator with fixed seed
function seededRandom(seed) {
  return function () {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

const random = seededRandom(100);

for (const category of Object.keys(listHelpers)) {
  for (const listName of Object.keys(listHelpers[category])) {
    const key = `${category}.${listName}`;
    const data = listHelpers[category][listName]();

    allLists.push(key);
    listMetadata[key] = {
      ...data,
      total: data.list.length,
      examples: data.list.sort(() => random() - 0.5).slice(0, 2),
    };
    delete listMetadata[key].list;
  }
}

fs.writeFileSync("lists.json", JSON.stringify(allLists, null, 2));
fs.writeFileSync("list-metadata.json", JSON.stringify(listMetadata, null, 2));
