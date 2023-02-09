import { parse } from "std/flags/mod.ts";
import { z } from "zod";
import { insertInspectEntry } from "./db.ts";

import {
  DOMParser,
  Element,
  NodeList,
} from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

export function inspect(html: string) {
  const doc = new DOMParser().parseFromString(html, "text/html")!;
  const elements = doc.querySelectorAll("a")!;

  const anchors = new Set(
    Array.from(elements)
      .filter((e) => e.attributes[0].nodeName == "href")
      .map((e) => e.attributes[0].value! as string)
      .filter((url: string) => url.match(/^(\/)(?!.*\#)/))
  );

  anchors.forEach((url) => {
    insertInspectEntry(url);
  });
}

if (import.meta.main) {
  const parsedArgs = parse(Deno.args);

  console.log(parsedArgs);

  const urlArg = Object.fromEntries(
    Object.entries(parsedArgs).filter((p) => p[0] == "path")
  );
  const paramsSchema = z.object({
    path: z.string().regex(/[\/0-9a-zA-Z]/),
  });
  const parseResult = paramsSchema.safeParse(urlArg);

  if (!parseResult.success) {
    console.error(
      parseResult.error.issues
        .map((k: { [key: string]: any }) => JSON.stringify(k))
        .join("\n")
    );
    Deno.exit();
  }

  console.log(parseResult);

  const html = Deno.readTextFileSync(parseResult.data.path);

  await inspect(html);
}
