import { eachDayOfInterval, format, subDays } from "date-fns";
import notify from "./lib/notify";
import { ZenRows } from "zenrows";

const FIRST_DATE = new Date("2006-10-09");
const FIRST_DATE_WITH_EXACT_DATA = new Date("2014-11-11");
const HN_FRONT_PAGE_URL = "https://news.ycombinator.com/front";

let errorCount = 0;

const zenRowsClient = new ZenRows(process.env.ZENROWS_API_KEY || "");

async function main() {
  // Get a date range for all dates between yesterday and `FIRST_DATE_WITH_EXACT_DATA`
  const dateRange = eachDayOfInterval({
    start: FIRST_DATE,
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
    const archivePath = `${
      process.env.ARCHIVE_PATH || "./archive"
    }/${dateString}.html`;

    // Skip if the file already exists
    if (Bun.file(archivePath).size !== 0) {
      console.log(`Skipping: ${archivePath} already exists`);
      continue;
    }

    const url = `${HN_FRONT_PAGE_URL}?day=${dateString}`;

    console.log(`Fetching: ${url}`);

    try {
      const { data } = await zenRowsClient.get(url, {
        premium_proxy: false,
      });

      await Bun.write(`./archive/${format(date, "yyyy-MM-dd")}.html`, data);
    } catch (error) {
      console.log(`Error fetching: ${url}`);
      errorCount++;
      continue;
    }
  }
}

main();
