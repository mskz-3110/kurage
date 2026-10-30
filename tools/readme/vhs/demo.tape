Output docs/readme/demo.gif
Source tools/readme/vhs/.common.tape

Type "kurage exec node -v"
Enter
Type "kurage exec bun -v"
Enter
Type "kurage exec pnpm -v"
Enter
Type `kurage eval "kurage.logger.out(JSON.stringify({node: process.versions.node ?? '-', bun: process.versions.bun ?? '-'}));"`
Enter
Sleep 3s
Ctrl+L

Type "kurage"
Enter
Sleep 1s
Type `$.write("/tmp/versions.json", JSON.stringify({node: process.versions.node ?? '-', bun: process.versions.bun ?? '-'}));`
Enter
Type ".save /tmp/output-versions.js"
Enter
Type ".exit"
Enter
Type "kurage run /tmp/output-versions.js"
Enter
Type `printf '<!-- :< %s { -->\n<!-- :} -->\n' '/tmp/versions.json' | kurage txcl`
Enter
Sleep 5s
Ctrl+L
