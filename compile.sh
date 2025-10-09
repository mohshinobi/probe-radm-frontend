#!/bin/bash
set -e

npm install
ng build --configuration=production
