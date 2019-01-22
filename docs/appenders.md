
# Built-in Appenders

- [ConsoleAppender](#consoleappender)
- [StreamAppender](#streamappender)
- [RollingFileAppender](#rollingfileappender)
- [DateFileAppender](#datefileappender)

___




## ConsoleAppender

This appender sends log events to console.

```javascript
const {createLogger, appenders} = require('hixtory');
const logger = createLogger({
  targets: {
    console: {
      appender: new appenders.ConsoleAppender()    
    }
  }
});
```



 
## StreamAppender

This appender forwards log events to a nested `Writable` stream.

`new StreamAppender(options)`

- `options:object`:
  
  - `highWaterMark:number`: Specifies a total number of log events that will be buffered.
  - `stream:Writable`: Writable stream instance  


```javascript
const logger = createLogger({
  targets: {
    console: {
      appender: new appenders.StreamAppender({stream: streamInstance})
    }
  }
});
```
  



 
## DateFileAppender

This appender writes log events to file which rolled by date format. 

`new DateFileAppender(options)`

- `options:object`:
  
  - `highWaterMark:number=100`: Specifies a total number of log events that will be buffered.
  - `filename:string`: The path of the file where you want your logs written.
  - `compress:boolean=false`: Compress the backup files during rolling (backup files will have .gz extension).
  - `pattern:string='.YYYY-MM-DD'`: The pattern to use to determine when to roll the logs.
  - `daysToKeep:number=0`: If this value is greater than zero, then files older than that many days will be deleted during log rolling.
  - `alwaysIncludePattern:boolean=false`: Include the pattern in the name of the current log file as well as the backups.


```javascript
const logger = createLogger({
  targets: {
    file: {
      appender: new appenders.DateFileAppender({
          filename: 'access.log', 
          pattern: '-YYYYMMDD', 
          daysToKeep: 5})
    }
  }
});
```
  



 
## RollingFileAppender

This appender writes log events to file which rolled by file size. 

`new RollingFileAppender(options)`

- `options:object`:
  
  - `highWaterMark:number=100`: Specifies a total number of log events that will be buffered.
  - `filename:string`: The path of the file where you want your logs written.
  - `compress:boolean=false`: Compress the backup files during rolling (backup files will have .gz extension).
  - `maxSize:number`: The maximum size (in bytes) for the log file. If not specified, then no log rolling will happen.
  - `numBackups:number`: The number of old log files to keep during log rolling.


```javascript
const logger = createLogger({
  targets: {
    file: {
      appender: new appenders.RollingFileAppender({
          filename: 'access.log', 
          numBackups: 3})
    }
  }
});
```
