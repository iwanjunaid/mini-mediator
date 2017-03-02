mini-mediator
=============

Simple implementation of mediator pattern in Node.JS.

## Installation

```
npm install mini-mediator
```
## Usage

```
const Mediator = require('mini-mediator');
const mediator = new Mediator();

class MiniMath {
  setMediator(mediator) {
    this.mediator = mediator;
  }

  calculateAdd(firstVal, secondVal) {
    return firstVal + secondVal;
  }

  apiAdd(args, callback) {
    return callback(null, this.calculateAdd(args.firstVal, args.secondVal));
  }
}

class TheApp {
  setMediator(mediator) {
    this.mediator = mediator;
  }
  
  calculate5Plus3() {
    this.mediator.callApi('MiniMath', 'Add', {firstVal:5, secondVal:3}, function(err, result) {
      console.log(result);
    });
  }
}

const miniMath = new MiniMath();
const theApp = new TheApp();

mediator.register('MiniMath', miniMath);
mediator.register('TheApp', theApp);

theApp.calculate5Plus3();
```
