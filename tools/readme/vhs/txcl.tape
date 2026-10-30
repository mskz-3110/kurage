Output docs/readme/txcl.gif
Source tools/readme/vhs/.common.tape

Type "printf '1\n2\n3\n' | tee /tmp/txcl.txt"
Enter
Sleep 1s

Type "kurage txcl < <(printf '<!-- :< %s { -->\n<!-- :} -->\n' '/tmp/txcl.txt')"
Enter
Sleep 5s
Ctrl+L
