import { parse } from "std/flags/mod.ts";
import { z } from "zod";
import {
  closeDb,
  insertInspectEntry,
  selectNoExistLinks,
  selectUrlNoInspects,
  updateInspectLog,
} from "./db.ts";
import { download } from "./single_download.ts";
import { inspect } from "./single_inspect.ts";

const parsedArgs = parse(Deno.args);

const urlArg = Object.fromEntries(
  Object.entries(parsedArgs).filter((p) => p[0] == "url"),
);
const paramsSchema = z.object({
  url: z.string().url({ message: "Invalid url" }),
});
const parseResult = paramsSchema.safeParse(urlArg);

if (!parseResult.success) {
  console.error(
    parseResult.error.issues
      .map((k: { [key: string]: any }) => JSON.stringify(k))
      .join("\n"),
  );
  Deno.exit();
}

const url = new URL(parseResult.data.url);

insertInspectEntry(url.pathname);

while (selectUrlNoInspects() != 0) {
  const urls = selectUrlNoInspects() as string[][];
  console.log(urls);

  for await (const pathName of urls) {
    console.log(pathName);
    const path = pathName[0].split("/").join("_");
    console.log(`${url.protocol}//${url.host}${pathName}`);
    
    const result = await download(
      `${url.protocol}//${url.host}${pathName}`,
      `download/${path}`,
    );
    console.log(result);
    
    if (!result.html) {
      updateInspectLog(pathName[0], 0);
    } else {
      updateInspectLog(pathName[0], 1);
      await inspect(result.html);
    }
  }
}

const links = selectNoExistLinks() as string[][]

console.log(`

** Break Links **
${links.map((l)=> l[0]).join("\n")}
`)

closeDb();

