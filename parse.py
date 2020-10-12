import json

users = json.loads(open("./users.json", "r").read())

for cid in users:
    clazz = users[cid]
    s = "Nutzername,Password"
    for user in clazz:
        s += f"\n{user['username']},{user['pwd']}"

    open(f"./{cid}.csv", "w").write(s)
