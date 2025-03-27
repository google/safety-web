#!/bin/sh

TMP_OUT_DIR=`mktemp -d `

function cleanupTmpDir {
    rm -rf "$TMP_OUT_DIR"
}

trap cleanupTmpDir EXIT

yarn exec protoc --ts_out "$TMP_OUT_DIR" --proto_path . index.proto pipeline.proto

if cmp -s "./index.ts" "$TMP_OUT_DIR/index.ts"; then
  echo "index is up to date"
else
  echo "Error: index.ts is not up-to-date. Please regenerate it using protoc."
  exit 1
fi

if cmp -s "./pipeline.ts" "$TMP_OUT_DIR/pipeline.ts"; then
  echo "pipeline is up to date"
else
  echo "Error: pipeline.ts is not up-to-date. Please regenerate it using protoc."
  exit 1
fi
