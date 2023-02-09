# deno scraiping find break link

## Usage

```sh
# download 
$ deno run --allow-net --allow-read --allow-write single_download.ts --url http://host.docker.internal:4507/blog/ --path ./download/blog

# inspect
$ deno run --allow-net --allow-read --allow-write single_inspect.ts --path ./download/blog

# patrol inspect
$ deno run --allow-net --allow-write --allow-read scraping.ts --url http://host.docker.internal:4507/blog/

** Break Links **
/hoge/hoge
```