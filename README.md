# pie-store-demo

A web app that runs pie libraries and elements with persisted sessions and items.

## install 
```
npm install 
```

## Supported Browsers

* chrome only for now

### backend dependencies

* mongodb - for storing metadata about the element from github and from the archive
* s3 - for storing a pie item's js and assets 

> s3 is only needed when running in prod/heroku.

## run 

```shell
bin/seed-dev # seed the db with a corespring-choice item
```

To run a dev server with a local mongo and the filesystem as the asset server run:
```shell
npm run dev # runs a dev server with change detection
```

To run prod: 
```shell
gulp build
node lib/index.js #add params here or have the env vars set.
```
### app params

| param | env-var  | default  | description |
|-------|----------|----------|-------------|
|`--mongoUri` | `MONGO_URI` | mongodb://localhost:27017/pie-store-demo  | the mongo uri |
|`--bucket` | `S3_BUCKET` | pie-store-demo  | the s3 bucket |
|`--prefix` | `S3_PREFIX` | test  | the prefix within the bucket |

