[![Build Status](https://travis-ci.org/iwanjunaid/mini-mediator.svg?branch=master)](https://travis-ci.org/iwanjunaid/mini-mediator)

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
  setMediator(mediator, done) {
    this.mediator = mediator;
    done();
  }
  
  calculateAdd(firstVal, secondVal) {
    return firstVal + secondVal;
  }

  apiAdd(args, callback) {
    return callback(null, this.calculateAdd(args.firstVal, args.secondVal));
  }
}

class OtherComponent {
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
const otherComponent = new OtherComponent();

mediator.register('MiniMath', miniMath);
mediator.register('OtherComponent', otherComponent);

otherComponent.calculate5Plus3();
```
