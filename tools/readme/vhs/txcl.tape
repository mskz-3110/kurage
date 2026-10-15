Output docs/readme/txcl.gif
Source tools/readme/vhs/.common.tape

Type "printf '%s\n%s\n' '<!-- :$ node -v {``` -->' '<!-- :}```-->' | tee /tmp/txcl.txt"
Enter
Sleep 1s

Type "kurage txcl < <(cat /tmp/txcl.txt)"
Enter
Sleep 5s
Ctrl+L
