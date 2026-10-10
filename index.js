import jsonfile from "jsonfile";
import moment from "moment";
import simpleGit from "simple-git";

const git = simpleGit();
const path = "./data.json";

// 7 rows (Sunday = 0 to Saturday = 6)
const S = [
  " ### ",
  "#   #",
  "#    ",
  " ### ",
  "    #",
  "#   #",
  " ### "
];

const A = [
  " ### ",
  "#   #",
  "#   #",
  "#####",
  "#   #",
  "#   #",
  "#   #"
];

const I = [
  "#####",
  "  #  ",
  "  #  ",
  "  #  ",
  "  #  ",
  "  #  ",
  "#####"
];

const combined = [];
for (let r = 0; r < 7; r++) {
  combined.push(S[r] + "  " + A[r] + "  " + I[r]);
}

// GitHub 52-week rolling window starts 51 weeks before current week's start (Sunday)
const startDate = moment("2025-10-12T12:00:00+05:30");
const weekOffset = 16; // Center the 19 columns in the 52-week grid (weeks 16..34)
const commitsPerPixel = 5; // 5 commits ensures dark green intensity on GitHub

const tasks = [];
for (let c = 0; c < combined[0].length; c++) {
  for (let r = 0; r < 7; r++) {
    if (combined[r][c] === "#") {
      const baseDate = moment(startDate).add(weekOffset + c, "weeks").add(r, "days");
      for (let k = 0; k < commitsPerPixel; k++) {
        const commitDate = baseDate.clone().set({
          hour: 9 + k * 2,
          minute: 15,
          second: 0
        }).format();
        tasks.push(commitDate);
      }
    }
  }
}

async function run() {
  console.log("Generating pattern 'SAI':");
  combined.forEach((line) => console.log(line));
  console.log(`\nTotal commits to create: ${tasks.length}`);

  for (let i = 0; i < tasks.length; i++) {
    const date = tasks[i];
    await jsonfile.writeFile(path, { date });
    await git.add([path]).commit(date, {
      "--date": date,
      "--author": "nikam-san <nikamaaryan09@gmail.com>"
    });
    if ((i + 1) % 40 === 0 || i === tasks.length - 1) {
      console.log(`Progress: ${i + 1}/${tasks.length} commits done`);
    }
  }
  console.log("All commits created! Pushing to GitHub...");
  await git.push(["-f", "origin", "main"]);
  console.log("Successfully pushed pattern 'SAI' to GitHub!");
}

run().catch(console.error);
