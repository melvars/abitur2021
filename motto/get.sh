#!/usr/bin/env bash

grep -E '^(([A-Z].*[aA]|A)[bB]|B)([iI].*|)$' german.dic | grep -v '[aA]bitur' >list.txt
