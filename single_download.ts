import { parse } from "std/flags/mod.ts";
import { z } from "zod";
import { insertDownloadLog } from "./db.ts";

export async function download(url: string, path: string) {
  try {
    const getResult = await fetch(url);
    if (!getResult.ok) throw new Error("Fetch response error");
    const html = await getResult.text();

    Deno.writeTextFile(path, html);

    insertDownloadLog(url, path);
    return { html };
  } catch (error) {
    console.error(error);
  }
  return { html: undefined };
}

if (import.meta.main) {
  const parsedArgs = parse(Deno.args);

  console.log(parsedArgs);

  const urlArg = Object.fromEntries(
    Object.entries(parsedArgs).filter((p) => p[0] == "url" || p[0] == "path"),
  );
  const paramsSchema = z.object({
    url: z.string().url({ message: "Invalid url" }),
    path: z.string().regex(/[\/0-9a-zA-Z]/),
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

  console.log(parseResult);

  await download(parseResult.data.url, parseResult.data.path);
}
