# dogClient-script

Watch Dog client script to generate Tokens and send System Information to the watch Dog server.

## Execution
The above script does not require Node JS to run the application. I am using an npm, pkg, that packages node applications to JavaScript executables/binaries and this can be run on any target machine without Node.js installed.
It also allows cross-compilation.

### STEPS TO EXECUTE
Go to the terminal and type,

```
npm i
pkg app.js
```

This will generate binaries for Windows, Linux and Mac machines. Execute any of the binaries based on the OS you are using, for example, in case of Linux, type -
```
./app-linux
```
And the above script will execute. You can also uninstall Node JS from your machine and check for yourself that the binaries will execute even without it.
