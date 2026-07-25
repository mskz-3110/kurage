Output docs/readme/repl.gif
Source tools/readme/vhs/.common.tape

Type "kurage"
Enter

Type "globalThis.kurage = (await import('kurage')).default;undefined;"
Enter

Type "kurage.process.cleanup();"
Enter

Type "await kurage.$(['node', '-v']);"
Enter

Type ".exit"
Enter

Sleep 5s
Ctrl+L
