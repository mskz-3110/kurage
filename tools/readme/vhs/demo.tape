Output docs/readme/demo.gif
Source tools/readme/vhs/.common.tape

Type "printf '\033[32m%s\033[0m\n' 'REPL'"
Enter
Sleep 1s
Type "npx -y kurage"
Enter
Sleep 3s
Ctrl+L

Type "kurage.log('debug', 'message');"
Enter
Sleep 3s
Type "kurage.color.$.set('debug', kurage.color.$.get('red'));"
Enter
Sleep 3s
Type "kurage.log('debug', 'message');"
Enter
Sleep 3s
Ctrl+L

Type ".exit"
Enter
Sleep 3s
Ctrl+L

Type "printf '\033[32m%s\033[0m\n' 'exec'"
Enter
Sleep 1s
Type "npx -y kurage exec cat scripts/log.js"
Enter
Sleep 5s
Ctrl+L

Type "printf '\033[32m%s\033[0m\n' 'run'"
Enter
Sleep 1s
Type "npx -y kurage run scripts/log.js"
Enter
Sleep 5s
Ctrl+L

Type "printf '\033[32m%s\033[0m\n' 'txcl'"
Enter
Sleep 1s
Type "printf '%s\n%s\n' '<!-- :$ node -v { -->' '<!-- :}-->' > .demo_txcl.md && cat .demo_txcl.md"
Enter
Sleep 1s
Type "npx -y kurage txcl < <(cat .demo_txcl.md)"
Enter
Sleep 5s
Ctrl+L
