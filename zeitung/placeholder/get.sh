#!/bin/bash

MAX=300
if [[ ! -z "$1" ]]; then
    MAX=$1
fi

for i in $( seq $MAX ); do
FILE=${i}.jpg
curl 'https://thispersondoesnotexist.com/image' -H 'authority: thispersondoesnotexist.com' -H 'pragma: no-cache' -H 'cache-control: no-cache' -H 'upgrade-insecure-requests: 1' -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.80 Safari/537.36' -H 'accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3' -H 'referer: https://thispersondoesnotexist.com/' -H 'accept-encoding: gzip, deflate, br' -H 'accept-language: en-US,en;q=0.9' --compressed -o $FILE
sleep 1
done
