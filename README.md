# Hixtory

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Build Status][travis-image]][travis-url]
[![Test Coverage][coveralls-image]][coveralls-url]
[![Dependencies][dependencies-image]][dependencies-url]
[![DevDependencies][devdependencies-image]][devdependencies-url]

[![NPM](https://nodei.co/npm/hixtory.png?downloads=true&downloadRank=true)](https://nodei.co/npm/hixtory/)

## Motivation

'hixtory' is design to be a flexible, fast and extensible universal logging library with multiple appenders.
There are many good logging libraries on the market like `winston` and `log4js`. Why did we created a new one? Answer is simple, they are not enough for our needs. We created `hixtory` to use in our enterprise level projects as logging core.

The key point of `hixtory` is maximum flexibility, which needs by multi modular applications like micro service SaaS servers.

`hixtory` has `Appenders` which work like transform streams. `winston` has Transports in same manner. Unlike `winston`, `hixtory`'s appenders can be used by multiple loggers and each logger can use same appender with different configuration.
Both `winston` and `hixtory` supports creating child loggers. `winston`'s child loggers can not be configured and just allows adding some meta data.
`hixtory`'s child loggers can be reconfigured. You can disable or reconfigure any ancestor appender, overwrite an appender or can add additional appenders.

## Usage

```javascript
const {createLogger, appenders, formatters} = require('hixtory');

const logger = createLogger({
  level: 'info', // Default level is info
  defaultMeta: {pid: 1},
  label: 'main',
  levels: 'npm', // Use one of preconfigured levels
  targets: {
    console: {
      appender: new appenders.ConsoleAppender(),
      format: formatters.printConsole() // Format data using console formatter which is an combination of many formats
    },
    file: {
      appender: new appenders.RollingFileAppender({
        filename: __dirname + '/errorlog.log'
      }),
      level: 'error',  // Overwrite default level
      format: formatters.printFile() // Format data using file formatter which is an combination of many formats
    }
  }
});

// Create a child logger
const child1 = logger.createChild({
  level: 'warn', // Default level is warn
  label: 'child1',
  targets: {
    file: false, // disable file appender
    console: { // overwrite console appender
      level: 'debug',
      format: [
        // Add data to metadata for just this appender
        formatters.add({
          label: 'child_debug1', // Overwrite label for this appender
          debugLevel: process.env.DEBUG
        }),
        formatters.upperCase('level', 'label'), // Convert level and label to uppercase characters  
        formatters.printJson()
      ] // User json formatter for appender
    },
    dateFile: {
      appender: new appenders.DateFileAppender({
        filename: __dirname + '/child.log'
      }),
      level: 'error', // Overwrite level
      format: formatters.printJson(),
      filter: (meta) => {
        // Only log if message includes ID:1001
        return meta.message.includes('ID:1001!');
      }
    }
  }
});

child1.info('Application starting');
child1.meta({service: 'db'}).info('Starting service');

```

___

## Table of contents

- [Logger](#logger)
  - [Creating logger](#logger)
  - [Configuring logger](#configuring-logger)
  - [Adding new targets in runtime](#adding-new-targets-in-runtime)
  - [Removing targets in runtime](#removing-targets-in-runtime)
  - [Setting logging levels in runtime](#setting-logging-levels-in-runtime)
  - [Setting default colors in runtime](#setting-default-colors-in-runtime)   
  - [Logging](#logging)
  - [Closing logger](#closing-logger)   
- [Formatters](#formatters)
  - [Using formatters](#using-formatters)
  - [Formatter propagation](#formatter-propagation)
  - [Build-in formatters](#build-in-formatters)  
- [Appenders](#appenders)    
  - [Creating custom appender](#creating-custom-appender)
___

## Logger

Hixtory module exposes `Logger` class and `createLogger()` method to construct a new logger.

`new Logger([options:Object])`

`createLogger([options:Object])`

- `options`: If `options` argument is present, [configure](#configuring-logger) method will be called on construct.

```javascript
const {createLogger} = require('hixtory');

const logger = createLogger({
  levels: 'syslog',
  level: 'info', // Default level is info
  targets: {
    console: new appenders.ConsoleAppender()    
  }
});
```


```javascript
const {Logger} = require('hixtory');

const logger = new Logger({
  level: 'info', // Default level is info
  targets: {
    console: new appenders.ConsoleAppender()    
  }
});
```


### Logger properties

Logger class has the following properties.

|Name         |Type |R/W|Description   |
|-------------|-----|---|---------------|
|children     |`Array<Logger>`|r|Returns array of child loggers |
|colors       |`{string: string}`|r|Returns default color values |
|isChild      |`boolean`|r|Returns if logger is a child logger |
|label        |`string`|r/w|Gets or sets default label of logger. Targets may overwrite this value.  |
|level        |`string`|r/w|Gets or sets default logging level. Targets may overwrite this value. |
|levels       |`object`|r|Returns Array of levels |
|parent       |`Logger`|r|If this logger is a child returns parent logger, null otherwise |
|root         |`Logger`|r|If this logger is a child returns root logger, self otherwise |
|targets      |`{string: Object}`|r|Returns logging targets |


#### Configuring logger

Logger.prototype.configure() method is used to configure the logger. Configuration can be changed in runtime.

`logger.configure(options:Object)`

- `options:Object`: An object representing options
  - `defaultMeta:Object` (optional): An object representing default meta-data of each log.
  - `levels:Array<string>` (optional): Array of levels ordering from high priority to low.
  - `label:string` (optional): A string representing default label value of each log.
  - `level:string` (optional): A string representing default level of targets. Default: `info`
  - `levels:string` (optional): Name of predefined levels descriptor (hixtory,npm,syslog etc). Note that predefined levels also contains color info.
  - `levels:Array<String>` (optional): Array of levels ordering from high priority to low.
  - `colors:Object` (optional): An object representing default color values
  - `targets:Object` (optional): An object representing log targets
  
```javascript
const logger = new Logger({
  defaultMeta: {id: 1},
  levels: ['emerg', 'alert', 'crit', 'error', 'warning', 'notice', 'info', 'debug'],
  level: 'info',
  label: 'MAIN',
  colors: {
    emerg: 'yellow bgRed',
    alert: 'yellow bgRed',
    crit: 'red bgYellow',
    error: 'red',
    warning: 'yellow',
    notice: 'yellow',
    info: 'green',
    verbose: 'cyan',
    debug: 'blue'
  }, 
  targets: {
    console: {
      appender: new appenders.ConsoleAppender(),
      label: 'CMAIN', // over-write label
      level: 'silly',
      format: Hixtory.formatters.printConsole()
    },
    file: {
      appender: new appenders.DateFileAppender(),
      level: 'error',
      format: Hixtory.formatters.printFile()
    }
  }
});
```  
  
#### Adding new targets in runtime

Logger.prototype.addTarget() method is used to add a new target the logger in runtime.

`logger.addTarget(name:string, options:Object): Logger`

- `name:string`: Name of the target.
- `options:Object`: An object representing options
  - `appender:Appender` (optional): An Appender instance. If value is not present, logger will make a deep lookup for parent targets till an appender instance found. 
  - `enabled:boolean` (optional): If true, logging will be enabled for this target, otherwise no log will be written to appender. Default: true
  - `format:Array<Function>` (optional): An array of formatter methods
  - `level:string` (optional): Logging level for this target. If value is not present, logger will make a deep lookup for parent targets. If no value found, logger's level will be used.
  - `filter:Function` (optional): A function for filtering logs. If function returns true log will be written, otherwise will be ignored.
    
- Return: This method returns this Logger for method chaining    

```javascript
logger.addTarget('mylogs', {
    appender: new appenders.ConsoleAppender(),
    label: 'CMAIN', // overwrite label
    level: 'silly', // overwrite level
    format: [
        Hixtory.formatters.timestamp('YYYYMMDDHHmmss'),
        Hixtory.formatters.upperCase('level', 'label'),
        Hixtory.formatters.add({sectionId: 'section1'})
        ],
    filter: (meta) => {
      // Ignore messages which includes "Server error" string
      return !meta.message.includes('Server error');    
    }            
})
```

#### Removing targets in runtime

Logger.prototype.removeTarget() method is used to remove a target from logger in runtime.

`logger.removeTarget(name:string): Logger`

- `name:string`: Name of the target.

- Return: This method returns this Logger for method chaining    


#### Creating child loggers

Logger.prototype.createChild() method is used to create a new child Logger in runtime.

`logger.createChild(options:Object): Logger`

- `name:string`: Name of the target.
- `options:Object`: An object representing options
  - `label:string` (optional): A string representing default label value of each log.
  - `level:string` (optional): A string representing default level of targets. Default: `info`
  - `targets:Object` (optional): An object representing log targets
    
- Return: This method returns new created child Logger   

```javascript
const logger = new Logger({
  level: 'error',
  targets: {
    console: {
      appender: new appenders.ConsoleAppender(),
      level: 'info',
      format: Hixtory.formatters.printConsole()
    },
    file: {
      appender: new appenders.DateFileAppender(),
      format: Hixtory.formatters.printFile()
    }
  }
});

logger.createChild({
    label: 'child1', // overwrite label
    level: 'warn', // overwrite level
    targets: {
      // extend console target from parent
      console: {
        level: 'debug' // Child logger will use debug level for console appender
      },
      file: {
        enabled: false // Child logger will not log to file of parent logger
      },
      file2: {  // Child logger will log to file using json formatter
        appender: new appenders.DateFileAppender(),
        format: Hixtory.formatters.json()
      }
    }                
})
```

#### Setting logging levels in runtime

Logger.prototype.setLevels() method is used to set logging levels in runtime.

##### Alternative use 1

`logger.setLevels(name:string): Logger`

- `name:string`: Name of predefined levels descriptor. Note that predefined levels also contains color info.

- Return: This method returns this Logger for method chaining    

|descriptor|Levels (from high priority to low)|
|----------|----------------------------------|
|hixtory   |fatal, error, warn, info, verbose, debug, trace|
|cli       |error, warn, help, data, info, debug, prompt, verbose, input, silly|
|npm       |error, warn, info, http, verbose, debug, silly|
|syslog    |emerg, alert, crit, error, warning, notice, info, debug|

````javascript
logger.setLevels('syslog');
````

##### Alternative use 2

`logger.setLevels(levels:Array<string>): Logger`

- `levels:Array<String>`: Array of levels ordering from high priority to low.

- Return: This method returns this Logger for method chaining    


````javascript
logger.setLevels(['emerg', 'alert', 'crit', 'error', 'warning',
      'notice', 'info', 'debug']);
````


#### Setting default colors in runtime

Logger.prototype.setColors() method is used to set default colors in runtime.

`logger.setColors(colors:object): Logger`

- `colors:object`: An object representing default color values.

- Return: This method returns this Logger for method chaining    

````javascript
logger.setColors({
    emerg: 'yellow bgRed',
    alert: 'yellow bgRed',
    crit: 'red bgYellow',
    error: 'red',
    warning: 'yellow',
    notice: 'yellow',
    info: 'green',
    verbose: 'cyan',
    debug: 'blue'
});
````


#### Logging

Writing log messages to appenders can be accomplished in one of two ways. You can pass a level name the Logger.prototype.log() method or use the level specified methods. 

`logger.log(level:string, message: string, ...args:*): Logger`

- `level:string`: Name of the log level
- `message:string`: Message text
- `...args:*`: Arguments to format message with util.format()

- Return: This method returns this Logger for method chaining    

````javascript
logger.log('error', 'Any error message. Code %s', 'E001');

logger.error('Any error message. Code %s', 'E001');

logger.error(new Error('Any error message'));

logger.info('Info: %s', 'This is an info message')
  .debug('%j', {debugdata: 12334});
````

##### Updating meta-data on logging

Logger has a `meta()` method to merge meta-data to log. This method allows over-writing and adding properties to meta-data. 

````javascript
logger.meta({id: 2, name: 'name1'}).info('Logging message');
logger.meta({label: 'LabelOverwrite'}).info('Logging message');
````

#### Closing logger

Logger.prototype.close() method is used to close the logger and its children.
`close` method also closes all appenders if appender is not attached to other logger.

`logger.close(): Promise`

````javascript
logger.close().then(() => process.exit());
````

___

## Formatters

Formatters are functions which process output data before written to appender. 


### Using formatters

Formatters are functions used by appenders to transform log data for output. Formatters can modify output data properties or return a new value.

`function(metadata, outdata, logger, appender)`

- `metadata:object`: An object representing original log data. The metadata object is frozen and can not be modified. 
- `outdata:*`: A clone of metadata or any value returned by previous formatter. 
- `logger:Logger`: The Logger instance 
- `appender:Appender`: The Appender instance 



```javascript
function customFormatter(metadata, outdata, logger, appender) {
  outdata.level = metadata.level.toUpperCase();
  outdata.message = outdata.message+ ': This is hixtory';
}
const logger = createLogger({
  targets: {
    console: {
      appender: new appenders.ConsoleAppender(),
      format: customFormatter
    }
  }
});
logger.info('Hello world');
``` 
```sh
{"level":"INFO","message":"Hello world: This is hixtory"}
```

```javascript
function customFormatter(metadata, outdata, logger, appender) {
  return outdata.level + '-' + outdata.message;
}
const logger = createLogger({
  targets: {
    console: {
      appender: new appenders.ConsoleAppender(),
      format: customFormatter
    }
  }
});
logger.info('Hello world');
``` 
```sh
info-Hello world
```

```javascript
function customFormatter(metadata, outdata, logger, appender) {
  return {
    lvl: outdata.level,
    msg: outdata.message
  };
}
const logger = createLogger({
  targets: {
    console: {
      appender: new appenders.ConsoleAppender(),
      format: customFormatter
    }
  }
});
logger.info('Hello world');
``` 
```sh
{"lvl":"info","msg":"Hello world"}
```


### Formatter propagation

It is possible to use an Array as formatter stack to perform propagation. Every Appender will call all formatter functions in the stack before writing to its target.  

````javascript
const logger = createLogger({
  targets: {
    console: {
      appender: new appenders.ConsoleAppender(),
      format: [
        // Add timestamp property
        (meta, out) => {
          out.time = new Date();
        },
        // format timestamp property
        (meta, out) => {
          out.time = fecha.format(out.time, 'YYYY-MM-DD');
        },
        // Convert object to string
        (meta, out) => {
          return out.time + '|' + out.level + '|' + out.message;
        },
        // Modify output string
        (meta, out) => {
          return '>> ' + out;
        }
      ]
    }
  }
});
logger.info('Hello world');
````

```sh
>> 2019-01-11|info|Hello world
```


### Build-in formatters

Hixtory has many [built-in](docs/builtin-formatters.md) formatter functions to help you writing logs with desired format. All build-in formatters can be accessed within `Hixtory.formatters`.
You can check additional [Built-in Formatters](docs/builtin-formatters.md) documentation for details.





## Appenders

Appenders are responsible for delivering log events to their destination. There are several [appenders](docs/appenders.md) available. `Hixtory` already accepts any [Writable](https://nodejs.org/api/stream.html#stream_writable_streams) instance as an appender. 

### Creating custom appender

Every Appender must implement [Writable](https://nodejs.org/api/stream.html#stream_writable_streams) interface.

However Hixtory exposes an abstract `Appender` class and core Appender classes to extend which is suggested for Appender developers. 

```javascript
const {Appender} = require('hixtory');
class MyConsoleAppender extends Appender {
  _write(chunk, encoding, callback) {
    try {
      const data = typeof chunk === 'object' ?
          JSON.stringify(chunk) : chunk;
      console.log(data);
    } finally {
      callback();
    }
  }
}
```

```javascript
const {appenders} = require('hixtory');
class RollingFileAppender extends appenders.StreamAppender {
  // This is called when appenders needs to create nested stream
  _createStream() {
    const options = this._options;
    return new RollingFileStream(
        options.filename,
        options.maxSize,
        options.numBackups, {
          compress: options.compress,
          keepFileExt: true
        });
  }
  // This is called when appender needs to transform data
  _transform(chunk) {
    return (typeof chunk === 'object' ?
        JSON.stringify(chunk, null, 2) : chunk) +
        /* istanbul ignore next */
        (process.platform === 'win32' ? '\r\n' : '\n');
  }
}
```

---

## Node Compatibility

  - node `>= 8.x`;
  
### License
[MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/hixtory.svg
[npm-url]: https://npmjs.org/package/hixtory
[travis-image]: https://img.shields.io/travis/hixtory/hixtory/master.svg
[travis-url]: https://travis-ci.org/hixtory/hixtory
[coveralls-image]: https://img.shields.io/coveralls/hixtory/hixtory/master.svg
[coveralls-url]: https://coveralls.io/r/hixtory/hixtory
[downloads-image]: https://img.shields.io/npm/dm/hixtory.svg
[downloads-url]: https://npmjs.org/package/hixtory
[gitter-image]: https://badges.gitter.im/hixtory/hixtory.svg
[gitter-url]: https://gitter.im/hixtory/hixtory?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge
[dependencies-image]: https://david-dm.org/hixtory/hixtory/status.svg
[dependencies-url]:https://david-dm.org/hixtory/hixtory
[devdependencies-image]: https://david-dm.org/hixtory/hixtory/dev-status.svg
[devdependencies-url]:https://david-dm.org/hixtory/hixtory?type=dev
[quality-image]: http://npm.packagequality.com/shield/hixtory.png
[quality-url]: http://packagequality.com/#?package=hixtory
