# CLI

`node cli.js [option] [param]`

## -r

Recreates and reinitializes database tables: `node cli -r [all|motto|poll|profile|quote]`

## -d

Dump the database into a LaTeX-compatible format `node cli -d` (in the appropriate `zeitung` subdir)

## -U

Updates database values: `node cli -U [all|motto|poll|profile]`

## --user

Regenerates user password: `node cli --user [user_id]`
