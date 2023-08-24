import { eachDayOfInterval, format, subDays } from "date-fns";
import notify from "./lib/notify";

const FIRST_DATE = new Date("2006-10-09");
const FIRST_DATE_WITH_EXACT_DATA = new Date("2014-11-11");
const HN_FRONT_PAGE_URL = "https://news.ycombinator.com/front";

let errorCount = 0;

async function main() {
  // Get a date range for all dates between `FIRST_DATE_WITH_EXACT_DATA` and yesterday
  const dateRange = eachDayOfInterval({
    start: FIRST_DATE_WITH_EXACT_DATA,
    end: subDays(new Date(), 1),
  }).reverse();

  // Loop over every date
  for (const date of dateRange) {
    // Stop after too many errors
    if (errorCount > 10) {
      console.log("Error: Too many consecutive errors. Aborting archive!");

      notify({
        title: "HN Archive Error",
        message: "Too many consecutive errors. Aborting archive!",
      });

      break;
    }

    const dateString = format(date, "yyyy-MM-dd");
    const archivePath = `./archive/${dateString}.html`;

    // Skip if the file already exists
    if (Bun.file(archivePath).size !== 0) {
      console.log(`Skipping: ${archivePath} already exists`);
      continue;
    }

    const url = `${HN_FRONT_PAGE_URL}?day=${dateString}`;

    console.log(`Fetching: ${url}`);

    const res = await fetch(url, {
      headers: {
        // Set a user agent to avoid being blocked
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36",
      },
      // Fake a referrer to avoid being blocked
      referrer: "https://news.ycombinator.com/front",
    });

    if (!res.ok) {
      console.log(`Error (${res.status}) fetching: ${url}`);
      errorCount++;
      continue;
    } else {
      await Bun.write(`./archive/${format(date, "yyyy-MM-dd")}.html`, res);
    }

    // Rate limit to 1 request every 3-5 seconds
    await sleep(Math.random() * (5000 - 3000) + 3000);
  }
}

main();

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
