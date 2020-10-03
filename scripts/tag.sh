#!/bin/bash
if [ $# -ne 1 ]; then
  echo "please input new version. e.g. 1.0.0"
  exit 1
fi
sed -ie "s/\"version\": \".*\"/\"version\": \"${1}\"/" package.json