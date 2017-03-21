const Mediator = require('../index');
const mediator = new Mediator();
const winston = require('winston');

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

class OtherComponent {
  setMediator(mediator) {
    this.mediator = mediator;
  }

  calculate5Plus3() {
    this.mediator.callApi('MiniMath', 'Add', {firstVal:5, secondVal:3}, function(err, result) {
      winston.log('info', result);
    });
  }
}

const miniMath = new MiniMath();
const otherComponent = new OtherComponent();

mediator.register('MiniMath', miniMath);
mediator.register('OtherComponent', otherComponent);

otherComponent.calculate5Plus3();
