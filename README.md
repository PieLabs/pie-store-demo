# pie-catalog

[![Build Status](https://travis-ci.org/PieLabs/pie-catalog.svg?branch=master)](https://travis-ci.org/PieLabs/pie-catalog)

## install 
```
npm install 
```

## Supported Browsers

* Firefox 51+
* chrome
* Safari 10.1+
* IE Edge


### backend dependencies

* mongodb - for storing metadata about the element from github and from the archive
* s3/cloudfront - for storing the demo assets in the archive - aka anything in `docs/demo/*`

## run 

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
| `--bucket`  | `S3_BUCKET` | undefined  | set the bucket name - the bucket must exist and be publicly accessible |
|`--prefix` | `S3_PREFIX` | 'app' | set the prefix for the app. All assets will be stored under this prefx within the given bucket. | 
|`--mongoUri` | `MONGO_URI` | mongodb://localhost:27017/pie-catalog  | the mongo uri |


* if `--bucket` isn't defined the app uses the local file system as the storage system for assets.


# endpoints

The app has 3 main areas of functionality: 
* a ui client
* a simple api serving that client
* a store endpoint to which you send your archives 


### client 

just run the app and to to the root of the page, you'll see the client load up. If you don't have any elements stored - you'll just see an empty page. See below for instructions on how to store a pie archive.

### api 

as above when you run the app you'll see the client interacting with the api.

### store 

To create an archive for this app you'll need pie-cli. With that installed, `cd` to a pie that you want to put onto the catalog and: 

`pie pack -a catalog --createArchive` - this will create a `pie-item.tar.gz` with everything that the element needs to run.

`curl --request POST --data-binary "@pie-item.tar.gz" http://:host/store/ingest/:org/:repo/:semver` - this will send the tar to the app which will the extract the contents and store them in the backend 

To delete an element from the catalog run: `curl --request DELETE http://:host/api/element/:org/:repo`.

> Note: At the moment the catalog only ever holds 1 version of an element, so if you send in a newer version with the same org/repo name, the old version will be removed.

## test 

TODO...

```shell
npm test
```

## debug 

```shell 
./node_modules/.bin/ts-node --debug-brk src/index.ts
```

## deploying a preview version

To deploy a preview version of the app for others to look at run: 

```
gulp build
./deploy $name_of_heroku_app
```

You'll have to have the following set up on that heroku app: 

* `MONGO_URI` - a mongo uri to connect to.

This app uses the mongo db + a local `.file-store` so you'll need to have called `ingest` with a pie archive for this to run.
