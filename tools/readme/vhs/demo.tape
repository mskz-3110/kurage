Output docs/readme/demo.gif
Source tools/readme/vhs/.common.tape

Type "node -v"
Enter

Type "kurage exec node -v"
Enter

Type "kurage exec-json node -e 'console.log(`log`);console.error(`error`);' | jq '.stdio | {stdout, stderr}'"
Enter

Sleep 5s
Ctrl+L
