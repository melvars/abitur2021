#!/usr/bin/env bash

grep -E '^(([A-Z].*[aA]|A)[bB]|B)([iI].*|)$' deutsch.txt | grep -v '[aA]bitur' >list.txt
